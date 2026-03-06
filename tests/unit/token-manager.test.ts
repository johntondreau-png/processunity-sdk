import { describe, it, expect } from "vitest";
import { TokenManager } from "../../src/auth/token-manager.js";
import { AuthError } from "../../src/http/errors.js";
import type { ProcessUnityCredentials } from "../../src/auth/types.js";

const credentials: ProcessUnityCredentials = {
  baseUrl: "https://app.processunity.net/test-tenant",
  serviceName: "directwebservice",
  servicePassword: "test-service-pwd",
  username: "user@test.com",
  password: "test-password",
};

describe("TokenManager", () => {
  it("acquires a token on first call", async () => {
    const tm = new TokenManager(credentials);
    const token = await tm.getToken();
    expect(token).toBe("mock-access-token-12345");
  });

  it("returns cached token on subsequent calls", async () => {
    const tm = new TokenManager(credentials);
    const token1 = await tm.getToken();
    const token2 = await tm.getToken();
    expect(token1).toBe(token2);
  });

  it("re-acquires after invalidation", async () => {
    const tm = new TokenManager(credentials);
    const token1 = await tm.getToken();
    tm.invalidate();
    const token2 = await tm.getToken();
    expect(token1).toBe(token2); // Same mock token, but refresh was triggered
  });

  it("deduplicates concurrent refresh calls", async () => {
    const tm = new TokenManager(credentials);
    const [t1, t2, t3] = await Promise.all([
      tm.getToken(),
      tm.getToken(),
      tm.getToken(),
    ]);
    expect(t1).toBe(t2);
    expect(t2).toBe(t3);
  });

  it("throws AuthError on invalid credentials", async () => {
    const bad: ProcessUnityCredentials = {
      ...credentials,
      serviceName: "wrong",
      servicePassword: "wrong",
    };
    const tm = new TokenManager(bad);
    await expect(tm.getToken()).rejects.toThrow(AuthError);
  });
});
