
export async function apiGet<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API ERROR: ${response.status}`);
    }

    return response.json();
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw Object.assign(new Error(`API ERROR: ${response.status}`), { data });
    }

    return response.json();
}