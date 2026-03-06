import type { BaseClient } from "../http/base-client.js";
import type {
  ExportFilter,
  ImportResult,
  ImportWithResultsResponse,
  ColumnInfo,
  ReportColumn,
  ImportOptions,
} from "../types/imports.js";

/**
 * Data import/export endpoints.
 *
 * `client.imports.export(reportId)` — export data from a report
 * `client.imports.import(templateId, data)` — import records via a template
 */
export class ImportsResource {
  constructor(private readonly http: BaseClient) {}

  /**
   * Export data from a report with optional filters.
   * POST /api/importexport/Export/{reportId}
   */
  async export(
    reportId: number | string,
    filters?: ExportFilter[],
  ): Promise<Record<string, unknown>[]> {
    const body = filters?.length ? { Filters: filters } : {};
    return this.http.post<Record<string, unknown>[]>(
      `/api/importexport/Export/${reportId}`,
      body,
    );
  }

  /**
   * Import records via a template.
   * POST /api/importexport/Import/{templateId}
   */
  async import(
    templateId: number | string,
    data: Record<string, unknown>[],
    options?: ImportOptions,
  ): Promise<ImportResult> {
    const body = {
      param: { includeLog: options?.includeLog ? "true" : "false" },
      data,
    };
    return this.http.post<ImportResult>(
      `/api/importexport/Import/${templateId}`,
      body,
    );
  }

  /**
   * Import data and return detailed results.
   * POST /api/importexport/ImportWithResults/{objectInstanceId}
   */
  async importWithResults(
    objectInstanceId: number | string,
    data: Record<string, unknown>[],
    params?: Record<string, unknown>,
  ): Promise<ImportWithResultsResponse> {
    const body = {
      importParamObject: { data, params: params ?? {} },
    };
    return this.http.post<ImportWithResultsResponse>(
      `/api/importexport/ImportWithResults/${objectInstanceId}`,
      body,
    );
  }

  /**
   * Get column metadata for an object instance.
   * GET /api/importexport/GetColumns/{objectInstanceId}
   */
  async getColumns(objectInstanceId: number | string): Promise<ColumnInfo> {
    return this.http.get<ColumnInfo>(
      `/api/importexport/GetColumns/${objectInstanceId}`,
    );
  }

  /**
   * Get report columns for an object instance.
   * GET /api/importexport/GetReportColumns/{objectInstanceId}
   */
  async getReportColumns(
    objectInstanceId: number | string,
  ): Promise<ReportColumn[]> {
    return this.http.get<ReportColumn[]>(
      `/api/importexport/GetReportColumns/${objectInstanceId}`,
    );
  }
}
