import type { TimeRange } from "../types/TimeRange";

type Props = {
    slots: TimeRange[];
};

export function FreeSlotsList({ slots }: Props) {
    if (slots.length === 0) {
        return <p>No availability found.</p>
    }

    return (
        <ul>
            {slots.map((slot, index) => (
                <li key={index}>
                    {new Date(slot.start).toLocaleString()} --
                    {new Date(slot.end).toLocaleString()}
                </li>
            ))}
        </ul>
    );
}