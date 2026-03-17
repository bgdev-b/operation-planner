
type ApiErrorData = {
    error?: string;
    message?: string;
    details?: unknown;
};

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function toApiUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    if (!API_BASE) {
        return url;
    }

    return url.startsWith("/") ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
}

async function buildApiError(response: Response) {
    const data = await response.json().catch(() => ({}));
    return Object.assign(new Error(`API ERROR: ${response.status}`), { data: data as ApiErrorData });
}

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
    return fetch(toApiUrl(url), init);
}

export async function apiGet<T>(url: string): Promise<T> {
    const response = await apiFetch(url);

    if (!response.ok) {
        throw await buildApiError(response);
    }

    return response.json();
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
    const response = await apiFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw await buildApiError(response);
    }

    return response.json();
}