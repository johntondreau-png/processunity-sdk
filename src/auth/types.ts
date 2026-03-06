/** Credentials for the ProcessUnity dual-credential OAuth 2.0 flow */
export interface ProcessUnityCredentials {
  /** Full tenant URL (e.g. https://app.processunity.net/moodysapipoc) */
  baseUrl: string;
  /** OAuth service account name (e.g. "directwebservice") */
  serviceName: string;
  /** OAuth service account password (GUID format) */
  servicePassword: string;
  /** ProcessUnity user account name */
  username: string;
  /** ProcessUnity user password */
  password: string;
}

/** Options for the ProcessUnity client */
export interface ProcessUnityClientOptions {
  /** Custom fetch implementation (defaults to global fetch) */
  fetch?: typeof fetch;
}
