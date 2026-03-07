export async function createAssignment(
    taskId: string,
    resourceId: string,
    start: string,
    end: string
) {
    const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            taskId,
            resourceId,
            start,
            end,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to create assignment");
    }

    return response.json();
}

export async function updateAssignment(
    taskId: string,
    resourceId: string,
    originalStart: string,
    originalEnd: string,
    start: string,
    end: string
) {
    const response = await fetch(`/api/assignments/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            resourceId,
            originalStart,
            originalEnd,
            start,
            end
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to update assignment');
    }

    return response.json();
}

export async function deleteAssignment(
    taskId: string,
    resourceId: string,
    start: string,
    end: string
) {
    const response = await fetch(`/api/assignments/${taskId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resourceId,
            start,
            end,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to delete assignment");
    }

    return response.json();
}
