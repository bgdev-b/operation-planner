
import { TimeRange } from "./TimeRange.js";

export function minutesBetween(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / 60000);
}

export function FormatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remaining = Math.floor(minutes % 60);
    return `${hours}h ${remaining}m`;
}

export function clipRange(
    range: TimeRange,
    from: Date,
    to: Date
): TimeRange | null {

    const start =
        new Date(Math.max(range.start.getTime(),
            from.getTime()
        ));

    const end =
        new Date(Math.min(range.end.getTime(),
            to.getTime()
        ));

    if (start >= end) return null;
    return { start, end };
}

