import { TokenManager } from "../auth/token-manager.js";
import type { ProcessUnityCredentials, ProcessUnityClientOptions } from "../auth/types.js";
import type { PuApiResponse } from "../types/common.js";
import { ApiError, AuthError, RateLimitError, ValidationError } from "./errors.js";

export interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /** If true, return raw JSON without PuApiResponse envelope unwrapping */
  rawResponse?: boolean;
}

/**
 * Authenticated HTTP client for the ProcessUnity API.
 *
 * - Auto-attaches Bearer token
 * - Retries once on 401 (invalidate token, re-acquire, retry)
 * - Unwraps PuApiResponse envelope for /api/ endpoints
 * - Returns raw response for /apiv2/ endpoints (rawResponse: true)
 */
export class BaseClient {
  readonly tokenManager: TokenManager;
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(credentials: ProcessUnityCredentials, options?: ProcessUnityClientOptions) {
    this.baseUrl = credentials.baseUrl.replace(/\/$/, "");
    this.fetchFn = options?.fetch ?? globalThis.fetch;
    this.tokenManager = new TokenManager(credentials, this.fetchFn);
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { rawResponse, ...fetchOptions } = options;

    const doRequest = async (token: string): Promise<Response> => {
      const url = `${this.baseUrl}${path}`;
      return this.fetchFn(url, {
        ...fetchOptions,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          ...fetchOptions.headers,
        },
      });
    };

    let token = await this.tokenManager.getToken();
    let res = await doRequest(token);

    // Retry once on 401
    if (res.status === 401) {
      this.tokenManager.invalidate();
      token = await this.tokenManager.getToken();
      res = await doRequest(token);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");

      if (res.status === 401) {
        throw new AuthError(
          "Authentication failed — token expired or credentials invalid",
          401,
          body,
        );
      }

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        throw new RateLimitError(
          "Rate limit exceeded",
          retryAfter ? parseInt(retryAfter, 10) : undefined,
          body,
        );
      }

      throw new ApiError(
        `API error ${res.status}: ${res.statusText} – ${body.slice(0, 300)}`,
        res.status,
        body,
      );
    }

    const json = await res.json();

    // /apiv2/ endpoints return raw arrays, no envelope
    if (rawResponse) {
      return json as T;
    }

    // /api/ endpoints return { Message, HasError, Data }
    const envelope = json as PuApiResponse<T>;
    if (envelope.HasError !== undefined) {
      if (envelope.HasError) {
        throw new ValidationError(
          envelope.Message || "API returned an error",
          envelope.Message,
        );
      }
      return envelope.Data;
    }

    // Fallback: no envelope detected, return as-is
    return json as T;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }
}
