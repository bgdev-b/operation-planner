import { TimeRange } from "./TimeRange.js";
import { mergeIntervals } from "./MergeIntervals.js";
export function calculateAvailability(
    baseAvailability: TimeRange[],
    assignments: TimeRange[],
    from: Date,
    to: Date
): TimeRange[] {

    const normalizedAvailability = mergeIntervals(baseAvailability);

    const clippedAvailability = normalizedAvailability
        .map(range => ({
            start: new Date(Math.max(range.start.getTime(), from.getTime())),
            end: new Date(Math.min(range.end.getTime(), to.getTime())),
        }))
        .filter(range => range.start < range.end);

    const assignmentInRange = assignments
        .filter(a => a.end > from && a.start < to)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    const freeSlot: TimeRange[] = [];

    for (const clip of clippedAvailability) {
        let cursor = clip.start;

        for (const assigned of assignmentInRange) {
            if (assigned.start > cursor) {
                freeSlot.push({
                    start: cursor,
                    end: assigned.start
                });
            }

            if (assigned.end > cursor) {
                cursor = assigned.end;
            }
        }

        if (cursor < clip.end) {
            freeSlot.push({
                start: cursor,
                end: clip.end
            });
        }
    }

    return freeSlot;

} 