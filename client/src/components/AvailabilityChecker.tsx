import type { Status } from "../types/Status";

type Props = {
    from: string;
    to: string;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    onCheck: () => void;
    status: Status;
    errorMessage?: string;
};

export function AvailabilityChecker({
    from,
    to,
    onFromChange,
    onToChange,
    onCheck,
    status,
    errorMessage
}: Props) {
    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>Check Availability</h3>

            <label>
                From:
                <input
                    type="datetime-local"
                    value={from}
                    onChange={(e) => onFromChange(e.target.value)}
                />
            </label>

            <label>
                To:
                <input
                    type="datetime-local"
                    value={to}
                    onChange={(e) => onToChange(e.target.value)}
                />
            </label>

            <button
                onClick={onCheck}
                disabled={status === "loading"}
            >
                {status === "loading" ? "Checking..." : "Check"}
            </button>

            {status === "error" && errorMessage && (
                <p style={{ color: "red" }}>{errorMessage}</p>
            )}
        </div>
    );
}