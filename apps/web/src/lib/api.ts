const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  token?: string | null;
  params?: Record<string, string | number | boolean | undefined>;
};

async function request<T>(method: string, path: string, body?: unknown, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(`${BASE}/api/v1${path}`);

  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = data?.error || {};
    throw new ApiError(
      res.status,
      error.code || "UNKNOWN",
      error.message || res.statusText,
      error.details
    );
  }

  return data;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("POST", path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PATCH", path, body, opts),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, undefined, opts),
};

export { ApiError };
