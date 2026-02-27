import { describe, it, expect } from "vitest";
import { calculateAvailabilityAnalytics } from "../AvailabilityAnalytics.js";

describe("calculateAvailabilityAnalytics", () => {

    it("calculates correct metrics when there are free and busy slots", () => {
        const availability = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T17:00:00Z")
            }
        ];

        const freeSlots = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T10:00:00Z")
            },
            {
                start: new Date("2026-02-03T12:00:00Z"),
                end: new Date("2026-02-03T17:00:00Z")
            }
        ];

        const result = calculateAvailabilityAnalytics(availability, freeSlots);

        expect(result.totalCapacityMinutes).toBe(540);
        expect(result.totalFreeMinutes).toBe(420);
        expect(result.totalBusyMinutes).toBe(120);
        expect(result.utilizationPercentage).toBe(22);
    });

    it("returns 0% utilization when all time is free", () => {
        const availability = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T10:00:00Z")
            }
        ];

        const freeSlots = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T10:00:00Z")
            }
        ];

        const result = calculateAvailabilityAnalytics(availability, freeSlots);

        expect(result.totalCapacityMinutes).toBe(120);
        expect(result.totalFreeMinutes).toBe(120);
        expect(result.totalBusyMinutes).toBe(0);
        expect(result.utilizationPercentage).toBe(0);
    });

    it("returns 100% utilization when no free slots", () => {
        const availability = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T10:00:00Z")
            }
        ];

        const result = calculateAvailabilityAnalytics(availability, []);

        expect(result.totalCapacityMinutes).toBe(120);
        expect(result.totalFreeMinutes).toBe(0);
        expect(result.totalBusyMinutes).toBe(120);
        expect(result.utilizationPercentage).toBe(100);
    });

    it("returns 0 for all values when availability is empty", () => {
        const result = calculateAvailabilityAnalytics([], []);

        expect(result.totalCapacityMinutes).toBe(0);
        expect(result.totalFreeMinutes).toBe(0);
        expect(result.totalBusyMinutes).toBe(0);
        expect(result.utilizationPercentage).toBe(0);
    });

    it("handles multiple availability windows", () => {
        const availability = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T10:00:00Z")
            },
            {
                start: new Date("2026-02-03T14:00:00Z"),
                end: new Date("2026-02-03T16:00:00Z")
            }
        ];

        const freeSlots = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T09:00:00Z")
            }
        ];

        const result = calculateAvailabilityAnalytics(availability, freeSlots);

        expect(result.totalCapacityMinutes).toBe(240);
        expect(result.totalFreeMinutes).toBe(60);
        expect(result.totalBusyMinutes).toBe(180);
        expect(result.utilizationPercentage).toBe(75);
    });
});
