import { http, HttpResponse } from "msw";
import { BASE_URL } from "./auth.js";

export const importsHandlers = [
  // Export data
  http.post(`${BASE_URL}/api/importexport/Export/:reportId`, () => {
    return HttpResponse.json({
      Message: null,
      HasError: false,
      Data: [
        { Name: "Acme Corp", Status: "Active", RiskRating: "High" },
        { Name: "Globex Inc", Status: "Active", RiskRating: "Low" },
      ],
    });
  }),

  // Import data
  http.post(`${BASE_URL}/api/importexport/Import/:templateId`, () => {
    return HttpResponse.json({
      Message: null,
      HasError: false,
      Data: {
        TotalRecords: 2,
        TotalReadyRecords: 2,
        TotalErrorRecords: 0,
        TotalInsertRecords: 1,
        TotalUpdateRecords: 1,
        TotalDeleteRecords: 0,
      },
    });
  }),

  // Import with results
  http.post(
    `${BASE_URL}/api/importexport/ImportWithResults/:objectInstanceId`,
    () => {
      return HttpResponse.json({
        Message: null,
        HasError: false,
        Data: {
          Import: { Status: "Complete" },
          Results: { Processed: 2 },
          Complete: true,
          Errors: false,
        },
      });
    },
  ),

  // Get columns
  http.get(
    `${BASE_URL}/api/importexport/GetColumns/:objectInstanceId`,
    () => {
      return HttpResponse.json({
        Message: null,
        HasError: false,
        Data: {
          Name: "Vendor Columns",
          ExternalID: "VC-001",
          Description: "Column metadata for vendor objects",
          SuppressResults: false,
          GuidSets: [],
          ReportColumnColumns: ["Name", "Status", "RiskRating"],
        },
      });
    },
  ),

  // Get report columns
  http.get(
    `${BASE_URL}/api/importexport/GetReportColumns/:objectInstanceId`,
    () => {
      return HttpResponse.json({
        Message: null,
        HasError: false,
        Data: [
          { Name: "Name", DisplayName: "Vendor Name", DataType: "String" },
          { Name: "Status", DisplayName: "Status", DataType: "String" },
        ],
      });
    },
  ),
];
