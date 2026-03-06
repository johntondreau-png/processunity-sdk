# processunity-sdk

TypeScript SDK for the [ProcessUnity](https://www.processunity.com/) TPRM API. Zero runtime dependencies, Node 18+.

## Install

```bash
npm install processunity-sdk
```

## Quick Start

```typescript
import { ProcessUnityClient } from 'processunity-sdk';

const client = new ProcessUnityClient({
  baseUrl: 'https://app.processunity.net/your-tenant',
  serviceName: 'directwebservice',
  servicePassword: 'your-service-guid',
  username: 'user@company.com',
  password: 'your-password',
});

// Discover available reports
const reports = await client.reports.listExportable();

// Export vendor data with filters
const vendors = await client.imports.export(reportId, [
  { ColumnName: 'Status', Values: ['Active'] },
]);

// Import records via a template
const result = await client.imports.import(templateId, vendorRecords);
console.log(`Inserted: ${result.TotalInsertRecords}`);

// File operations
const fileNames = await client.files.listFileNames(objectId);
const files = await client.files.getFiles(objectId);
```

## API Reference

### `client.reports`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `listExportable()` | GET `/api/dataexchange/ExportableReports/0` | List local export reports |
| `listRemoteExportable()` | GET `/api/dataexchange/RemoteExportableReports/0` | List remote export reports |
| `listImportable()` | GET `/api/dataexchange/ImportableTemplates/0` | List local import templates |
| `listRemoteImportable()` | GET `/api/dataexchange/RemoteImportableTemplates/0` | List remote import templates |

### `client.imports`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `export(reportId, filters?)` | POST `/api/importexport/Export/{id}` | Export data from a report |
| `import(templateId, data, options?)` | POST `/api/importexport/Import/{id}` | Import records |
| `importWithResults(id, data, params?)` | POST `/api/importexport/ImportWithResults/{id}` | Import with detailed results |
| `getColumns(id)` | GET `/api/importexport/GetColumns/{id}` | Get column metadata |
| `getReportColumns(id)` | GET `/api/importexport/GetReportColumns/{id}` | Get report column metadata |

### `client.files`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `listFileNames(objectId)` | GET `/apiv2/AttachedFiles/{id}/FileNames` | List attached file names |
| `getFiles(objectId, options?)` | GET `/apiv2/AttachedFiles/{id}` | Download file contents |
| `upload(objectId, file, options?)` | POST `/apiv2/AttachedFiles/{id}` | Upload a file |
| `copy(request)` | POST `/apiv2/AttachedFiles` | Server-side file copy |

## Authentication

The SDK uses ProcessUnity's dual-credential OAuth 2.0 flow:

1. **Service credentials** (`serviceName` + `servicePassword`) — API-level access
2. **User credentials** (`username` + `password`) — user-level authorization

Tokens are cached in memory and auto-refreshed 60s before expiry. Concurrent refresh requests are deduplicated to prevent thundering herd.

On 401, the SDK automatically invalidates the token, re-authenticates, and retries the request once.

## Error Handling

```typescript
import { AuthError, ApiError, ValidationError, RateLimitError } from 'processunity-sdk';

try {
  await client.imports.export(reportId);
} catch (err) {
  if (err instanceof AuthError) {
    // Bad credentials or expired token (after retry)
  } else if (err instanceof ValidationError) {
    // PU API returned HasError: true
    console.log(err.puMessage);
  } else if (err instanceof RateLimitError) {
    // 429 — check err.retryAfter
  } else if (err instanceof ApiError) {
    // Other HTTP errors
    console.log(err.statusCode);
  }
}
```

## Development

```bash
npm install
npm run lint    # Type-check
npm test        # Run tests (vitest + MSW mocks)
npm run build   # Build ESM + CJS + types
```

## License

MIT
