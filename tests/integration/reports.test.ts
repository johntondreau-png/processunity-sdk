import { describe, it, expect, beforeAll } from "vitest";
import { ProcessUnityClient } from "../../src/index.js";

let client: ProcessUnityClient;

beforeAll(() => {
  client = new ProcessUnityClient({
    baseUrl: "https://app.processunity.net/test-tenant",
    serviceName: "directwebservice",
    servicePassword: "test-service-pwd",
    username: "user@test.com",
    password: "test-password",
  });
});

describe("ReportsResource", () => {
  it("lists exportable reports", async () => {
    const reports = await client.reports.listExportable();
    expect(reports).toHaveLength(2);
    expect(reports[0]?.Name).toBe("Vendor Export Report");
    expect(reports[0]?.Id).toBe(101);
  });

  it("lists remote exportable reports", async () => {
    const reports = await client.reports.listRemoteExportable();
    expect(reports).toHaveLength(1);
    expect(reports[0]?.Name).toBe("Remote Vendor Report");
  });

  it("lists importable templates", async () => {
    const templates = await client.reports.listImportable();
    expect(templates).toHaveLength(1);
    expect(templates[0]?.Name).toBe("Vendor Import Template");
    expect(templates[0]?.Inserts).toBe(true);
    expect(templates[0]?.Columns).toContain("Name");
  });

  it("lists remote importable templates", async () => {
    const templates = await client.reports.listRemoteImportable();
    expect(templates).toHaveLength(0);
  });
});
