/** A file attached to a ProcessUnity object */
export interface AttachedFile {
  Content: string;
  ContentLength: number;
  FileName: string;
}

/** Request body for uploading a file attachment */
export interface UploadFileRequest {
  content: string;
  contentLength: number;
  fileName: string;
}

/** Source/target for server-side file copy */
export interface CopyFileEndpoint {
  objectTypeId: number;
  objectId: number;
}

/** Request body for server-side file copy */
export interface CopyFileRequest {
  source: CopyFileEndpoint;
  target: CopyFileEndpoint;
  fileFilters?: string[];
  fileSources?: string[];
}

/** Options for getFiles */
export interface GetFilesOptions {
  filenames?: string[];
  zipContent?: boolean;
  relationships?: number[];
}

/** Options for uploading files */
export interface UploadFileOptions {
  unzip?: boolean;
  objectTypeId?: number;
  relationship?: number;
}
