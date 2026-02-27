import { describe, it, expect } from "vitest";
import { calculateAvailability } from "../CalculateAvailability.js";

const defaultAvailability = [
    {
        start: new Date("2026-02-03T08:00:00Z"),
        end: new Date("2026-02-03T17:00:00Z")
    }
];

const defaultWindow = {
    from: new Date("2026-02-03T00:00:00Z"),
    to: new Date("2026-02-04T00:00:00Z")
};

describe("calculateAvailability", () => {
    it("returns free slots correctly when there is one assignment", () => {
        const assignments = [
            {
                start: new Date("2026-02-03T10:00:00Z"),
                end: new Date("2026-02-03T12:00:00Z")
            }
        ];

        const result = calculateAvailability(
            defaultAvailability,
            assignments,
            defaultWindow.from,
            defaultWindow.to
        );

        expect(result.freeSlot).toHaveLength(2);

        const first = result.freeSlot[0]!;
        const second = result.freeSlot[1]!;

        expect(first.start.toISOString()).toBe("2026-02-03T08:00:00.000Z");
        expect(first.end.toISOString()).toBe("2026-02-03T10:00:00.000Z");

        expect(second.start.toISOString()).toBe("2026-02-03T12:00:00.000Z");
        expect(second.end.toISOString()).toBe("2026-02-03T17:00:00.000Z");
    });

    it("returns full availability as free when there are no assignments", () => {
        const result = calculateAvailability(
            defaultAvailability,
            [],
            defaultWindow.from,
            defaultWindow.to
        );

        expect(result.freeSlot).toHaveLength(1);
        expect(result.freeSlot[0]!.start.toISOString()).toBe("2026-02-03T08:00:00.000Z");
        expect(result.freeSlot[0]!.end.toISOString()).toBe("2026-02-03T17:00:00.000Z");
    });

    it("returns no free slots when assignment covers entire availability", () => {
        const assignments = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T17:00:00Z")
            }
        ];

        const result = calculateAvailability(
            defaultAvailability,
            assignments,
            defaultWindow.from,
            defaultWindow.to
        );

        expect(result.freeSlot).toHaveLength(0);
    });

    it("ignores assignments outside the from/to window", () => {
        const assignments = [
            {
                start: new Date("2026-02-04T10:00:00Z"),
                end: new Date("2026-02-04T12:00:00Z")
            }
        ];

        const result = calculateAvailability(
            defaultAvailability,
            assignments,
            defaultWindow.from,
            defaultWindow.to
        );

        expect(result.freeSlot).toHaveLength(1);
        expect(result.freeSlot[0]!.start.toISOString()).toBe("2026-02-03T08:00:00.000Z");
        expect(result.freeSlot[0]!.end.toISOString()).toBe("2026-02-03T17:00:00.000Z");
    });

    it("clips availability to the from/to window", () => {
        const result = calculateAvailability(
            defaultAvailability,
            [],
            new Date("2026-02-03T10:00:00Z"),
            new Date("2026-02-03T14:00:00Z")
        );

        expect(result.clippedAvailability).toHaveLength(1);
        expect(result.clippedAvailability[0]!.start.toISOString()).toBe("2026-02-03T10:00:00.000Z");
        expect(result.clippedAvailability[0]!.end.toISOString()).toBe("2026-02-03T14:00:00.000Z");
    });

    it("returns empty when availability does not overlap the window", () => {
        const result = calculateAvailability(
            defaultAvailability,
            [],
            new Date("2026-02-04T00:00:00Z"),
            new Date("2026-02-05T00:00:00Z")
        );

        expect(result.freeSlot).toHaveLength(0);
        expect(result.clippedAvailability).toHaveLength(0);
    });
});