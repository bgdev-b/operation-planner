import { describe, it, expect } from "vitest";
import { calculateAvailability } from "../CalculateAvailability.js";

describe("calculateAvailability", () => {

    it("returns free slots correctly", () => {

        const availability = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T17:00:00Z")
            }
        ];

        const assignments = [
            {
                start: new Date("2026-02-03T10:00:00Z"),
                end: new Date("2026-02-03T12:00:00Z")
            }
        ];

        const result = calculateAvailability(
            availability,
            assignments,
            new Date("2026-02-03T00:00:00Z"),
            new Date("2026-02-04T00:00:00Z")
        );

        expect(result).toHaveLength(2);

        const first = result[0]!;
        const second = result[1]!;

        expect(first.start.toISOString()).toBe("2026-02-03T08:00:00.000Z");
        expect(first.end.toISOString()).toBe("2026-02-03T10:00:00.000Z");

        expect(second.start.toISOString()).toBe("2026-02-03T12:00:00.000Z");
        expect(second.end.toISOString()).toBe("2026-02-03T17:00:00.000Z");
    });

});