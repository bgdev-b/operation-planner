import { TimeRange } from "./TimeRange.js";
import { mergeIntervals } from "./MergeIntervals.js";
import { clipRange } from "./TimeUtils.js";

export type AvailabilityResult = {
    freeSlot: TimeRange[];
    clippedAvailability: TimeRange[];
}

export function calculateAvailability(
    baseAvailability: TimeRange[],
    assignments: TimeRange[],
    from: Date,
    to: Date
): AvailabilityResult {


    const normalizedAvailability = mergeIntervals(baseAvailability);

    const clippedAvailability = normalizedAvailability
        .map(slot => clipRange(slot, from, to))
        .filter((slot): slot is TimeRange => slot !== null);


    const clippedAssignments = assignments
        .map(a => clipRange(a, from, to))
        .filter((a): a is TimeRange => a !== null)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    const freeSlot: TimeRange[] = [];

    for (const availability of clippedAvailability) {

        let cursor = availability.start;

        const relevantAssignments = clippedAssignments
            .filter(a => a.start < availability.end && a.end > availability.start)
            .map(a => ({
                start: new Date(Math.max(a.start.getTime(), availability.start.getTime())),
                end: new Date(Math.min(a.end.getTime(), availability.end.getTime()))
            }));

        for (const assignment of relevantAssignments) {

            if (assignment.start > cursor) {
                freeSlot.push({
                    start: cursor,
                    end: assignment.start
                });
            }

            if (assignment.end > cursor) {
                cursor = assignment.end;
            }
        }

        if (cursor < availability.end) {
            freeSlot.push({
                start: cursor,
                end: availability.end
            });
        }
    }

    return {
        freeSlot,
        clippedAvailability
    };
}