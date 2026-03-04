import { useState } from "react";
import { apiPost } from "../api/client";

type Props = {
    resourceId: string;
    onCreated: () => void;
};

export function CreateAvailabilityForm({ resourceId, onCreated }: Props) {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit() {
        if (!start || !end) return;

        setStatus("loading");
        setErrorMessage("");

        try {
            await apiPost(`/api/resources/${resourceId}/availability`, {
                start: new Date(start).toISOString(),
                end: new Date(end).toISOString(),
            });

            setStatus("idle");
            setStart("");
            setEnd("");
            onCreated();
        } catch (err: any) {
            setErrorMessage(err?.message ?? "Error creating availability");
            setStatus("error");
        }
    }

    return (
        <div>
            <h3>Add Availability</h3>
            <div>
                <label>
                    Start:
                    <input
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        disabled={status === "loading"}
                    />
                </label>
            </div>
            <div>
                <label>
                    End:
                    <input
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        disabled={status === "loading"}
                    />
                </label>
            </div>
            <button onClick={handleSubmit} disabled={status === "loading"}>
                {status === "loading" ? "Saving..." : "Add Availability"}
            </button>
            {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        </div>
    );
}
