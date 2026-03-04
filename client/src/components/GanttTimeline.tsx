import { useState, useEffect, useRef } from "react";
import { usePinch } from "@use-gesture/react";
import type { TimeRange } from "../types/TimeRange";
import "../styles/gantt.css";
import { generateTimeTicks } from "../utils/TimeScale";
import type { Assignment } from "../types/Assignments";
import { minutes, days, snapTo } from "../utils/time";


type Props = {
    from: Date;
    to: Date;
    availability: TimeRange[];
    assignment: Assignment[];
}


export function GanttTimeline({
    from,
    to,
    availability,
    assignment
}: Props) {

    const fromMs = from.getTime();
    const toMs = to.getTime();
    const totalRangeMs = toMs - fromMs;
    const ticks = generateTimeTicks(from, to);
    const multipleDays = totalRangeMs > days(1);
    const SNAP = minutes(15);


    const [now, setNow] = useState(new Date());
    const [zoom, setZoom] = useState(1);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [localAssignment, setLocalAssignment] = useState<Assignment[]>(assignment);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const zoomRef = useRef(1);
    const dragStartX = useRef(0);
    const dragOriginalRange = useRef<TimeRange | null>(null);

    const baseWidth = 1200;
    const timelineWidth = baseWidth * zoom;

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

    function handleMouseDown(
        e: React.MouseEvent,
        index: number,
        range: TimeRange
    ) {
        dragStartX.current = e.clientX;
        dragOriginalRange.current = range;
        setDraggingIndex(index);
    }

    useEffect(() => {
        setLocalAssignment(assignment);
    }, [assignment]);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (draggingIndex === null) return;

        function handleMouseMove(e: MouseEvent) {
            if (!dragOriginalRange.current || draggingIndex === null) return;

            const deltaPx = e.clientX - dragStartX.current;
            const deltaMs = deltaPx * (totalRangeMs / timelineWidth);

            const original = dragOriginalRange.current;
            const duration = new Date(original.end).getTime() - new Date(original.start).getTime();

            const rawStart = new Date(original.start).getTime() + deltaMs;

            const snappedStart = snapTo(rawStart, SNAP);

            const newStartMs = Math.max(fromMs, Math.min(toMs - duration,
                snappedStart
            ));
            const newEndMs = newStartMs + duration;

            setLocalAssignment(prev => {
                const updated = [...prev];

                const isConflict = updated.some((other, i) => {
                    if (i === draggingIndex) return false;

                    const otherStart = new Date(other.start).getTime();
                    const otherEnd = new Date(other.end).getTime();

                    return overlpas(newStartMs, newEndMs, otherStart, otherEnd);
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
            setDraggingIndex(null);
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [draggingIndex, totalRangeMs, timelineWidth, fromMs, toMs]);

    function formatRange(start: string, end: string) {
        const s = new Date(start);
        const e = new Date(end);

        return `
            ${s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
            ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        `;
    }

    function overlpas(aStart: number, aEnd: number, bStart: number, bEnd: number) {
        return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
    }

    const bindPinch = usePinch(
        ({ origin: [ox], offset: [scale], memo, first, event }) => {
            event?.preventDefault();
            if (!containerRef.current) return;

            const initZoom: number = first ? zoomRef.current : memo;
            const newZoom = Math.min(Math.max(initZoom * scale, 0.5), 5);

            const container = containerRef.current;
            const { left: rectLeft } = container.getBoundingClientRect();
            const mouseX = ox - rectLeft;
            const offsetX = mouseX + container.scrollLeft;

            const prevWidth = baseWidth * zoomRef.current;
            const newWidth = baseWidth * newZoom;
            container.scrollLeft = offsetX * (newWidth / prevWidth) - mouseX;

            zoomRef.current = newZoom;
            setZoom(newZoom);

            return initZoom;
        },
        {
            pinchOnWheel: true,
            preventDefault: true,
            pointer: { touch: true },
            eventOptions: { passive: false }
        }
    );

    const nowMs = now.getTime();
    const isNowVisible = nowMs >= fromMs && nowMs <= toMs;

    const nowLeft = isNowVisible
        ? ((nowMs - fromMs) / totalRangeMs) * timelineWidth
        : 0;

    const labelLeft = nowLeft - scrollLeft;
    const labelVisible = isNowVisible && labelLeft >= 0 && labelLeft <= (containerRef.current?.clientWidth ?? 0);

    return (
        <div className="gantt-wrapper">
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
                                />
                            );
                        })}

                        {localAssignment.map((slot, i) => {
                            const { left, width } = getPosition(slot);
                            return (
                                <div
                                    onMouseDown={(e) => handleMouseDown(e, i, slot)}
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
                                </div>
                            );
                        })}

                    </div>
                </div>

            </div>
        </div>
    );
}