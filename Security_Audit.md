# 🛡️ Security Audit Report: ZenUX

**Status:** Completed
**Auditor:** AntiGravity / Security Specialist
**Scope:** ZenUX Backend (FastAPI), Frontend (React/Vite), and Infrastructure (Docker).

---

## 📊 Summary of Findings

| ID         | Finding                            | Severity   | OWASP Category                                      |
| :--------- | :--------------------------------- | :--------- | :-------------------------------------------------- |
| **SEC-01** | Overly Permissive CORS Policy      | **Medium** | A06:2021-Security Misconfiguration                  |
| **SEC-02** | Lack of API Rate Limiting          | **Medium** | A04:2021-Insecure Design                            |
| **SEC-03** | Missing Secure Headers (HSTS, CSP) | **Low**    | A06:2021-Security Misconfiguration                  |
| **SEC-04** | Zendesk Query Logic Injection      | **Low**    | A01:2021-Broken Access Control                      |
| **SEC-05** | Lack of User Authentication        | **High**   | A07:2021-Identification and Authentication Failures |

---

## 🔍 Detailed Findings

### SEC-01: Overly Permissive CORS Policy
- **Severity:** Medium
- **Location:** `backend/app/main.py`
- **Description:** The application currently allows all origins (`"allow_origins=["*"]"`) to make requests to the API.
- **Impact:** Malicious websites can make requests to your backend API on behalf of users if the backend is exposed to the internet. While currently stateless, it simplifies cross-site attacks.
- **Remediation:**
```python
# Change from:
allow_origins=["*"]

# To specific domains:
allow_origins=["http://localhost:5174", "https://your-production-ui.com"]
```

### SEC-02: Lack of API Rate Limiting
- **Severity:** Medium
- **Location:** `backend/app/main.py`
- **Description:** There is no rate limiting on the `/api/v1/search` endpoint.
- **Impact:** An attacker could automate searches to scrape your entire Zendesk database or perform a Denial of Wallet (DoW) by hitting the Zendesk API limits, causing service disruption.
- **Remediation:** Implement `slowapi` or a similar middleware to limit requests per IP.

### SEC-03: Missing Secure Headers
- **Severity:** Low
- **Location:** `backend/app/main.py`
- **Description:** The API response lacks standard security headers like `Content-Security-Policy` (CSP) and `Strict-Transport-Security` (HSTS).
- **Impact:** Increased risk of XSS and protocol downgrade attacks.
- **Remediation:** Add middleware to inject security headers.

### SEC-04: Zendesk Query Logic Injection
- **Severity:** Low
- **Location:** `backend/app/services/zendesk.py`
- **Description:** The search query is built using string concatenation: `f"subject:\"{params.q}\""`.
- **Impact:** If a user enters `foo" OR status:solved`, they might manipulate the query logic.
- **Proof of Concept:** Inputting `test" status:closed` in the search box might force closed tickets even if the UI filter says otherwise.
- **Remediation:** Sanitize or escape double quotes in `params.q` before appending to the query string.

### SEC-05: Lack of User Authentication
- **Severity:** High (Production context)
- **Location:** System Architecture
- **Description:** The web app has no login. Anyone with the URL can search Zendesk using the shared API token.
- **Impact:** Total exposure of ticket data to unauthorized users if the internal tool is mistakenly exposed online.
- **Remediation:** Integrate an Identity Provider (Auth0, Google OAuth, etc.) and restrict access to specific email domains.

---

## 🧼 General Recommendations for Designers (macOS)

1.  **Keep `.env` Private:** Never commit the `.env` file to Git. It contains your Zendesk API token.
2.  **Docker Security:** Run `docker system prune` occasionally to remove old images that might have vulnerabilities.
3.  **Zendesk Token Scoping:** Ensure the Zendesk API Token is restricted to "Read-only" permissions if write access is not required for the tool.
