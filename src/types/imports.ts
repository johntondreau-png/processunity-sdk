/** Filter for export requests */
export interface ExportFilter {
  ColumnName: string;
  Values: string[];
}

/** Export request body */
export interface ExportRequest {
  Filters?: ExportFilter[];
}

/** Import request body */
export interface ImportRequest {
  param?: { includeLog?: string };
  data: Record<string, unknown>[];
}

/** Import result summary */
export interface ImportResult {
  TotalRecords: number;
  TotalReadyRecords: number;
  TotalErrorRecords: number;
  TotalInsertRecords: number;
  TotalUpdateRecords: number;
  TotalDeleteRecords: number;
  TotalNoActionRecords?: number;
}

/** Import-with-results response */
export interface ImportWithResultsResponse {
  Import: Record<string, unknown>;
  Results: Record<string, unknown>;
  Complete: boolean;
  Errors: boolean;
}

/** Column metadata from GetColumns */
export interface ColumnInfo {
  Name: string;
  ExternalID?: string;
  Description?: string;
  SuppressResults?: boolean;
  GuidSets?: string[];
  ReportColumnColumns?: string[];
}

/** Report column metadata from GetReportColumns */
export interface ReportColumn {
  [key: string]: unknown;
}

/** Options for export */
export interface ExportOptions {
  filters?: ExportFilter[];
}

/** Options for import */
export interface ImportOptions {
  includeLog?: boolean;
}
