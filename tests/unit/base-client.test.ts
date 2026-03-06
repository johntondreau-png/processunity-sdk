import { describe, it, expect } from "vitest";
import { BaseClient } from "../../src/http/base-client.js";
import type { ProcessUnityCredentials } from "../../src/auth/types.js";

const credentials: ProcessUnityCredentials = {
  baseUrl: "https://app.processunity.net/test-tenant",
  serviceName: "directwebservice",
  servicePassword: "test-service-pwd",
  username: "user@test.com",
  password: "test-password",
};

describe("BaseClient", () => {
  it("unwraps PuApiResponse envelope", async () => {
    const client = new BaseClient(credentials);
    const reports = await client.get<
      Array<{ Id: number; Name: string }>
    >("/api/dataexchange/ExportableReports/0");

    expect(Array.isArray(reports)).toBe(true);
    expect(reports[0]?.Name).toBe("Vendor Export Report");
  });

  it("returns raw response for apiv2 endpoints", async () => {
    const client = new BaseClient(credentials);
    const fileNames = await client.get<string[]>(
      "/apiv2/AttachedFiles/123/FileNames",
      { rawResponse: true },
    );

    expect(Array.isArray(fileNames)).toBe(true);
    expect(fileNames).toContain("document.pdf");
  });

  it("provides post method", async () => {
    const client = new BaseClient(credentials);
    const result = await client.post<Record<string, unknown>[]>(
      "/api/importexport/Export/101",
      {},
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]?.Name).toBe("Acme Corp");
  });
});
