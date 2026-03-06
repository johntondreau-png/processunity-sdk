import { http, HttpResponse } from "msw";
import { BASE_URL } from "./auth.js";

export const filesHandlers = [
  // List file names
  http.get(
    `${BASE_URL}/apiv2/AttachedFiles/:objectId/FileNames`,
    () => {
      return HttpResponse.json(["document.pdf", "report.xlsx", "scan.png"]);
    },
  ),

  // Get files
  http.get(`${BASE_URL}/apiv2/AttachedFiles/:objectId`, () => {
    return HttpResponse.json([
      {
        Content: "base64encodedcontent==",
        ContentLength: 1024,
        FileName: "document.pdf",
      },
    ]);
  }),

  // Upload file
  http.post(`${BASE_URL}/apiv2/AttachedFiles/:objectId`, () => {
    return HttpResponse.json({ success: true, fileName: "uploaded.pdf" });
  }),

  // Copy file
  http.post(`${BASE_URL}/apiv2/AttachedFiles`, () => {
    return HttpResponse.json(["copied-file.pdf"]);
  }),
];
