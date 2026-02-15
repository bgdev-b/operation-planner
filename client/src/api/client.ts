
export async function apiGet<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API ERROR: ${response.status}`);
    }

    return response.json();
}