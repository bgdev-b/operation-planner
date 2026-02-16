import { useState } from "react";
import { apiGet } from "../api/client";
import type { TimeRange } from "../types/TimeRange";
import { FreeSlotsList } from "./FreeSlotsList";

type Props = {
    resourceId: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function AvailabilityChecker({ resourceId }: Props) {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [freeSlots, setFreeSlots] = useState<TimeRange[]>([]);
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    function handleFromChange(value: string) {
        setFrom(value);
        setStatus('idle');
        setErrorMessage('');
        setFreeSlots([]);
    }

    function handleToChange(value: string) {
        setTo(value);
        setStatus('idle');
        setErrorMessage('');
        setFreeSlots([]);
    }

    async function checkAvailability() {
        if (!from || !to) return;

        if (new Date(from) > new Date(to)) {
            setStatus('error');
            setErrorMessage('Invalid date range: "from" must be before "to"');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            const data = await apiGet<{ freeSlots: TimeRange[] }>(
                `/api/resources/${resourceId}/free-slots?from=${from}&to=${to}`
            );

            setFreeSlots(data.freeSlots);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setErrorMessage('Failed to load availability');
        }
    }

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>Check availability</h3>

            <input
                type="date"
                value={from}
                onChange={e => handleFromChange(e.target.value)}
            />

            <input
                type="date"
                value={to}
                onChange={e => handleToChange(e.target.value)}
            />

            <button onClick={checkAvailability} disabled={status === 'loading'}>
                {status === 'loading' ? 'Checking...' : 'Check'}
            </button>

            {status === 'error' && (
                <p style={{ color: "red" }}>{errorMessage}</p>
            )}

            {status === 'success' && (
                < FreeSlotsList slots={freeSlots} />
            )}
        </div>
    );
}