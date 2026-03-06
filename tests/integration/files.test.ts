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

describe("FilesResource", () => {
  it("lists file names", async () => {
    const names = await client.files.listFileNames(123);
    expect(names).toHaveLength(3);
    expect(names).toContain("document.pdf");
    expect(names).toContain("report.xlsx");
  });

  it("gets files with content", async () => {
    const files = await client.files.getFiles(123);
    expect(files).toHaveLength(1);
    expect(files[0]?.FileName).toBe("document.pdf");
    expect(files[0]?.ContentLength).toBe(1024);
  });

  it("uploads a file", async () => {
    const result = await client.files.upload(123, {
      content: "base64content==",
      contentLength: 512,
      fileName: "new-doc.pdf",
    });
    expect(result).toHaveProperty("success", true);
  });

  it("copies files between objects", async () => {
    const result = await client.files.copy({
      source: { objectTypeId: 1, objectId: 100 },
      target: { objectTypeId: 1, objectId: 200 },
    });
    expect(result).toContain("copied-file.pdf");
  });
});
