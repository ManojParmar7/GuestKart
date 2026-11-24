export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-GuestKart-Client': 'web',
      ...options.headers,
    },
  });
  const body = await response
    .json()
    .catch(() => ({ error: 'The server is unavailable. Please try again.' }));
  if (!response.ok) throw new ApiError(body.error ?? 'Request failed.', response.status);
  return body as T;
}
export const post = <T>(path: string, value: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(value) });
