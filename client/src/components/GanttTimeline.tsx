import { useState, useEffect, useRef } from "react";
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

        const left =
            ((start - from.getTime()) / totalRangeMs) * timelineWidth;

        const width =
            ((end - start) / totalRangeMs) * timelineWidth;

        return { left, width };
    }

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(interval);
    }, []);

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
                ref={containerRef}
                className="gantt-container"
                onScroll={(e) => setScrollLeft((e.target as HTMLDivElement).scrollLeft)}
                onWheel={(e) => {
                    if (e.ctrlKey || !containerRef.current) return;

                    e.preventDefault();

                    const container = containerRef.current;

                    const { left: rectLeft } = container.getBoundingClientRect();
                    const mouseX = e.clientX - rectLeft;

                    const { scrollLeft } = container;
                    const offsetX = mouseX + scrollLeft;

                    const zoomFactor = 1 + (e.deltaY * -0.001);
                    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.5), 5);

                    const newTimelineWidth = baseWidth * newZoom;
                    const scale = newTimelineWidth / timelineWidth;

                    container.scrollLeft = offsetX * scale - mouseX;

                    setZoom(newZoom);
                }}
            >
                <div
                    className="gantt-inner"
                    style={{
                        width: `${timelineWidth}px`,
                        position: "relative",
                        paddingRight: "60px"
                    }}
                >

                    <div className="timescale">
                        {ticks.map((tick) => {
                            const tickLeft = getTickLeft(tick);
                            const transform =
                                tickLeft < 30
                                    ? "translateX(0)"
                                    : tickLeft > timelineWidth - 30
                                        ? "translateX(-100%)"
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