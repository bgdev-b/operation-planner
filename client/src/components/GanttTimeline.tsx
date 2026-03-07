import { useState, useEffect, useRef } from "react";
import type { TimeRange } from "../types/TimeRange";
import "../styles/gantt.css";
import { generateTimeTicks } from "../utils/TimeScale";
import type { Assignment } from "../types/Assignments";
import { minutes, days } from "../utils/time";
import { useAssignmentDrag } from "../hooks/useAssignmentDrag";
import { useTimelineZoom } from "../hooks/useTimelineZoom";


type Props = {
    resourceId: string;
    from: Date;
    to: Date;
    availability: TimeRange[];
    assignment: Assignment[];
    onAssignmentCreated?: () => void | Promise<void>;
}


export function GanttTimeline({
    resourceId,
    from,
    to,
    availability,
    assignment,
    onAssignmentCreated,
}: Props) {

    const fromMs = from.getTime();
    const toMs = to.getTime();
    const totalRangeMs = toMs - fromMs;
    const ticks = generateTimeTicks(from, to);
    const multipleDays = totalRangeMs > days(1);
    const SNAP = minutes(15);


    const [now, setNow] = useState(new Date());
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isAwaitingTaskId, setIsAwaitingTaskId] = useState(false);
    const [newTaskId, setNewTaskId] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement | null>(null);

    const baseWidth = 1200;
    const { zoom, containerRef, bindPinch } = useTimelineZoom({ baseWidth });
    const timelineWidth = baseWidth * zoom;

    const {
        localAssignment,
        draggingIndex,
        creationRange,
        isCreating,
        startDrag,
        startResize,
        beginCreate,
        updateCreate,
        cancelCreate,
        commitCreate,
        deleteAssignmentByIndex,
    } = useAssignmentDrag({
        assignment,
        resourceId,
        fromMs,
        toMs,
        totalRangeMs,
        timelineWidth,
        snapMs: SNAP,
        onAssignmentCreated,
    });

    function formatTick(tick: Date) {
        if (multipleDays) {
            return tick.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        }
        return tick.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }

    function getTickLeft(tick: Date) {
        return ((tick.getTime() - fromMs) / totalRangeMs) * timelineWidth;
    }

    function getPosition(range: TimeRange) {
        const start = new Date(range.start).getTime();
        const end = new Date(range.end).getTime();
        const left = ((start - fromMs) / totalRangeMs) * timelineWidth;
        const width = ((end - start) / totalRangeMs) * timelineWidth;
        return { left, width };
    }

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(interval);
    }, []);

    function formatRange(start: string, end: string) {
        const s = new Date(start);
        const e = new Date(end);

        return `${s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    function getMouseTimelineMs(clientX: number) {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = clientX - rect.left + containerRef.current.scrollLeft;
        return fromMs + (mouseX / timelineWidth) * totalRangeMs;
    }

    function handleAvailabilityMouseDown(e: React.MouseEvent) {
        e.preventDefault();
        setCreateError(null);
        setIsAwaitingTaskId(false);
        const clickedMs = getMouseTimelineMs(e.clientX);
        if (clickedMs === undefined) return;
        beginCreate(clickedMs);
    }

    useEffect(() => {
        if (!isCreating || isAwaitingTaskId) return;

        function handleMouseMove(e: MouseEvent) {
            const atMs = getMouseTimelineMs(e.clientX);
            if (atMs === undefined) return;
            updateCreate(atMs);
        }

        function handleMouseUp() {
            setIsAwaitingTaskId(true);
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isCreating, isAwaitingTaskId, timelineWidth, totalRangeMs, fromMs, updateCreate]);

    async function handleCreateConfirm() {
        setCreateError(null);

        if (!newTaskId.trim()) {
            setCreateError("Task ID is required.");
            return;
        }

        const windowScrollX = window.scrollX;
        const windowScrollY = window.scrollY;
        const timelineScrollLeft = containerRef.current?.scrollLeft ?? 0;

        try {
            const created = await commitCreate(newTaskId);
            if (!created) {
                setCreateError("Could not create: the range is invalid or conflicts with an existing assignment.");
                return;
            }

            requestAnimationFrame(() => {
                window.scrollTo(windowScrollX, windowScrollY);
                if (containerRef.current) {
                    containerRef.current.scrollLeft = timelineScrollLeft;
                }
            });

            setNewTaskId("");
            setIsAwaitingTaskId(false);
        } catch {
            setCreateError("Could not create assignment.");
        }
    }

    function handleTaskIdKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            void handleCreateConfirm();
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            handleCreateCancel();
        }
    }

    function handleCreateCancel() {
        cancelCreate();
        setNewTaskId("");
        setCreateError(null);
        setIsAwaitingTaskId(false);
    }

    function handleAssignmentRightClick(e: React.MouseEvent, index: number) {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            index,
        });
    }

    async function handleContextDelete() {
        if (!contextMenu) return;

        setCreateError(null);

        try {
            await deleteAssignmentByIndex(contextMenu.index);
            setContextMenu(null);
        } catch {
            setCreateError("Could not delete assignment.");
            setContextMenu(null);
        }
    }

    useEffect(() => {
        if (!contextMenu) return;

        function handleGlobalMouseDown(e: MouseEvent) {
            if (contextMenuRef.current?.contains(e.target as Node)) {
                return;
            }
            setContextMenu(null);
        }

        function handleGlobalKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setContextMenu(null);
            }
        }

        window.addEventListener("mousedown", handleGlobalMouseDown);
        window.addEventListener("keydown", handleGlobalKeyDown);

        return () => {
            window.removeEventListener("mousedown", handleGlobalMouseDown);
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [contextMenu]);

    const nowMs = now.getTime();
    const isNowVisible = nowMs >= fromMs && nowMs <= toMs;

    const nowLeft = isNowVisible
        ? ((nowMs - fromMs) / totalRangeMs) * timelineWidth
        : 0;

    const labelLeft = nowLeft - scrollLeft;
    const labelVisible = isNowVisible && labelLeft >= 0 && labelLeft <= (containerRef.current?.clientWidth ?? 0);

    return (
        <div className="gantt-wrapper">
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="assignment-context-menu"
                    style={{
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`,
                    }}
                >
                    <button
                        type="button"
                        className="assignment-context-delete"
                        onClick={() => void handleContextDelete()}
                    >
                        Delete task
                    </button>
                </div>
            )}
            {isAwaitingTaskId && creationRange && (
                <div className="create-assignment-panel">
                    <label className="create-assignment-label" htmlFor="new-task-id-input">
                        Task ID
                    </label>
                    <input
                        id="new-task-id-input"
                        className="create-assignment-input"
                        value={newTaskId}
                        onChange={(e) => setNewTaskId(e.target.value)}
                        onKeyDown={handleTaskIdKeyDown}
                        placeholder="Example: TASK-123"
                        autoFocus
                    />
                    {createError && <div className="create-assignment-error">{createError}</div>}
                    <div className="create-assignment-actions">
                        <button type="button" onClick={handleCreateConfirm}>Create</button>
                        <button type="button" onClick={handleCreateCancel}>Cancel</button>
                    </div>
                </div>
            )}
            {labelVisible && (
                <div
                    className="now-label-above"
                    style={{ left: `${labelLeft}px` }}
                >
                    {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </div>
            )}
            <div
                {...bindPinch()}
                ref={containerRef}
                className="gantt-container"
                onScroll={(e) => setScrollLeft((e.target as HTMLDivElement).scrollLeft)}
            >
                <div
                    className="gantt-inner"
                    style={{
                        width: `${timelineWidth}px`,
                        position: "relative",
                    }}
                >

                    <div className="timescale">
                        {ticks.map((tick, i) => {
                            const tickLeft = getTickLeft(tick);
                            const isLast = i === ticks.length - 1;
                            const isFirst = tickLeft < 30;
                            const transform = isLast
                                ? "translateX(-100%)"
                                : isFirst
                                    ? "translateX(0)"
                                    : "translateX(-50%)";
                            return (
                                <div
                                    key={tick.toISOString()}
                                    className="tick"
                                    style={{ left: `${tickLeft}px`, transform }}
                                >
                                    {formatTick(tick)}
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid-layer">
                        {ticks.map((tick) => (
                            <div
                                key={`grid-${tick.toISOString()}`}
                                className="grid-line"
                                style={{ left: `${getTickLeft(tick)}px` }}
                            />
                        ))}
                    </div>

                    {isNowVisible && (
                        <div
                            className="now-line"
                            style={{ left: `${nowLeft}px` }}
                        />
                    )}

                    <div className="gantt-track">

                        {availability.map((slot, i) => {
                            const { left, width } = getPosition(slot);
                            return (
                                <div
                                    key={`availability-${i}`}
                                    className="gantt-availability"
                                    style={{
                                        left: `${left}px`,
                                        width: `${width}px`
                                    }}
                                    onMouseDown={handleAvailabilityMouseDown}
                                />
                            );
                        })}

                        {localAssignment.map((slot, i) => {
                            const { left, width } = getPosition(slot);
                            return (
                                <div
                                    onMouseDown={(e) => startDrag(e, i, slot)}
                                    onContextMenu={(e) => void handleAssignmentRightClick(e, i)}
                                    key={`assignment-${i}`}
                                    className={`gantt-assignment ${draggingIndex === i ? 'dragging' : ""}`}
                                    style={{
                                        left: `${left}px`,
                                        width: `${width}px`
                                    }}
                                >
                                    <span className="assignment-label">
                                        {slot.taskId}
                                        {" "}
                                        {formatRange(slot.start, slot.end)}
                                    </span>

                                    <div
                                        className="resize-handle start"
                                        onMouseDown={(e) => startResize(e, i, slot, "start")}
                                    />
                                    <div
                                        className="resize-handle end"
                                        onMouseDown={(e) => startResize(e, i, slot, "end")}
                                    />

                                </div>
                            );
                        })}

                        {creationRange && (() => {
                            const { left, width } = getPosition(creationRange);
                            return (
                                <div
                                    className="gantt-creation-preview"
                                    style={{
                                        left: `${left}px`,
                                        width: `${width}px`,
                                    }}
                                />
                            );
                        })()}

                    </div>
                </div>

            </div>
        </div>
    );
}