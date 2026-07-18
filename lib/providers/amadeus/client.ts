/**
 * Amadeus Self-Service API client (OAuth2 client credentials).
 * Test: https://test.api.amadeus.com
 * Prod: https://api.amadeus.com
 */

type TokenCache = { accessToken: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

export function isAmadeusConfigured() {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

function amadeusBaseUrl() {
  return process.env.AMADEUS_ENV === "production"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";
}

export async function getAmadeusToken(): Promise<string | null> {
  if (!isAmadeusConfigured()) return null;

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.AMADEUS_CLIENT_ID!,
    client_secret: process.env.AMADEUS_CLIENT_SECRET!,
  });

  const res = await fetch(`${amadeusBaseUrl()}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[amadeus] token error", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.accessToken;
}

export async function amadeusFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const token = await getAmadeusToken();
  if (!token) return null;

  const res = await fetch(`${amadeusBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[amadeus]", path, res.status, await res.text());
    return null;
  }

  return (await res.json()) as T;
}
