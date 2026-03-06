import { describe, it, expect } from "vitest";
import { ProcessUnityClient } from "../../src/index.js";

describe("ProcessUnityClient", () => {
  it("creates client with all resource namespaces", () => {
    const client = new ProcessUnityClient({
      baseUrl: "https://app.processunity.net/test-tenant",
      serviceName: "directwebservice",
      servicePassword: "test-service-pwd",
      username: "user@test.com",
      password: "test-password",
    });

    expect(client.reports).toBeDefined();
    expect(client.imports).toBeDefined();
    expect(client.files).toBeDefined();
  });

  it("end-to-end: discover reports then export data", async () => {
    const client = new ProcessUnityClient({
      baseUrl: "https://app.processunity.net/test-tenant",
      serviceName: "directwebservice",
      servicePassword: "test-service-pwd",
      username: "user@test.com",
      password: "test-password",
    });

    // Discover available reports
    const reports = await client.reports.listExportable();
    expect(reports.length).toBeGreaterThan(0);

    // Export from first report
    const reportId = reports[0]!.Id;
    const data = await client.imports.export(reportId);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("Name");
  });
});
