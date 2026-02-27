import { useState } from "react";

type ConflictType = 'OVERLAPPING_ASSIGNMENT' | 'RESOURCE_UNAVAILABLE' | 'INVALID_TIME_RANGE';

type Conflict = {
    type: ConflictType;
    resourceId: string;
    taskId: string;
    message: string;
};

type ValidationErrorResponse = {
    valid: false;
    conflicts: Conflict[];
};

type Props = {
    resourceId: string;
    onCreated: () => void;
}

export function CreateAssignmentForm({ resourceId, onCreated, }: Props) {
    const [taskId, setTaskId] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState('');

    async function handleSubmit() {
        if (!taskId || !start || !end) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId,
                    resourceId,
                    start: new Date(start).toISOString(),
                    end: new Date(end).toISOString()
                })
            });

            if (!response.ok) {
                const errorData = await response.json() as ValidationErrorResponse;

                if (response.status === 409 && errorData.conflicts) {
                    setErrorMessage(
                        errorData.conflicts.map(c => c.message).join(', ')
                    );
                } else {
                    setErrorMessage('Error creating assignment');
                }
                setStatus('error');
                return;
            }

            setStatus('idle');
            setTaskId('');
            setStart('');
            setEnd('');
            onCreated();
        } catch (error) {
            setErrorMessage('Network error');
            setStatus('error');
        }
    }

    return (
        <div>
            <h3>Create Assignment</h3>
            <div>
                <label>
                    Task ID:
                    <input
                        type="text"
                        value={taskId}
                        onChange={e => setTaskId(e.target.value)}
                        disabled={status === 'loading'}
                    />
                </label>
            </div>
            <div>
                <label>
                    Start:
                    <input
                        type="datetime-local"
                        value={start}
                        onChange={e => setStart(e.target.value)}
                        disabled={status === 'loading'}
                    />
                </label>
            </div>
            <div>
                <label>
                    End:
                    <input
                        type="datetime-local"
                        value={end}
                        onChange={e => setEnd(e.target.value)}
                        disabled={status === 'loading'}
                    />
                </label>
            </div>
            <button onClick={handleSubmit} disabled={status === 'loading'}>
                {status === 'loading' ? 'Creating...' : 'Create Assignment'}
            </button>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        </div>
    );
}