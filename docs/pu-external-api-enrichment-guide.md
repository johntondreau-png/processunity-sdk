# ProcessUnity External API Connections — Vendor Enrichment Configuration Guide

This guide walks through configuring PU's native **External API Connections** feature to enrich Third Party vendor data from free, public external APIs — no middleware required.

## How It Works (Architecture)

```
External API  --(JSON)-->  Import Template  --(mapped)-->  PU Properties on Third Party
                              ^                                     |
                              |                                     |
                    GET from External API                   Workflow Step
                    (Button / Report Action /               (triggers the GET)
                     Automated Action)
```

**Inbound (GET)**: PU calls an external API endpoint, receives JSON, maps it to properties via an Import Template.
**Outbound (SEND)**: PU sends data from a Custom Report as JSON to an external endpoint.

For vendor enrichment, we primarily use **GET** — pulling data into PU.

---

## Prerequisites

### PU Properties (Create if Missing)

Before configuring connections, ensure these properties exist on the **Third Party** object. Create them in Settings > Properties if they don't exist.

| Property Name | Property Type | Section | Used By |
|---------------|---------------|---------|---------|
| Sanctions Status | Picklist (Clear, Potential Match, Confirmed Match) | Compliance | CSL Screening |
| Sanctions Match Details | Multi-line Text | Compliance | CSL Screening |
| Last Sanctions Screen Date | Date | Compliance | CSL Screening |
| Country Risk Score | Decimal | Risk Profile | World Bank |
| Political Stability Index | Decimal | Risk Profile | World Bank |
| Control of Corruption Index | Decimal | Risk Profile | World Bank |
| Rule of Law Index | Decimal | Risk Profile | World Bank |
| Regulatory Quality Index | Decimal | Risk Profile | World Bank |
| Country Risk Last Updated | Date | Risk Profile | World Bank |
| SEC CIK Number | Text | Financial | SEC EDGAR |
| Last SEC Filing Date | Date | Financial | SEC EDGAR |
| SEC Filing Type | Text | Financial | SEC EDGAR |
| SEC Filing Description | Text | Financial | SEC EDGAR |
| SIC Code | Text | Financial | SEC EDGAR |
| Business Location | Text | Financial | SEC EDGAR |
| Geopolitical News Summary | Multi-line Text | Intelligence | GDELT |
| Geopolitical News Source | Text | Intelligence | GDELT |
| Geopolitical Last Checked | Date | Intelligence | GDELT |
| UK Company Number | Text | Ownership | Companies House |
| UK Company Status | Text | Ownership | Companies House |
| UK Incorporation Date | Date | Ownership | Companies House |
| Beneficial Owners | Multi-line Text | Ownership | Companies House |
| CISA Vulnerability Count | Integer | Cyber | CISA KEV |
| CISA Last Checked | Date | Cyber | CISA KEV |
| Climate Target Status | Picklist (Committed, Targets Set, Validated, None) | ESG | SBTi |
| Climate Target Validation Date | Date | ESG | SBTi |

---

## Connection 1: OFAC Consolidated Screening List (Sanctions)

### 1A. External API Connection

| Field | Value |
|-------|-------|
| **Name** | OFAC Consolidated Screening List |
| **Description** | Screens vendor names against 11 US govt export control and sanctions lists |
| **Base URL** | `https://developer.trade.gov/api/consolidated-screening-list/v1` |
| **Authentication Type** | API Key |
| **API Key** | *(Get from https://developer.trade.gov — sign up, subscribe to "Data Services Platform APIs", copy primary key from Profile)* |
| **Retry Strategy** | 1,3,5 |
| **Relative Test Path** | `search?name=test` |

> **Note**: The CSL API moved to `developer.trade.gov` in 2025. The old `api.trade.gov` endpoint redirects. You need a free subscription key from the developer portal.

### 1B. Import Template

**Object**: Third Party
**Enable for**: Get from External API

**Global Query Path**: `$.results[*]`

| PU Property | Query Path | Notes |
|-------------|------------|-------|
| Sanctions Status | `source` | Post-process: if any result returned, set to "Potential Match" |
| Sanctions Match Details | `name` | The matched entity name from the sanctions list |
| (info) Source List | `source` | Which of the 11 lists matched (e.g., "Specially Designated Nationals") |
| (info) Match Score | `score` | Fuzzy match confidence (when using `fuzzy_name=true`) |
| (info) Entity Type | `type` | "Individual", "Entity", or "Vessel" |
| (info) Addresses | `addresses[0].country` | Country from the sanctions entry |
| (info) Remarks | `remarks` | Additional context from the sanctions entry |

### 1C. Workflow Step (Button on Third Party)

| Field | Value |
|-------|-------|
| **Step Type** | Get from External API |
| **Import Template** | *(the one created above)* |
| **External API Connection** | OFAC Consolidated Screening List |
| **Relative Path** (expression) | `"search?name=" + [Third-Party Name] + "&fuzzy_name=true&threshold=85"` |

**What happens**: When a user clicks the button on a Third Party record, PU calls the CSL API with the vendor's name, receives any matches, and maps them to the Sanctions properties.

### 1D. Automated Action (Optional — Continuous Screening)

Create an Automated Action on Third Party that triggers on:
- **Event**: Record Created, or Status Changed to "Active"
- **Step**: Same GET step as above

This auto-screens every new vendor or newly activated vendor.

---

## Connection 2: World Bank Governance Indicators (Country Risk)

### 2A. External API Connection

| Field | Value |
|-------|-------|
| **Name** | World Bank Governance Indicators |
| **Description** | World Bank country-level governance indicators (corruption, political stability, rule of law, regulatory quality) |
| **Base URL** | `https://api.worldbank.org/v2` |
| **Authentication Type** | Custom Headers |
| **Custom Header 1** | Key: `Accept`, Value: `application/json` |
| **Retry Strategy** | 1,3,5 |
| **Relative Test Path** | `country/US/indicator/CC.EST?format=json&date=2023&per_page=1` |

> **Note**: The World Bank API is completely free, no auth required. We use Custom Headers just to set Accept: application/json.

### 2B. Import Template — Control of Corruption

**Object**: Third Party
**Enable for**: Get from External API

**Global Query Path**: `$[1][*]`

> **Important**: World Bank API returns a 2-element array: `[0]` is pagination metadata, `[1]` is the data array. So the global query path must target index `[1]`.

| PU Property | Query Path | Notes |
|-------------|------------|-------|
| Control of Corruption Index | `value` | Numeric score, range approx -2.5 to +2.5 |
| Country Risk Last Updated | `date` | Year of the measurement |

### 2C. Workflow Step

| Field | Value |
|-------|-------|
| **Step Type** | Get from External API |
| **Import Template** | *(Control of Corruption template)* |
| **External API Connection** | World Bank Governance Indicators |
| **Relative Path** (expression) | `"country/" + [Country Code] + "/indicator/CC.EST?format=json&date=2020:2023&per_page=1&mrv=1"` |

> **`mrv=1`** = "most recent value" — returns only the latest year with data.

### 2D. Additional Indicators

Repeat 2B and 2C for each governance indicator, changing the indicator code:

| Indicator | Code | PU Property |
|-----------|------|-------------|
| Political Stability | `PV.EST` | Political Stability Index |
| Rule of Law | `RL.EST` | Rule of Law Index |
| Regulatory Quality | `RQ.EST` | Regulatory Quality Index |
| Control of Corruption | `CC.EST` | Control of Corruption Index |

**Option A**: Create 4 separate Import Templates + 4 GET steps on one button (PU executes steps sequentially).
**Option B**: Create 1 Import Template and use a single GET step, but this requires the API to return all 4 in one call. World Bank doesn't support multi-indicator in one call, so Option A is the way to go.

---

## Connection 3: SEC EDGAR (US Financial Filings)

### 3A. External API Connection

| Field | Value |
|-------|-------|
| **Name** | SEC EDGAR Full-Text Search |
| **Description** | SEC EDGAR filing search — finds 10-K, 10-Q, 8-K filings for US public companies |
| **Base URL** | `https://efts.sec.gov/LATEST` |
| **Authentication Type** | Custom Headers |
| **Custom Header 1** | Key: `User-Agent`, Value: `ProcessUnity Integration admin@yourcompany.com` |
| **Custom Header 2** | Key: `Accept`, Value: `application/json` |
| **Retry Strategy** | 1,3,5 |
| **Relative Test Path** | `search-index?q=%22Microsoft%22&forms=10-K` |

> **Critical**: SEC EDGAR requires a `User-Agent` header with a company name and contact email. Without it, requests return 403.

### 3B. Import Template

**Object**: Third Party
**Enable for**: Get from External API

**Global Query Path**: `$.hits.hits[0]._source`

> This targets the first (best) search result's source data.

| PU Property | Query Path | Notes |
|-------------|------------|-------|
| SEC CIK Number | `ciks[0]` | CIK identifier (e.g., "0000789019") |
| Last SEC Filing Date | `file_date` | Filing date (e.g., "2024-07-30") |
| SEC Filing Type | `root_forms[0]` | Form type (e.g., "10-K") |
| SEC Filing Description | `display_names[0]` | Company display name with ticker (e.g., "MICROSOFT CORP (MSFT)") |
| SIC Code | `sics[0]` | Standard Industrial Classification code |
| Business Location | `biz_locations[0]` | Business location (e.g., "Redmond, WA") |

### 3C. Workflow Step

| Field | Value |
|-------|-------|
| **Step Type** | Get from External API |
| **Import Template** | *(SEC EDGAR template)* |
| **External API Connection** | SEC EDGAR Full-Text Search |
| **Relative Path** (expression) | `"search-index?q=%22" + [Third-Party Name] + "%22&forms=10-K&dateRange=custom&startdt=2024-01-01&enddt=2026-12-31"` |

> The `%22` encodes double-quotes for an exact name match. Adjust date range as needed.

---

## Connection 4: GDELT (Geopolitical News Intelligence)

### 4A. External API Connection

| Field | Value |
|-------|-------|
| **Name** | GDELT News Intelligence |
| **Description** | Real-time global news monitoring — articles mentioning vendor name by country, updated every 15 minutes |
| **Base URL** | `https://api.gdeltproject.org/api/v2` |
| **Authentication Type** | Custom Headers |
| **Custom Header 1** | Key: `Accept`, Value: `application/json` |
| **Retry Strategy** | 1,3,5 |
| **Relative Test Path** | `doc/doc?query=Microsoft&mode=artlist&format=json&maxrecords=1` |

> **Free, no auth required.** The world's largest open news monitoring database.

### 4B. Import Template

**Object**: Third Party
**Enable for**: Get from External API

**Global Query Path**: `$.articles[0]`

> Targets the first (most relevant) article. To process multiple, use `$.articles[*]` but note PU will create/update multiple records.

| PU Property | Query Path | Notes |
|-------------|------------|-------|
| Geopolitical News Summary | `title` | Headline of the most relevant article |
| Geopolitical News Source | `domain` | Source domain (e.g., "reuters.com") |
| Geopolitical Last Checked | *(set via workflow)* | Use a Set Property step to stamp today's date |

### 4C. Workflow Step

| Field | Value |
|-------|-------|
| **Step Type** | Get from External API |
| **Import Template** | *(GDELT template)* |
| **External API Connection** | GDELT News Intelligence |
| **Relative Path** (expression) | `"doc/doc?query=" + [Third-Party Name] + "&mode=artlist&format=json&maxrecords=5&sourcelang=english"` |

---

## Connection 5: UK Companies House (Beneficial Ownership)

### 5A. External API Connection

| Field | Value |
|-------|-------|
| **Name** | UK Companies House |
| **Description** | UK company registry — company profile, officers, and persons with significant control (beneficial owners) |
| **Base URL** | `https://api.companieshouse.gov.uk` |
| **Authentication Type** | Basic |
| **External API Username** | *(Your Companies House API key — get free from https://developer.company-information.service.gov.uk)* |
| **External API Password** | *(leave empty)* |
| **Retry Strategy** | 1,3,5 |
| **Relative Test Path** | `search/companies?q=Rolls+Royce` |

> **Free tier**: 600 requests per 5 minutes. API key used as username with empty password (HTTP Basic auth).

### 5B. Import Template — Company Search

**Object**: Third Party
**Enable for**: Get from External API

**Global Query Path**: `$.items[0]`

> Targets the top search result.

| PU Property | Query Path | Notes |
|-------------|------------|-------|
| UK Company Number | `company_number` | e.g., "00234567" |
| UK Company Status | `company_status` | e.g., "active", "dissolved" |
| UK Incorporation Date | `date_of_creation` | e.g., "1906-03-15" |

### 5C. Workflow Step — Company Search

| Field | Value |
|-------|-------|
| **Step Type** | Get from External API |
| **Import Template** | *(Companies House Search template)* |
| **External API Connection** | UK Companies House |
| **Relative Path** (expression) | `"search/companies?q=" + [Third-Party Name]` |

### 5D. Import Template — Persons with Significant Control (PSCs)

> **Requires company_number** from the search step above. Chain this as Step 2 on the same button.

**Global Query Path**: `$.items[*]`

| PU Property | Query Path | Notes |
|-------------|------------|-------|
| Beneficial Owners | `name` | PSC name (individual or corporate) |
| (info) Nationality | `nationality` | Nationality of the beneficial owner |
| (info) Country of Residence | `country_of_residence` | Where they reside |
| (info) Natures of Control | `natures_of_control[0]` | e.g., "ownership-of-shares-75-to-100-percent" |

### 5E. Workflow Step — PSC Lookup (Step 2)

| Field | Value |
|-------|-------|
| **Step Type** | Get from External API |
| **Import Template** | *(PSC template)* |
| **External API Connection** | UK Companies House |
| **Relative Path** (expression) | `"company/" + [UK Company Number] + "/persons-with-significant-control"` |

> **Important**: This step depends on the UK Company Number property being populated by Step 1 (5C). Place it as the second step in the button workflow.

---

## Connection 6: CISA Known Exploited Vulnerabilities (KEV)

### 6A. External API Connection

| Field | Value |
|-------|-------|
| **Name** | CISA KEV Catalog |
| **Description** | CISA Known Exploited Vulnerabilities catalog — CVEs actively exploited in the wild |
| **Base URL** | `https://www.cisa.gov/sites/default/files/feeds` |
| **Authentication Type** | Custom Headers |
| **Custom Header 1** | Key: `Accept`, Value: `application/json` |
| **Retry Strategy** | 1,3,5 |
| **Relative Test Path** | `known_exploited_vulnerabilities.json` |

### 6B. Limitations

> **Important**: Unlike the other APIs, CISA KEV returns the **entire catalog** (~1,200 CVEs, ~1.5 MB) in one call. It is NOT queryable per-vendor. This means:
>
> - The JSON response exceeds PU's **10MB payload limit** per step — should be fine at ~1.5MB
> - There's no way to filter by vendor name in the API call itself
> - You'd need to import the full catalog and then use PU reporting/filtering to cross-reference against your vendor's technology stack
>
> **Recommended approach**: Use this as a **reference data import** rather than per-vendor enrichment. Import the KEV catalog into a Reference Data or Threat object type, then build reports that cross-reference vendor technology stacks.

### 6C. Import Template (Reference Data Approach)

**Object**: Threat (or Reference Data)
**Enable for**: Get from External API

**Global Query Path**: `$.vulnerabilities[*]`

| PU Property | Query Path | Notes |
|-------------|------------|-------|
| Name | `cveID` | e.g., "CVE-2024-1234" |
| Description | `shortDescription` | Vulnerability description |
| Threat Severity | `knownRansomwareCampaignUse` | "Known" or "Unknown" |
| (info) Vendor/Project | `vendorProject` | e.g., "Microsoft", "Apache" |
| (info) Product | `product` | e.g., "Windows", "Log4j" |
| (info) Date Added | `dateAdded` | When CISA added it to KEV |
| (info) Due Date | `dueDate` | Required remediation deadline |
| (info) Required Action | `requiredAction` | Remediation instruction |

---

## Recommended Button Layouts

### Button: "Screen Vendor" (on Third Party)
**Steps** (executed sequentially):
1. **GET** — OFAC CSL screening (Connection 1)
2. **Set Property** — Last Sanctions Screen Date = Today

### Button: "Enrich Country Risk" (on Third Party)
**Steps**:
1. **GET** — World Bank: Control of Corruption (Connection 2, CC.EST)
2. **GET** — World Bank: Political Stability (Connection 2, PV.EST)
3. **GET** — World Bank: Rule of Law (Connection 2, RL.EST)
4. **GET** — World Bank: Regulatory Quality (Connection 2, RQ.EST)
5. **Set Property** — Country Risk Last Updated = Today
6. **Set Property** — Country Risk Score = *(expression averaging the 4 indicators)*

### Button: "Lookup SEC Filings" (on Third Party)
**Condition**: Only show when Country = US
**Steps**:
1. **GET** — SEC EDGAR search (Connection 3)

### Button: "Check UK Ownership" (on Third Party)
**Condition**: Only show when Country = GB or UK
**Steps**:
1. **GET** — Companies House search (Connection 5C)
2. **GET** — Companies House PSC lookup (Connection 5E)

### Button: "Check News" (on Third Party)
**Steps**:
1. **GET** — GDELT news search (Connection 4)
2. **Set Property** — Geopolitical Last Checked = Today

### Report Action: "Screen All Vendors" (on Third Party report)
**Steps**: Same as "Screen Vendor" button — runs for each selected vendor in the report.

### Automated Action: "Auto-Screen New Vendors"
**Trigger**: Third Party record created
**Condition**: Status = Active
**Steps**: Same as "Screen Vendor" button

---

## Automated Actions for Continuous Monitoring

| Automated Action | Trigger | Schedule | Steps |
|-----------------|---------|----------|-------|
| Auto-Screen New Vendors | Record Created | Immediate | CSL screening |
| Weekly Sanctions Rescreen | Scheduled | Weekly (Sunday night) | CSL screening on all Active vendors |
| Monthly Country Risk Refresh | Scheduled | Monthly (1st) | All 4 World Bank indicators |
| Monthly News Check | Scheduled | Monthly (15th) | GDELT news search |
| Quarterly SEC Filing Check | Scheduled | Quarterly | SEC EDGAR search (US vendors only) |

---

## Send to External API (Outbound) — Bonus Configurations

These push PU data OUT to external systems.

### Send Vendor Risk Summary to Webhook

Use **Send to External API** to push vendor risk data to a Slack webhook, Teams webhook, or custom endpoint.

| Field | Value |
|-------|-------|
| **Connection Base URL** | `https://hooks.slack.com/services` |
| **Auth Type** | Custom Headers |
| **Custom Report** | Vendor Risk Summary (enable "Enable for Workflow Actions") |
| **Relative Path** | `"/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"` (Slack webhook path) |

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "General error (line 2)" on import | Non-string values | Ensure all mapped values are text/string type |
| 401 Unauthorized | Bad credentials | Re-test connection; check instance-specific credentials |
| 403 Forbidden (SEC EDGAR) | Missing User-Agent header | Add User-Agent custom header with company + email |
| 429 Too Many Requests | Rate limit hit | Retry strategy handles this; reduce batch size |
| Empty import | Wrong Global Query Path | Use Validate Mapping button with a sample JSON file |
| HTML error page instead of JSON | Wrong endpoint or auth failure | Check Base URL doesn't end with `/`; verify auth type |
| 10MB payload exceeded | Response too large (CISA KEV full catalog) | Filter the query or use pagination |
| Property not updating | Import Template mapping mismatch | Verify Query Path matches exact JSON field name |

---

## API Key / Account Registration Quick Reference

| Source | Registration URL | Cost | What You Get |
|--------|-----------------|------|-------------|
| OFAC CSL | https://developer.trade.gov (sign up > subscribe to "Data Services Platform APIs") | Free | API subscription key |
| World Bank | None needed | Free | No auth required |
| SEC EDGAR | None needed | Free | Just need User-Agent header |
| GDELT | None needed | Free | No auth required |
| Companies House | https://developer.company-information.service.gov.uk | Free | API key (used as Basic auth username) |
| CISA KEV | None needed | Free | No auth required |
