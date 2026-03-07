import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";

type Props = {
    from: string;
    to: string;
    onChange: (from: string, to: string) => void;
};

function toLocalDateTimeValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getTimePart(value: string, fallback: string) {
    return value ? value.slice(11, 16) : fallback;
}

function mergeDateAndTime(date: Date, timeValue: string) {
    const [hours, minutes] = timeValue.split(":").map(Number);
    const merged = new Date(date);
    merged.setHours(hours, minutes, 0, 0);
    return toLocalDateTimeValue(merged);
}

function startOfDay(date: Date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function endOfDay(date: Date) {
    const next = new Date(date);
    next.setHours(23, 59, 0, 0);
    return next;
}

export function DateRangePicker({
    from, to, onChange
}: Props) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    function handleRangeSelect(range: DateRange | undefined) {
        if (!range?.from && !range?.to) {
            onChange("", "");
            return;
        }

        const nextFrom = range?.from
            ? mergeDateAndTime(range.from, getTimePart(from, "09:00"))
            : from;

        const nextTo = range?.to
            ? mergeDateAndTime(range.to, getTimePart(to, "18:00"))
            : to;

        onChange(nextFrom, nextTo);
    }

    function handleFromTimeChange(value: string) {
        const baseFromDate = fromDate ?? toDate ?? new Date();
        onChange(mergeDateAndTime(baseFromDate, value), to);
    }

    function handleToTimeChange(value: string) {
        const baseToDate = toDate ?? fromDate ?? new Date();
        onChange(from, mergeDateAndTime(baseToDate, value));
    }

    function applyPreset(kind: "today" | "week" | "next7") {
        const now = new Date();
        const fromTime = getTimePart(from, "09:00");
        const toTime = getTimePart(to, "18:00");

        if (kind === "today") {
            const start = mergeDateAndTime(startOfDay(now), fromTime);
            const end = mergeDateAndTime(endOfDay(now), toTime);
            onChange(start, end);
            return;
        }

        if (kind === "week") {
            const day = now.getDay();
            const diffToMonday = day === 0 ? -6 : 1 - day;
            const monday = new Date(now);
            monday.setDate(now.getDate() + diffToMonday);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            onChange(
                mergeDateAndTime(startOfDay(monday), fromTime),
                mergeDateAndTime(endOfDay(sunday), toTime)
            );
            return;
        }

        const next7Start = startOfDay(now);
        const next7End = new Date(next7Start);
        next7End.setDate(next7Start.getDate() + 6);

        onChange(
            mergeDateAndTime(next7Start, fromTime),
            mergeDateAndTime(endOfDay(next7End), toTime)
        );
    }

    return (
        <div className="date-range-picker">
            <div className="date-range-presets">
                <button type="button" onClick={() => applyPreset("today")}>Today</button>
                <button type="button" onClick={() => applyPreset("week")}>This Week</button>
                <button type="button" onClick={() => applyPreset("next7")}>Next 7 Days</button>
            </div>

            <div className="date-range-field">
                <span className="date-range-label">From Time</span>
                <input
                    className="date-range-input"
                    type="time"
                    value={getTimePart(from, "09:00")}
                    onChange={(e) => handleFromTimeChange(e.target.value)}
                />
            </div>

            <div className="date-range-field">
                <span className="date-range-label">To Time</span>
                <input
                    className="date-range-input"
                    type="time"
                    value={getTimePart(to, "18:00")}
                    onChange={(e) => handleToTimeChange(e.target.value)}
                />
            </div>

            <div className="date-range-calendar">
                <DayPicker
                    mode="range"
                    selected={{ from: fromDate, to: toDate }}
                    onSelect={handleRangeSelect}
                    showOutsideDays
                />
            </div>
        </div>
    )
}