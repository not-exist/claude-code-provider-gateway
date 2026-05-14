import { apiUrl } from "./base.js";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    public readonly body?: unknown,
  ) {
    super(`API ${path} → ${status}`);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      /* no body */
    }
    throw new ApiError(res.status, path, body);
  }
  return res.json() as Promise<T>;
}
