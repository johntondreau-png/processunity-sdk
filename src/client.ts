import type { ProcessUnityCredentials, ProcessUnityClientOptions } from "./auth/types.js";
import { BaseClient } from "./http/base-client.js";
import { ReportsResource } from "./resources/reports.js";
import { ImportsResource } from "./resources/imports.js";
import { FilesResource } from "./resources/files.js";

/**
 * ProcessUnity API client with Stripe-style resource namespacing.
 *
 * @example
 * ```ts
 * const client = new ProcessUnityClient({
 *   baseUrl: 'https://app.processunity.net/tenant',
 *   serviceName: 'directwebservice',
 *   servicePassword: 'guid-here',
 *   username: 'user@company.com',
 *   password: 'password',
 * });
 *
 * const reports = await client.reports.listExportable();
 * const vendors = await client.imports.export(reportId);
 * const fileNames = await client.files.listFileNames(objectId);
 * ```
 */
export class ProcessUnityClient {
  /** Report and template discovery */
  readonly reports: ReportsResource;
  /** Data import/export operations */
  readonly imports: ImportsResource;
  /** File attachment operations */
  readonly files: FilesResource;

  private readonly http: BaseClient;

  constructor(credentials: ProcessUnityCredentials, options?: ProcessUnityClientOptions) {
    this.http = new BaseClient(credentials, options);
    this.reports = new ReportsResource(this.http);
    this.imports = new ImportsResource(this.http);
    this.files = new FilesResource(this.http);
  }
}
