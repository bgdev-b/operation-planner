import { TimeRange } from "./TimeRange.js";

export function mergeIntervals(intervals: TimeRange[]): TimeRange[] {
    if (intervals.length === 0) return [];

    const sorted = [...intervals].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
    );

    const merged: TimeRange[] = [];
    let current = sorted[0]!;

    for (let i = 1; i < sorted.length; i++) {
        const next = sorted[i]!;

        if (next.start.getTime() <= current.end.getTime()) {
            current = {
                start: current.start,
                end: new Date(Math.max(current.end.getTime(), next.end.getTime()))
            };
        } else {
            merged.push(current);
            current = next;
        }
    }

    merged.push(current);

    return merged;
}