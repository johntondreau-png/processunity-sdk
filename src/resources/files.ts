import type { BaseClient } from "../http/base-client.js";
import type {
  AttachedFile,
  UploadFileRequest,
  CopyFileRequest,
  GetFilesOptions,
  UploadFileOptions,
} from "../types/files.js";

/**
 * File attachment endpoints.
 *
 * `client.files.listFileNames(objectId)` — list file names on an object
 * `client.files.getFiles(objectId)` — download file contents
 * `client.files.upload(objectId, file)` — upload a new file
 * `client.files.copy(request)` — server-side copy between objects
 */
export class FilesResource {
  constructor(private readonly http: BaseClient) {}

  /**
   * List file names attached to an object.
   * GET /apiv2/AttachedFiles/{objectId}/FileNames
   */
  async listFileNames(objectId: number | string): Promise<string[]> {
    return this.http.get<string[]>(
      `/apiv2/AttachedFiles/${objectId}/FileNames`,
      { rawResponse: true },
    );
  }

  /**
   * Get files attached to an object (with content).
   * GET /apiv2/AttachedFiles/{objectId}
   */
  async getFiles(
    objectId: number | string,
    options?: GetFilesOptions,
  ): Promise<AttachedFile[]> {
    const params = new URLSearchParams();
    if (options?.filenames) {
      for (const name of options.filenames) {
        params.append("filenames", name);
      }
    }
    if (options?.zipContent !== undefined) {
      params.set("zipContent", String(options.zipContent));
    }
    if (options?.relationships) {
      for (const rel of options.relationships) {
        params.append("relationships", String(rel));
      }
    }

    const query = params.toString();
    const path = `/apiv2/AttachedFiles/${objectId}${query ? `?${query}` : ""}`;
    return this.http.get<AttachedFile[]>(path, { rawResponse: true });
  }

  /**
   * Upload a file to an object.
   * POST /apiv2/AttachedFiles/{objectId}
   */
  async upload(
    objectId: number | string,
    file: UploadFileRequest,
    options?: UploadFileOptions,
  ): Promise<unknown> {
    const params = new URLSearchParams();
    if (options?.unzip !== undefined) {
      params.set("unzip", String(options.unzip));
    }
    if (options?.objectTypeId !== undefined) {
      params.set("objectTypeId", String(options.objectTypeId));
    }
    if (options?.relationship !== undefined) {
      params.set("relationship", String(options.relationship));
    }

    const query = params.toString();
    const path = `/apiv2/AttachedFiles/${objectId}${query ? `?${query}` : ""}`;
    return this.http.post<unknown>(path, file, { rawResponse: true });
  }

  /**
   * Server-side copy of files between objects.
   * POST /apiv2/AttachedFiles
   */
  async copy(request: CopyFileRequest): Promise<string[]> {
    return this.http.post<string[]>(
      "/apiv2/AttachedFiles",
      { copyFileRequest: request },
      { rawResponse: true },
    );
  }
}
