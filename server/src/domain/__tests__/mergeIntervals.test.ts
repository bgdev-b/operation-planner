import { describe, it, expect } from "vitest";
import { mergeIntervals } from "../MergeIntervals.js";

describe("mergeIntervals", () => {

    it("returns empty array when given no intervals", () => {
        expect(mergeIntervals([])).toEqual([]);
    });

    it("returns the same single interval unchanged", () => {
        const intervals = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T10:00:00Z")
            }
        ];
        const result = mergeIntervals(intervals);
        expect(result).toHaveLength(1);
        expect(result[0]!.start.toISOString()).toBe("2026-02-03T08:00:00.000Z");
        expect(result[0]!.end.toISOString()).toBe("2026-02-03T10:00:00.000Z");
    });

    it("merges two overlapping intervals", () => {
        const intervals = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T12:00:00Z")
            },
            {
                start: new Date("2026-02-03T10:00:00Z"),
                end: new Date("2026-02-03T14:00:00Z")
            }
        ];
        const result = mergeIntervals(intervals);
        expect(result).toHaveLength(1);
        expect(result[0]!.start.toISOString()).toBe("2026-02-03T08:00:00.000Z");
        expect(result[0]!.end.toISOString()).toBe("2026-02-03T14:00:00.000Z");
    });

    it("merges adjacent intervals (touching at boundary)", () => {
        const intervals = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T10:00:00Z")
            },
            {
                start: new Date("2026-02-03T10:00:00Z"),
                end: new Date("2026-02-03T12:00:00Z")
            }
        ];
        const result = mergeIntervals(intervals);
        expect(result).toHaveLength(1);
        expect(result[0]!.end.toISOString()).toBe("2026-02-03T12:00:00.000Z");
    });

    it("does not merge non-overlapping intervals", () => {
        const intervals = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T10:00:00Z")
            },
            {
                start: new Date("2026-02-03T12:00:00Z"),
                end: new Date("2026-02-03T14:00:00Z")
            }
        ];
        const result = mergeIntervals(intervals);
        expect(result).toHaveLength(2);
    });

    it("merges multiple overlapping intervals into one", () => {
        const intervals = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T11:00:00Z")
            },
            {
                start: new Date("2026-02-03T09:00:00Z"),
                end: new Date("2026-02-03T13:00:00Z")
            },
            {
                start: new Date("2026-02-03T10:00:00Z"),
                end: new Date("2026-02-03T15:00:00Z")
            }
        ];
        const result = mergeIntervals(intervals);
        expect(result).toHaveLength(1);
        expect(result[0]!.start.toISOString()).toBe("2026-02-03T08:00:00.000Z");
        expect(result[0]!.end.toISOString()).toBe("2026-02-03T15:00:00.000Z");
    });

    it("handles unsorted input correctly", () => {
        const intervals = [
            {
                start: new Date("2026-02-03T14:00:00Z"),
                end: new Date("2026-02-03T16:00:00Z")
            },
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T10:00:00Z")
            }
        ];
        const result = mergeIntervals(intervals);
        expect(result).toHaveLength(2);
        expect(result[0]!.start.toISOString()).toBe("2026-02-03T08:00:00.000Z");
        expect(result[1]!.start.toISOString()).toBe("2026-02-03T14:00:00.000Z");
    });

    it("keeps the furthest end when one interval contains another", () => {
        const intervals = [
            {
                start: new Date("2026-02-03T08:00:00Z"),
                end: new Date("2026-02-03T17:00:00Z")
            },
            {
                start: new Date("2026-02-03T10:00:00Z"),
                end: new Date("2026-02-03T12:00:00Z")
            }
        ];
        const result = mergeIntervals(intervals);
        expect(result).toHaveLength(1);
        expect(result[0]!.end.toISOString()).toBe("2026-02-03T17:00:00.000Z");
    });
});
