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

describe("ImportsResource", () => {
  it("exports data from a report", async () => {
    const data = await client.imports.export(101);
    expect(data).toHaveLength(2);
    expect(data[0]?.Name).toBe("Acme Corp");
    expect(data[1]?.RiskRating).toBe("Low");
  });

  it("exports data with filters", async () => {
    const data = await client.imports.export(101, [
      { ColumnName: "Status", Values: ["Active"] },
    ]);
    expect(data).toHaveLength(2);
  });

  it("imports records via a template", async () => {
    const result = await client.imports.import(301, [
      { Name: "New Vendor", Status: "Active" },
    ]);
    expect(result.TotalRecords).toBe(2);
    expect(result.TotalInsertRecords).toBe(1);
    expect(result.TotalUpdateRecords).toBe(1);
    expect(result.TotalErrorRecords).toBe(0);
  });

  it("imports with results", async () => {
    const result = await client.imports.importWithResults(500, [
      { Name: "Test" },
    ]);
    expect(result.Complete).toBe(true);
    expect(result.Errors).toBe(false);
  });

  it("gets columns for an object", async () => {
    const cols = await client.imports.getColumns(500);
    expect(cols.Name).toBe("Vendor Columns");
    expect(cols.ReportColumnColumns).toContain("Name");
  });

  it("gets report columns", async () => {
    const cols = await client.imports.getReportColumns(500);
    expect(cols).toHaveLength(2);
    expect(cols[0]).toHaveProperty("Name");
  });
});
