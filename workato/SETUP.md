# ProcessUnity Workato Connector — Setup Guide

## Getting the connector into Workato

1. Log into your Workato workspace
2. Navigate to **Tools** → **Connector SDK**
3. Click **Create a new connector**
4. Copy the entire contents of `connector.rb` into the code editor
5. Click **Save**

## Testing the connection

1. In the Connector SDK page, go to the **Connection** tab
2. Fill in:
   - **Tenant URL**: Your full ProcessUnity tenant URL (e.g. `https://app.processunity.net/your-tenant`)
   - **Service Name**: OAuth service account name (e.g. `directwebservice`)
   - **Service Password**: The service GUID
   - **ProcessUnity Username**: Your user email
   - **ProcessUnity Password**: Your user password
3. Click **Link your account** — it will call `POST /token` to acquire a bearer token
4. If successful, it will run the `test` lambda (list exportable reports) to verify

## Available actions

| Action | Description |
|--------|-------------|
| **List exportable reports** | Local reports available for export |
| **List remote exportable reports** | Federated/remote reports |
| **List importable templates** | Local import templates |
| **List remote importable templates** | Federated import templates |
| **Export data from report** | Export records with optional column filters |
| **Import records** | Import data via a template |
| **Import records with detailed results** | Import with per-row result details |
| **Get column metadata** | Column definitions for an object |
| **Get report columns** | Report column metadata |
| **List attached file names** | File names on a PU object |
| **Download attached files** | Get file contents (base64) |
| **Upload file** | Upload a file attachment |
| **Copy files between objects** | Server-side file copy |

## Available triggers

| Trigger | Description |
|---------|-------------|
| **New exported records (polling)** | Polls a report on a schedule, returns matching records |

## Pick lists

The connector includes dynamic pick lists for `exportable_reports` and `importable_templates`. To use them as dropdowns in your action inputs, change any `report_id` or `template_id` field to use:

```ruby
{
  name: "report_id",
  label: "Report",
  control_type: "select",
  pick_list: "exportable_reports",
  optional: false
}
```

## Notes on the `/api/` vs `/apiv2/` endpoints

- `/api/` endpoints return a `{ Message, HasError, Data }` envelope — the connector extracts `Data`
- `/apiv2/` endpoints (files) return raw JSON arrays — no unwrapping needed
- Workato handles this transparently via the `after_response` blocks and direct returns

## Authentication flow

The connector implements ProcessUnity's dual-credential OAuth 2.0 flow:

```
POST /token
Content-Type: text/plain

grant_type=password&username={serviceName}&password={servicePassword}&processunityUserName={user}&processunityPassword={pass}
```

Workato's `detect_on: [401]` and `refresh_on: [401]` handle automatic token refresh when the token expires.

## Customization tips

- **Dedup for trigger**: The polling trigger uses `record.hash` for dedup. If your reports include a unique ID field, replace it with `record["Id"]` or `record["ExternalId"]` for more reliable dedup.
- **Dynamic output schemas**: The export action returns generic `object` arrays since report schemas vary. For a specific report, you can hardcode the output fields or use Workato's `config_fields` pattern to dynamically fetch columns.
- **Error handling**: Workato's framework handles HTTP errors automatically. The `detect_on: [401]` triggers re-auth. For PU's `HasError: true` envelope errors, you may want to add explicit error raising in the `after_response` blocks.
