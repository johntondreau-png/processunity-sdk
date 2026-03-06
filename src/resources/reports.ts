import type { BaseClient } from "../http/base-client.js";
import type { Report, ImportTemplate } from "../types/reports.js";

/**
 * Report and template discovery endpoints.
 *
 * `client.reports.listExportable()` — list reports available for data export
 * `client.reports.listImportable()` — list templates available for data import
 */
export class ReportsResource {
  constructor(private readonly http: BaseClient) {}

  /**
   * List exportable reports (local).
   * GET /api/dataexchange/ExportableReports/0
   */
  async listExportable(): Promise<Report[]> {
    return this.http.get<Report[]>("/api/dataexchange/ExportableReports/0");
  }

  /**
   * List exportable reports (remote/federated).
   * GET /api/dataexchange/RemoteExportableReports/0
   */
  async listRemoteExportable(): Promise<Report[]> {
    return this.http.get<Report[]>("/api/dataexchange/RemoteExportableReports/0");
  }

  /**
   * List importable templates (local).
   * GET /api/dataexchange/ImportableTemplates/0
   */
  async listImportable(): Promise<ImportTemplate[]> {
    return this.http.get<ImportTemplate[]>("/api/dataexchange/ImportableTemplates/0");
  }

  /**
   * List importable templates (remote/federated).
   * GET /api/dataexchange/RemoteImportableTemplates/0
   */
  async listRemoteImportable(): Promise<ImportTemplate[]> {
    return this.http.get<ImportTemplate[]>(
      "/api/dataexchange/RemoteImportableTemplates/0",
    );
  }
}
