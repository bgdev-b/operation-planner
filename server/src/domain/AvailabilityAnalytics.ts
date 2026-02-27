import { TimeRange } from "./TimeRange.js";
import { minutesBetween } from "./TimeUtils.js";

export type AvailabilityAnalytics = {
    totalCapacityMinutes: number;
    totalFreeMinutes: number;
    totalBusyMinutes: number;
    utilizationPercentage: number;
}
export function calculateAvailabilityAnalytics(
    availability: TimeRange[],
    freeSlots: TimeRange[]
): AvailabilityAnalytics {

    const totalCapacityMinutes = availability.reduce(
        (sum, slot) => sum + minutesBetween(slot.start, slot.end),
        0
    );

    const totalFreeMinutes = freeSlots.reduce(
        (sum, slot) => sum + minutesBetween(slot.start, slot.end),
        0
    );

    const totalBusyMinutes = totalCapacityMinutes - totalFreeMinutes;

    const utilizationPercentage =
        totalCapacityMinutes === 0
            ? 0
            : Math.round((totalBusyMinutes / totalCapacityMinutes) * 100);

    return {
        totalCapacityMinutes,
        totalFreeMinutes,
        totalBusyMinutes,
        utilizationPercentage
    };
}