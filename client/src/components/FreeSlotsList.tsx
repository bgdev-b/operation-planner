import type { TimeRange } from "../types/TimeRange";

type Props = {
    slots: TimeRange[];
};

export function FreeSlotsList({ slots }: Props) {
    if (slots.length === 0) {
        return (
            <section className="free-slots">
                <h3 className="free-slots-title">Free Slots</h3>
                <p className="free-slots-empty">No availability found.</p>
            </section>
        );
    }

    return (
        <section className="free-slots">
            <h3 className="free-slots-title">Free Slots</h3>
            <ul className="free-slots-list">
                {slots.map((slot, index) => (
                    <li className="free-slots-item" key={index}>
                        {new Date(slot.start).toLocaleString()} - {new Date(slot.end).toLocaleString()}
                    </li>
                ))}
            </ul>
        </section>
    );
}