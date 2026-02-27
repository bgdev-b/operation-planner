import { describe, it, expect } from "vitest";
import { minutesBetween, clipRange } from "../TimeUtils.js";

describe("minutesBetween", () => {

    it("returns correct minutes between two times", () => {
        const start = new Date("2026-02-03T08:00:00Z");
        const end = new Date("2026-02-03T10:30:00Z");
        expect(minutesBetween(start, end)).toBe(150);
    });

    it("returns 0 when start equals end", () => {
        const t = new Date("2026-02-03T08:00:00Z");
        expect(minutesBetween(t, t)).toBe(0);
    });

    it("returns 0 for less than a full minute", () => {
        const start = new Date("2026-02-03T08:00:00Z");
        const end = new Date("2026-02-03T08:00:59Z");
        expect(minutesBetween(start, end)).toBe(0);
    });

    it("returns exactly 60 for a 1-hour range", () => {
        const start = new Date("2026-02-03T09:00:00Z");
        const end = new Date("2026-02-03T10:00:00Z");
        expect(minutesBetween(start, end)).toBe(60);
    });
});

describe("clipRange", () => {

    it("returns the range unchanged when it fits entirely within bounds", () => {
        const range = {
            start: new Date("2026-02-03T09:00:00Z"),
            end: new Date("2026-02-03T11:00:00Z")
        };
        const result = clipRange(
            range,
            new Date("2026-02-03T08:00:00Z"),
            new Date("2026-02-03T17:00:00Z")
        );

        expect(result).not.toBeNull();
        expect(result!.start.toISOString()).toBe("2026-02-03T09:00:00.000Z");
        expect(result!.end.toISOString()).toBe("2026-02-03T11:00:00.000Z");
    });

    it("clips start when range starts before the window", () => {
        const range = {
            start: new Date("2026-02-03T06:00:00Z"),
            end: new Date("2026-02-03T11:00:00Z")
        };
        const result = clipRange(
            range,
            new Date("2026-02-03T08:00:00Z"),
            new Date("2026-02-03T17:00:00Z")
        );

        expect(result).not.toBeNull();
        expect(result!.start.toISOString()).toBe("2026-02-03T08:00:00.000Z");
        expect(result!.end.toISOString()).toBe("2026-02-03T11:00:00.000Z");
    });

    it("clips end when range ends after the window", () => {
        const range = {
            start: new Date("2026-02-03T10:00:00Z"),
            end: new Date("2026-02-03T20:00:00Z")
        };
        const result = clipRange(
            range,
            new Date("2026-02-03T08:00:00Z"),
            new Date("2026-02-03T17:00:00Z")
        );

        expect(result).not.toBeNull();
        expect(result!.end.toISOString()).toBe("2026-02-03T17:00:00.000Z");
    });

    it("returns null when range is entirely before the window", () => {
        const range = {
            start: new Date("2026-02-03T05:00:00Z"),
            end: new Date("2026-02-03T07:00:00Z")
        };
        const result = clipRange(
            range,
            new Date("2026-02-03T08:00:00Z"),
            new Date("2026-02-03T17:00:00Z")
        );

        expect(result).toBeNull();
    });

    it("returns null when range is entirely after the window", () => {
        const range = {
            start: new Date("2026-02-03T18:00:00Z"),
            end: new Date("2026-02-03T20:00:00Z")
        };
        const result = clipRange(
            range,
            new Date("2026-02-03T08:00:00Z"),
            new Date("2026-02-03T17:00:00Z")
        );

        expect(result).toBeNull();
    });

    it("returns null when clipped start equals clipped end", () => {
        const range = {
            start: new Date("2026-02-03T08:00:00Z"),
            end: new Date("2026-02-03T08:00:00Z")
        };
        const result = clipRange(
            range,
            new Date("2026-02-03T08:00:00Z"),
            new Date("2026-02-03T17:00:00Z")
        );

        expect(result).toBeNull();
    });
});
