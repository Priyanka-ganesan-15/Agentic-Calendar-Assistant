const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch<T>(
    path: string,
    options:{
        method?: string,
        token?: string|null,
        body?: unknown, 
    } = {}
) : Promise<T> {
    const header: Record<string, string> = {
        "Content-Type": "application/json",
    }

    if(options.token) {
        header.Authorization = `Bearer ${options.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
        method: options.method ?? "GET",
        headers: header,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    
    if(!res.ok) {
        throw new Error(data.error ?? "API request failed");
    }

    return data;

}