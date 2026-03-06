/** A report available for export */
export interface Report {
  Id: number;
  Name: string;
  ExternalId?: string;
}

/** An import template */
export interface ImportTemplate {
  Id: number;
  Name: string;
  Inserts: boolean;
  Updates: boolean;
  ImportType: string;
  KeyColumn?: string;
  ParentKeyColumn?: string;
  Columns?: string[];
  ExternalId?: string;
}
