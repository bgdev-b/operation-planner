import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { Assignment } from "../types/Assignments";
import type { TimeRange } from "../types/TimeRange";
import { snapTo } from "../utils/time";
import { createAssignment, deleteAssignment, updateAssignment } from "../api/assignments";

type ResizeMode = "start" | "end" | null;

type UseAssignmentDragParams = {
    assignment: Assignment[];
    resourceId: string;
    fromMs: number;
    toMs: number;
    totalRangeMs: number;
    timelineWidth: number;
    snapMs: number;
    onAssignmentCreated?: () => void | Promise<void>;
};

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
    return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export function useAssignmentDrag({
    assignment,
    resourceId,
    fromMs,
    toMs,
    totalRangeMs,
    timelineWidth,
    snapMs,
    onAssignmentCreated,
}: UseAssignmentDragParams) {
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [resizeMode, setResizeMode] = useState<ResizeMode>(null);
    const [localAssignment, setLocalAssignment] = useState<Assignment[]>(assignment);
    const [creationRange, setCreationRange] = useState<TimeRange | null>(null);
    const dragStartX = useRef(0);
    const dragOriginalRange = useRef<TimeRange | null>(null);
    const localAssignmentRef = useRef(localAssignment);
    const creationStartMsRef = useRef<number | null>(null);

    useEffect(() => {
        setLocalAssignment(assignment);
    }, [assignment]);

    useEffect(() => {
        localAssignmentRef.current = localAssignment;
    }, [localAssignment]);

    useEffect(() => {
        if (draggingIndex === null) return;

        function handleMouseMove(e: MouseEvent) {
            if (!dragOriginalRange.current || draggingIndex === null) return;

            const deltaPx = e.clientX - dragStartX.current;
            const deltaMs = deltaPx * (totalRangeMs / timelineWidth);

            const original = dragOriginalRange.current;
            const originalStart = new Date(original.start).getTime();
            const originalEnd = new Date(original.end).getTime();
            const duration = originalEnd - originalStart;

            let newStartMs: number;
            let newEndMs: number;

            if (resizeMode === "start") {
                const rawStart = originalStart + deltaMs;
                const snappedStart = snapTo(rawStart, snapMs);

                newStartMs = Math.min(
                    originalEnd - snapMs,
                    Math.max(fromMs, snappedStart)
                );

                newEndMs = originalEnd;
            } else if (resizeMode === "end") {
                const rawEnd = originalEnd + deltaMs;
                const snappedEnd = snapTo(rawEnd, snapMs);

                newEndMs = Math.max(
                    originalStart + snapMs,
                    Math.min(toMs, snappedEnd)
                );

                newStartMs = originalStart;
            } else {
                const rawStart = originalStart + deltaMs;
                const snappedStart = snapTo(rawStart, snapMs);

                newStartMs = Math.max(
                    fromMs,
                    Math.min(toMs - duration, snappedStart)
                );

                newEndMs = newStartMs + duration;
            }

            setLocalAssignment((prev) => {
                const updated = [...prev];

                const isConflict = updated.some((other, i) => {
                    if (i === draggingIndex) return false;

                    const otherStart = new Date(other.start).getTime();
                    const otherEnd = new Date(other.end).getTime();

                    return overlaps(newStartMs, newEndMs, otherStart, otherEnd);
                });

                if (isConflict) {
                    return prev;
                }

                updated[draggingIndex] = {
                    ...updated[draggingIndex],
                    start: new Date(newStartMs).toISOString(),
                    end: new Date(newEndMs).toISOString(),
                };
                return updated;
            });
        }

        function handleMouseUp() {
            if (draggingIndex === null || !dragOriginalRange.current) {
                setDraggingIndex(null);
                setResizeMode(null);
                dragOriginalRange.current = null;
                return;
            }

            const moved = localAssignmentRef.current[draggingIndex];
            const original = dragOriginalRange.current;

            const changed = moved.start !== original.start || moved.end !== original.end;

            if (changed) {
                updateAssignment(
                    moved.taskId,
                    moved.resourceId,
                    original.start,
                    original.end,
                    moved.start,
                    moved.end
                ).catch(console.error);
            }

            setDraggingIndex(null);
            setResizeMode(null);
            dragOriginalRange.current = null;
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [draggingIndex, resizeMode, totalRangeMs, timelineWidth, fromMs, toMs, snapMs]);

    function startDrag(e: ReactMouseEvent, index: number, range: TimeRange) {
        dragStartX.current = e.clientX;
        dragOriginalRange.current = range;
        setResizeMode(null);
        setDraggingIndex(index);
    }

    function startResize(e: ReactMouseEvent, index: number, range: TimeRange, mode: Exclude<ResizeMode, null>) {
        e.stopPropagation();
        dragStartX.current = e.clientX;
        dragOriginalRange.current = range;
        setResizeMode(mode);
        setDraggingIndex(index);
    }

    function clampToTimeline(ms: number) {
        return Math.max(fromMs, Math.min(toMs, ms));
    }

    function normalizeRange(aMs: number, bMs: number) {
        const a = clampToTimeline(snapTo(aMs, snapMs));
        const b = clampToTimeline(snapTo(bMs, snapMs));

        let startMs = Math.min(a, b);
        let endMs = Math.max(a, b);

        if (endMs - startMs < snapMs) {
            endMs = Math.min(toMs, startMs + snapMs);
            if (endMs - startMs < snapMs) {
                startMs = Math.max(fromMs, endMs - snapMs);
            }
        }

        return { startMs, endMs };
    }

    function beginCreate(atMs: number) {
        const snapped = clampToTimeline(snapTo(atMs, snapMs));
        creationStartMsRef.current = snapped;

        const endMs = Math.min(toMs, snapped + snapMs);
        setCreationRange({
            start: new Date(snapped).toISOString(),
            end: new Date(endMs).toISOString(),
        });
    }

    function updateCreate(atMs: number) {
        if (creationStartMsRef.current === null) return;

        const { startMs, endMs } = normalizeRange(creationStartMsRef.current, atMs);
        setCreationRange({
            start: new Date(startMs).toISOString(),
            end: new Date(endMs).toISOString(),
        });
    }

    function cancelCreate() {
        creationStartMsRef.current = null;
        setCreationRange(null);
    }

    async function commitCreate(taskId: string) {
        const normalizedTaskId = taskId.trim();
        if (!normalizedTaskId || !creationRange) return false;

        const startMs = new Date(creationRange.start).getTime();
        const endMs = new Date(creationRange.end).getTime();

        const isConflict = localAssignmentRef.current.some((other) => {
            const otherStart = new Date(other.start).getTime();
            const otherEnd = new Date(other.end).getTime();
            return overlaps(startMs, endMs, otherStart, otherEnd);
        });

        if (isConflict) return false;

        const start = new Date(startMs).toISOString();
        const end = new Date(endMs).toISOString();

        await createAssignment(normalizedTaskId, resourceId, start, end);

        setLocalAssignment((prev) => [
            ...prev,
            {
                id: `${normalizedTaskId}-${startMs}`,
                taskId: normalizedTaskId,
                resourceId,
                start,
                end,
            },
        ]);

        if (onAssignmentCreated) {
            await onAssignmentCreated();
        }

        cancelCreate();

        return true;
    }

    async function deleteAssignmentByIndex(index: number) {
        const target = localAssignmentRef.current[index];
        if (!target) return false;

        await deleteAssignment(
            target.taskId,
            target.resourceId,
            target.start,
            target.end
        );

        setLocalAssignment((prev) => prev.filter((_, i) => i !== index));

        if (onAssignmentCreated) {
            await onAssignmentCreated();
        }

        return true;
    }

    return {
        localAssignment,
        draggingIndex,
        creationRange,
        isCreating: creationRange !== null,
        startDrag,
        startResize,
        beginCreate,
        updateCreate,
        cancelCreate,
        commitCreate,
        deleteAssignmentByIndex,
    };
}
