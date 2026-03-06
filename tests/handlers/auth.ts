import { http, HttpResponse } from "msw";

export const BASE_URL = "https://app.processunity.net/test-tenant";

export const VALID_TOKEN = "mock-access-token-12345";

export const authHandlers = [
  // Token endpoint — success
  http.post(`${BASE_URL}/token`, async ({ request }) => {
    const body = await request.text();

    if (
      body.includes("username=directwebservice") &&
      body.includes("password=test-service-pwd")
    ) {
      return HttpResponse.json({
        access_token: VALID_TOKEN,
        token_type: "bearer",
        expires_in: 1200,
      });
    }

    return new HttpResponse("Invalid credentials", { status: 401 });
  }),
];
