import { http, HttpResponse } from "msw";
import { BASE_URL } from "./auth.js";

export const reportsHandlers = [
  // Exportable reports
  http.get(`${BASE_URL}/api/dataexchange/ExportableReports/0`, () => {
    return HttpResponse.json({
      Message: null,
      HasError: false,
      Data: [
        { Id: 101, Name: "Vendor Export Report", ExternalId: "VER-001" },
        { Id: 102, Name: "Finding Export Report", ExternalId: "FER-001" },
      ],
    });
  }),

  // Remote exportable reports
  http.get(`${BASE_URL}/api/dataexchange/RemoteExportableReports/0`, () => {
    return HttpResponse.json({
      Message: null,
      HasError: false,
      Data: [
        { Id: 201, Name: "Remote Vendor Report", ExternalId: "RVR-001" },
      ],
    });
  }),

  // Importable templates
  http.get(`${BASE_URL}/api/dataexchange/ImportableTemplates/0`, () => {
    return HttpResponse.json({
      Message: null,
      HasError: false,
      Data: [
        {
          Id: 301,
          Name: "Vendor Import Template",
          Inserts: true,
          Updates: true,
          ImportType: "Vendor",
          KeyColumn: "Name",
          ParentKeyColumn: "",
          Columns: ["Name", "Status", "Category"],
          ExternalId: "VIT-001",
        },
      ],
    });
  }),

  // Remote importable templates
  http.get(`${BASE_URL}/api/dataexchange/RemoteImportableTemplates/0`, () => {
    return HttpResponse.json({
      Message: null,
      HasError: false,
      Data: [],
    });
  }),
];
