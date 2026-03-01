import { useState, useEffect, useRef } from "react";
import { usePinch } from "@use-gesture/react";
import type { TimeRange } from "../types/TimeRange";
import "../styles/gantt.css";
import { generateTimeTicks } from "../utils/TimeScale";


type Props = {
    from: Date;
    to: Date;
    availability: TimeRange[];
    assignment: TimeRange[];
}


export function GanttTimeline({
    from,
    to,
    availability,
    assignment
}: Props) {

    const totalRangeMs = to.getTime() - from.getTime();
    const ticks = generateTimeTicks(from, to);
    const MultipleDays = totalRangeMs > 24 * 60 * 60 * 1000;

    const [now, setNow] = useState(new Date());
    const [zoom, setZoom] = useState(1);
    const [scrollLeft, setScrollLeft] = useState(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const zoomRef = useRef(1);

    const baseWidth = 1200;
    const timelineWidth = baseWidth * zoom;

    function formatTick(tick: Date) {
        if (MultipleDays) {
            return tick.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        }
        return tick.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }

    function getTickLeft(tick: Date) {
        return ((tick.getTime() - from.getTime()) / totalRangeMs) * timelineWidth;
    }

    function getPosition(range: TimeRange) {
        const start = new Date(range.start).getTime();
        const end = new Date(range.end).getTime();

        const left = ((start - from.getTime()) / totalRangeMs) * timelineWidth;
        const width = ((end - start) / totalRangeMs) * timelineWidth;

        return { left, width };
    }

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(interval);
    }, []);

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

    const fromMs = from.getTime();
    const toMs = to.getTime();

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

                        {assignment.map((slot, i) => {
                            const { left, width } = getPosition(slot);
                            return (
                                <div
                                    key={`assignment-${i}`}
                                    className="gantt-assignment"
                                    style={{
                                        left: `${left}px`,
                                        width: `${width}px`
                                    }}
                                />
                            );
                        })}

                    </div>
                </div>

            </div>
        </div>
    );
}