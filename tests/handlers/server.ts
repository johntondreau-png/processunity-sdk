import { setupServer } from "msw/node";
import { authHandlers } from "./auth.js";
import { reportsHandlers } from "./reports.js";
import { importsHandlers } from "./imports.js";
import { filesHandlers } from "./files.js";

export const server = setupServer(
  ...authHandlers,
  ...reportsHandlers,
  ...importsHandlers,
  ...filesHandlers,
);
