import type { ProcessUnityCredentials } from "./types.js";
import type { PuTokenResponse } from "../types/common.js";
import { AuthError } from "../http/errors.js";

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

/**
 * Manages OAuth 2.0 token lifecycle for ProcessUnity API.
 *
 * - Caches tokens in memory
 * - Refreshes 60s before expiry
 * - Uses a promise-based mutex to prevent concurrent refresh (thundering herd)
 */
export class TokenManager {
  private cached: CachedToken | null = null;
  private refreshPromise: Promise<string> | null = null;
  private readonly fetchFn: typeof fetch;

  constructor(
    private readonly credentials: ProcessUnityCredentials,
    fetchFn?: typeof fetch,
  ) {
    this.fetchFn = fetchFn ?? globalThis.fetch;
  }

  /** Get a valid access token, refreshing if needed */
  async getToken(): Promise<string> {
    if (this.cached && this.cached.expiresAt > Date.now() + 60_000) {
      return this.cached.accessToken;
    }

    // Mutex: if a refresh is already in-flight, await it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /** Invalidate the current token (e.g. after a 401) */
  invalidate(): void {
    this.cached = null;
  }

  private async refresh(): Promise<string> {
    const { baseUrl, serviceName, servicePassword, username, password } =
      this.credentials;

    const body = [
      `grant_type=password`,
      `username=${encodeURIComponent(serviceName)}`,
      `password=${encodeURIComponent(servicePassword)}`,
      `processunityUserName=${encodeURIComponent(username)}`,
      `processunityPassword=${encodeURIComponent(password)}`,
    ].join("&");

    const res = await this.fetchFn(`${baseUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      this.cached = null;
      throw new AuthError(
        `Token request failed (${res.status}): ${text.slice(0, 300)}`,
        res.status,
        text,
      );
    }

    const data = (await res.json()) as PuTokenResponse;

    this.cached = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return data.access_token;
  }
}
