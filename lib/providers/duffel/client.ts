/**
 * Duffel Flights API — self-serve keys: https://duffel.com/
 * Docs: https://duffel.com/docs
 */

export function isDuffelConfigured() {
  return Boolean(process.env.DUFFEL_ACCESS_TOKEN?.trim());
}

export function duffelToken() {
  return process.env.DUFFEL_ACCESS_TOKEN?.trim() ?? "";
}

export async function duffelFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const token = duffelToken();
  if (!token) return null;

  const res = await fetch(`https://api.duffel.com${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Duffel-Version": "v2",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[duffel]", path, res.status, await res.text());
    return null;
  }

  return (await res.json()) as T;
}
