<script>
  let activeSection = 'auth';

  const sections = [
    { id: 'auth', label: 'Authentication' },
    { id: 'leads', label: 'Leads' },
    { id: 'verticals', label: 'Verticals' },
    { id: 'chatbot', label: 'Chatbot' },
    { id: 'import', label: 'CSV Import' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'rate-limits', label: 'Rate Limits' },
    { id: 'sdks', label: 'SDKs' },
  ];
</script>

<svelte:head>
  <title>API Documentation | Leadova</title>
  <meta name="description" content="Full REST API documentation for the Leadova lead generation platform." />
</svelte:head>

<div class="docs-layout">
  <!-- Sidebar -->
  <nav class="docs-sidebar">
    <div class="sidebar-header">
      <a href="/" class="sidebar-logo">Leadova</a>
      <span class="sidebar-badge">API Docs</span>
    </div>
    <ul class="sidebar-nav">
      {#each sections as sec}
        <li>
          <button
            class="nav-item"
            class:active={activeSection === sec.id}
            on:click={() => activeSection = sec.id}
          >{sec.label}</button>
        </li>
      {/each}
    </ul>
    <div class="sidebar-footer">
      <span>Base URL</span>
      <code>https://api.leadova.com/api/v1</code>
    </div>
  </nav>

  <!-- Main content -->
  <main class="docs-main">
    {#if activeSection === 'auth'}
      <section class="doc-section">
        <h1>Authentication</h1>
        <p>All authenticated endpoints require a Bearer token in the <code>Authorization</code> header.</p>

        <h2>Get a Token</h2>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/auth/login</code>
        </div>
        <h3>Request Body</h3>
        <div class="code-box"><pre><code>&#123;
  "email": "user@example.com",
  "password": "your-password"
&#125;</code></pre></div>

        <h3>Response</h3>
        <div class="code-box"><pre><code>&#123;
  "success": true,
  "data": &#123;
    "token": "eyJhbGci...",
    "user": &#123;
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "subscriber"
    &#125;
  &#125;
&#125;</code></pre></div>

        <h3>Using the Token</h3>
        <div class="code-box"><pre><code>Authorization: Bearer eyJhbGci...</code></pre></div>

        <div class="info-box">
          <strong>Token Expiry:</strong> Tokens are valid for 7 days by default. Request a new token before expiry.
        </div>

        <h2>Create an Account</h2>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/auth/signup</code>
        </div>
        <h3>Request Body</h3>
        <div class="code-box"><pre><code>&#123;
  "email": "user@example.com",
  "password": "min-10-chars-pw",
  "name": "John Doe",
  "role": "subscriber"
&#125;</code></pre></div>
      </section>
    {/if}

    {#if activeSection === 'leads'}
      <section class="doc-section">
        <h1>Leads</h1>

        <h2>Submit a Lead (Public)</h2>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/leads/ingest</code>
        </div>
        <p>Submit a lead from a web form or integration. No authentication required.</p>
        <h3>Request Body</h3>
        <div class="code-box"><pre><code>&#123;
  "vertical_slug": "roofing",
  "country_code": "US",
  "fields": &#123;
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "address": "123 Main St, Springfield",
    "service_type": "Repair"
  &#125;,
  "consent_text_shown": "I consent to having my information...",
  "consent_given": true
&#125;</code></pre></div>
        <h3>Response (201)</h3>
        <div class="code-box"><pre><code>&#123;
  "success": true,
  "data": &#123;
    "lead_id": 42,
    "message": "Thank you for your submission."
  &#125;
&#125;</code></pre></div>

        <h2>List Leads (Authenticated)</h2>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/leads?page=1&limit=50&status=new&q=search</code>
        </div>
        <p>Returns leads in your subscribed verticals/countries. Contact info is redacted unless revealed.</p>
        <h3>Query Parameters</h3>
        <table class="params-table">
          <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td><code>page</code></td><td>number</td><td>Page number (default: 1)</td></tr>
            <tr><td><code>limit</code></td><td>number</td><td>Results per page (default: 50, max: 100)</td></tr>
            <tr><td><code>status</code></td><td>string</td><td>Filter: new, verified, contacted, converted, rejected</td></tr>
            <tr><td><code>vertical_id</code></td><td>number</td><td>Filter by vertical</td></tr>
            <tr><td><code>country_id</code></td><td>number</td><td>Filter by country</td></tr>
            <tr><td><code>q</code></td><td>string</td><td>Search in custom fields</td></tr>
          </tbody>
        </table>

        <h2>Reveal Contact Info</h2>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/leads/:id/reveal</code>
        </div>
        <p>Reveals email and phone for a lead. Requires active subscription for that vertical+country. Logs access.</p>
        <h3>Response (200)</h3>
        <div class="code-box"><pre><code>&#123;
  "success": true,
  "data": &#123;
    "lead_id": 42,
    "email": "john@example.com",
    "phone": "+15551234567",
    "full_name": "John Doe",
    "all_fields": &#123; ... &#125;
  &#125;
&#125;</code></pre></div>
        <h3>Response (402 - No Subscription)</h3>
        <div class="code-box"><pre><code>&#123;
  "success": false,
  "error": &#123;
    "code": "SUBSCRIPTION_REQUIRED",
    "message": "Active subscription required",
    "pricing": &#123;
      "vertical_name": "Roofing",
      "price": 149,
      "currency_code": "USD"
    &#125;
  &#125;
&#125;</code></pre></div>

        <h2>Contact Lead via Platform</h2>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/leads/:id/contact</code>
        </div>
        <h3>Request Body</h3>
        <div class="code-box"><pre><code>&#123;
  "subject": "Re: Your roofing inquiry",
  "message": "Hi John, I received your inquiry..."
&#125;</code></pre></div>

        <h2>Update Lead Status</h2>
        <div class="endpoint">
          <span class="method patch">PATCH</span>
          <code>/leads/:id/status</code>
        </div>
        <h3>Request Body</h3>
        <div class="code-box"><pre><code>&#123;
  "status": "contacted"
&#125;</code></pre></div>
        <p>Valid statuses: <code>new</code>, <code>contacted</code>, <code>converted</code>, <code>rejected</code>.</p>

        <h2>Export Leads as CSV</h2>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/leads/export</code>
        </div>
        <p>Returns a CSV file with all leads in your subscribed verticals.</p>
      </section>
    {/if}

    {#if activeSection === 'verticals'}
      <section class="doc-section">
        <h1>Verticals</h1>

        <h2>List All Verticals</h2>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/verticals</code>
        </div>
        <p>Public endpoint. Returns all verticals with their active countries and pricing.</p>

        <h2>Get Vertical Details</h2>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/verticals/:slug</code>
        </div>
        <p>Returns a vertical with full details including form fields, countries, and landing page configuration.</p>
        <h3>Response</h3>
        <div class="code-box"><pre><code>&#123;
  "success": true,
  "data": &#123;
    "vertical": &#123;
      "id": 3,
      "slug": "roofing",
      "name": "Roofing",
      "form_fields": [
        &#123;
          "name": "full_name",
          "label": "Full Name",
          "type": "text",
          "required": true
        &#125;,
        &#123;
          "name": "service_type",
          "label": "Service Needed",
          "type": "select",
          "required": true,
          "options": ["Repair", "Replacement", "Inspection"]
        &#125;
      ]
    &#125;,
    "countries": [ ... ]
  &#125;
&#125;</code></pre></div>
      </section>
    {/if}

    {#if activeSection === 'chatbot'}
      <section class="doc-section">
        <h1>Chatbot API</h1>
        <p>Conversational lead collection. The chatbot walks users through qualifying questions defined in the vertical configuration.</p>

        <h2>Start a Session</h2>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/chatbot/start</code>
        </div>
        <h3>Request Body</h3>
        <div class="code-box"><pre><code>&#123;
  "vertical_slug": "insurance",
  "country_code": "PH"
&#125;</code></pre></div>
        <h3>Response</h3>
        <div class="code-box"><pre><code>&#123;
  "success": true,
  "data": &#123;
    "session_id": "cs_abc123...",
    "message": "Hi! I can help you find...",
    "status": "collecting",
    "field": &#123;
      "name": "full_name",
      "label": "Full Name",
      "type": "text",
      "required": true
    &#125;,
    "progress": &#123; "current": 0, "total": 5 &#125;
  &#125;
&#125;</code></pre></div>

        <h2>Send a Message</h2>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/chatbot/message</code>
        </div>
        <h3>Request Body</h3>
        <div class="code-box"><pre><code>&#123;
  "session_id": "cs_abc123...",
  "message": "John Doe"
&#125;</code></pre></div>

        <h2>Get Session State</h2>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/chatbot/session/:id</code>
        </div>

        <h3>Chatbot Flow</h3>
        <div class="flow-diagram">
          <div class="flow-step">Start Session</div>
          <div class="flow-arrow">--></div>
          <div class="flow-step">Collect Fields (one by one)</div>
          <div class="flow-arrow">--></div>
          <div class="flow-step">Consent Prompt</div>
          <div class="flow-arrow">--></div>
          <div class="flow-step">Lead Submitted</div>
        </div>
      </section>
    {/if}

    {#if activeSection === 'import'}
      <section class="doc-section">
        <h1>CSV Import</h1>

        <h2>Import Leads from CSV</h2>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/import/csv</code>
        </div>
        <p>Requires subscriber or admin authentication. Validates rows against vertical field definitions and checks for duplicates.</p>
        <h3>Request Body</h3>
        <div class="code-box"><pre><code>&#123;
  "csv_text": "full_name,email,phone,service_type\nJohn,john@x.com,555-1234,Repair\n...",
  "vertical_slug": "roofing",
  "country_code": "US",
  "consent_text": "Consent captured at source...",
  "column_mapping": &#123;
    "Name": "full_name",
    "Email Address": "email"
  &#125;
&#125;</code></pre></div>
        <h3>Response</h3>
        <div class="code-box"><pre><code>&#123;
  "success": true,
  "data": &#123;
    "total": 100,
    "imported": 95,
    "skipped": 5,
    "errors": [
      &#123; "row": 12, "message": "Missing required fields: email" &#125;,
      &#123; "row": 47, "message": "Duplicate: john@x.com already exists" &#125;
    ]
  &#125;
&#125;</code></pre></div>

        <div class="info-box">
          <strong>Limits:</strong> Maximum 5,000 rows per import. The <code>column_mapping</code> field is optional -- if CSV headers match field names exactly, mapping is automatic.
        </div>
      </section>
    {/if}

    {#if activeSection === 'webhooks'}
      <section class="doc-section" id="webhooks">
        <h1>Webhooks</h1>
        <p>Register webhook endpoints to receive real-time notifications when events occur.</p>

        <h2>Events</h2>
        <table class="params-table">
          <thead><tr><th>Event</th><th>Description</th><th>Payload</th></tr></thead>
          <tbody>
            <tr>
              <td><code>lead.created</code></td>
              <td>A new lead is submitted in your subscribed vertical+country</td>
              <td>Lead object (contact redacted)</td>
            </tr>
            <tr>
              <td><code>lead.status_changed</code></td>
              <td>A lead's status changes (verified, contacted, etc.)</td>
              <td>Lead ID, old status, new status</td>
            </tr>
          </tbody>
        </table>

        <h2>Payload Format</h2>
        <div class="code-box"><pre><code>&#123;
  "event": "lead.created",
  "timestamp": "2026-04-09T12:00:00.000Z",
  "data": &#123;
    "lead_id": 42,
    "vertical_slug": "roofing",
    "country_code": "US",
    "source": "web",
    "status": "new",
    "created_at": "2026-04-09T12:00:00.000Z"
  &#125;
&#125;</code></pre></div>

        <h2>Signature Verification</h2>
        <p>Each webhook request includes an <code>X-Leadova-Signature</code> header containing an HMAC-SHA256 signature of the request body, using your webhook secret as the key.</p>
        <div class="code-box"><pre><code>const crypto = require('crypto');

function verifyWebhook(body, signature, secret) &#123;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
&#125;</code></pre></div>

        <div class="info-box">
          <strong>Retries:</strong> Failed deliveries are retried up to 3 times with exponential backoff (10s, 60s, 300s). Your endpoint must return a 2xx status within 10 seconds.
        </div>
      </section>
    {/if}

    {#if activeSection === 'rate-limits'}
      <section class="doc-section">
        <h1>Rate Limits</h1>
        <table class="params-table">
          <thead><tr><th>Tier</th><th>Rate Limit</th><th>Burst</th></tr></thead>
          <tbody>
            <tr><td>Public (no auth)</td><td>30 requests/min</td><td>10 requests/sec</td></tr>
            <tr><td>Authenticated</td><td>100 requests/min</td><td>20 requests/sec</td></tr>
            <tr><td>Enterprise</td><td>500 requests/min</td><td>50 requests/sec</td></tr>
          </tbody>
        </table>

        <h2>Rate Limit Headers</h2>
        <div class="code-box"><pre><code>X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1712678400</code></pre></div>

        <h2>Exceeded Response (429)</h2>
        <div class="code-box"><pre><code>&#123;
  "success": false,
  "error": &#123;
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait.",
    "retry_after": 32
  &#125;
&#125;</code></pre></div>
      </section>
    {/if}

    {#if activeSection === 'sdks'}
      <section class="doc-section">
        <h1>SDKs and Libraries</h1>

        <h2>Node.js / TypeScript</h2>
        <div class="code-box"><pre><code>npm install @leadova/sdk</code></pre></div>
        <div class="code-box"><pre><code>import &#123; LeadovaClient &#125; from '@leadova/sdk';

const client = new LeadovaClient(&#123;
  apiKey: process.env.LEADOVA_API_KEY,
&#125;);

// Submit a lead
const lead = await client.leads.create(&#123;
  vertical: 'roofing',
  country: 'US',
  fields: &#123; full_name: 'John Doe', email: 'john@example.com' &#125;,
  consent: true,
&#125;);

// List leads
const leads = await client.leads.list(&#123; page: 1, limit: 50 &#125;);

// Start chatbot session
const session = await client.chatbot.start('insurance', 'PH');</code></pre></div>

        <h2>Python</h2>
        <div class="code-box"><pre><code>pip install leadova</code></pre></div>
        <div class="code-box"><pre><code>from leadova import LeadovaClient

client = LeadovaClient(api_key="your-api-key")

# Submit a lead
lead = client.leads.create(
    vertical="roofing",
    country="US",
    fields=&#123;"full_name": "Jane Doe", "email": "jane@example.com"&#125;,
    consent=True,
)

# List leads
leads = client.leads.list(page=1, limit=50)</code></pre></div>

        <div class="info-box">
          <strong>Community SDKs:</strong> SDKs for PHP, Ruby, Go, and Java are planned. Contact us at developers@leadova.com if you would like early access or to contribute.
        </div>
      </section>
    {/if}
  </main>
</div>

<style>
  .docs-layout { display: flex; min-height: calc(100vh - 60px); }

  .docs-sidebar {
    width: 260px; flex-shrink: 0; background: var(--navy-dark);
    color: white; padding: 1.5rem 0; position: sticky; top: 50px;
    height: calc(100vh - 50px); overflow-y: auto; display: flex; flex-direction: column;
  }
  .sidebar-header { padding: 0 1.25rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .sidebar-logo { font-family: var(--font-heading); font-weight: 700; font-size: 1.2rem; color: white; }
  .sidebar-badge { display: inline-block; margin-left: 0.5rem; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.68rem; font-weight: 700; background: var(--green); color: white; }

  .sidebar-nav { list-style: none; padding: 0.75rem 0; flex: 1; }
  .sidebar-nav li { margin: 0; }
  .nav-item {
    display: block; width: 100%; text-align: left; padding: 0.6rem 1.25rem;
    font-size: 0.88rem; color: rgba(255,255,255,0.6);
    background: none; border: none; cursor: pointer; font-family: inherit;
    border-left: 3px solid transparent; transition: all 0.15s;
  }
  .nav-item:hover { color: white; background: rgba(255,255,255,0.05); }
  .nav-item.active { color: white; background: rgba(255,255,255,0.08); border-left-color: var(--green); font-weight: 600; }

  .sidebar-footer {
    padding: 1rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.1);
    font-size: 0.78rem; color: rgba(255,255,255,0.4);
  }
  .sidebar-footer code { display: block; margin-top: 0.25rem; color: rgba(255,255,255,0.7); font-size: 0.75rem; }

  .docs-main { flex: 1; padding: 2rem 3rem; max-width: 800px; }
  .doc-section h1 { font-size: 1.75rem; margin-bottom: 0.75rem; }
  .doc-section h2 { font-size: 1.25rem; margin: 2rem 0 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border); }
  .doc-section h2:first-of-type { border-top: none; padding-top: 0; }
  .doc-section h3 { font-size: 0.95rem; margin: 1rem 0 0.5rem; }
  .doc-section p { color: var(--text-muted); font-size: 0.92rem; line-height: 1.7; margin-bottom: 0.75rem; }
  .doc-section code { background: var(--bg-surface); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.85rem; font-family: 'SF Mono', 'Fira Code', monospace; }

  .endpoint {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 1rem; background: var(--bg-surface); border-radius: 8px;
    margin-bottom: 1rem; border: 1px solid var(--border);
  }
  .method {
    padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.72rem;
    font-weight: 700; text-transform: uppercase;
  }
  .method.get { background: rgba(14,165,233,0.12); color: var(--teal); }
  .method.post { background: rgba(34,197,94,0.12); color: var(--green); }
  .method.patch { background: rgba(245,158,11,0.12); color: var(--orange); }
  .method.delete { background: rgba(239,68,68,0.12); color: var(--red); }
  .endpoint code { background: none; font-size: 0.9rem; font-weight: 500; }

  .code-box {
    background: var(--navy-dark); border-radius: 8px; overflow: hidden;
    margin-bottom: 1rem;
  }
  .code-box pre { margin: 0; padding: 1rem; overflow-x: auto; }
  .code-box code { color: #e2e8f0; background: none; font-size: 0.82rem; line-height: 1.65; }

  .params-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.88rem; }
  .params-table th { text-align: left; padding: 0.6rem 0.75rem; background: var(--bg-surface); font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--border); }
  .params-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border-subtle); }

  .info-box {
    padding: 1rem 1.25rem; background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2);
    border-radius: 8px; font-size: 0.88rem; color: var(--text); margin: 1rem 0;
  }

  .flow-diagram {
    display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
    padding: 1rem; background: var(--bg-surface); border-radius: 8px; margin: 1rem 0;
  }
  .flow-step {
    padding: 0.5rem 1rem; background: white; border: 1px solid var(--border);
    border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: var(--navy);
  }
  .flow-arrow { color: var(--text-dim); font-family: monospace; }

  @media (max-width: 768px) {
    .docs-layout { flex-direction: column; }
    .docs-sidebar {
      width: 100%; position: static; height: auto;
      flex-direction: row; flex-wrap: wrap; padding: 0.75rem;
    }
    .sidebar-header { padding: 0 0.5rem 0.75rem; width: 100%; }
    .sidebar-nav { display: flex; flex-wrap: wrap; gap: 0.25rem; padding: 0; }
    .nav-item { padding: 0.4rem 0.75rem; font-size: 0.8rem; border-left: none; border-radius: 6px; }
    .nav-item.active { border-left: none; }
    .sidebar-footer { width: 100%; padding: 0.5rem; }
    .docs-main { padding: 1.5rem; }
  }
</style>
