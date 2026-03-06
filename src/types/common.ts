/**
 * Standard envelope returned by `/api/` endpoints.
 * `/apiv2/` endpoints return raw arrays (no envelope).
 */
export interface PuApiResponse<T = unknown> {
  Message: string | null;
  HasError: boolean;
  Data: T;
}

/** OAuth 2.0 token response from POST /token */
export interface PuTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
