<script>
  let applyName = '';
  let applyEmail = '';
  let applyCompany = '';
  let applyUseCase = '';
  let applySubmitting = false;
  let applySuccess = false;

  async function handleApply() {
    if (!applyName || !applyEmail || !applyCompany) return;
    applySubmitting = true;

    try {
      const res = await fetch('/api/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: applyEmail,
          user_type: 'partner',
          source: '/partners',
          metadata: { name: applyName, company: applyCompany, use_case: applyUseCase },
        }),
      });
      const data = await res.json();
      if (data.success) applySuccess = true;
    } catch (err) {
      console.error('Apply error', err);
    }
    applySubmitting = false;
  }
</script>

<svelte:head>
  <title>Partners & Integrations | Leadova</title>
  <meta name="description" content="Integrate with Leadova via REST API, CSV imports, or webhooks. Build on our lead generation platform." />
</svelte:head>

<section class="hero-sm">
  <div class="container">
    <h1>Partner Integrations</h1>
    <p>Connect your systems to Leadova via API, CSV import, or webhooks.</p>
  </div>
</section>

<div class="container page">
  <!-- Integration options -->
  <section class="options-section">
    <h2>Integration Methods</h2>
    <div class="options-grid">
      <div class="option-card card">
        <div class="option-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5"><path d="M21 2H3v7h18V2z"/><path d="M21 15H3v7h18v-7z"/><path d="M12 9v6"/></svg>
        </div>
        <h3>REST API</h3>
        <p>Full programmatic access to leads, verticals, and subscriptions. Submit leads, query data, and manage your account.</p>
        <ul>
          <li>JSON request/response format</li>
          <li>Bearer token authentication</li>
          <li>100 requests/minute rate limit</li>
          <li>Comprehensive error codes</li>
        </ul>
        <a href="/developers" class="btn btn-secondary">View API Docs</a>
      </div>

      <div class="option-card card">
        <div class="option-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <h3>CSV Import</h3>
        <p>Bulk import leads from spreadsheets. Upload a CSV, map columns to fields, and import with validation and deduplication.</p>
        <ul>
          <li>Up to 5,000 rows per import</li>
          <li>Column mapping UI</li>
          <li>Duplicate detection (email + phone)</li>
          <li>Per-row validation and error reporting</li>
        </ul>
        <a href="/dashboard/import" class="btn btn-secondary">Import CSV</a>
      </div>

      <div class="option-card card">
        <div class="option-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </div>
        <h3>Webhooks</h3>
        <p>Receive real-time notifications when leads are created or status changes. Push data to your CRM automatically.</p>
        <ul>
          <li>Events: lead.created, lead.status_changed</li>
          <li>HMAC signature verification</li>
          <li>Automatic retries (3 attempts)</li>
          <li>Configurable per subscription</li>
        </ul>
        <a href="/developers#webhooks" class="btn btn-secondary">Webhook Docs</a>
      </div>
    </div>
  </section>

  <!-- Quick API preview -->
  <section class="api-preview">
    <h2>API Quick Start</h2>
    <div class="code-examples">
      <div class="code-block card">
        <div class="code-header">
          <span class="code-lang">cURL</span>
          <span class="code-label">Submit a lead</span>
        </div>
        <pre><code>curl -X POST https://api.leadova.com/api/v1/leads/ingest \
  -H "Content-Type: application/json" \
  -d '&#123;
    "vertical_slug": "roofing",
    "country_code": "US",
    "fields": &#123;
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+15551234567",
      "service_type": "Repair"
    &#125;,
    "consent_text_shown": "I consent to...",
    "consent_given": true
  &#125;'</code></pre>
      </div>

      <div class="code-block card">
        <div class="code-header">
          <span class="code-lang">Node.js</span>
          <span class="code-label">Fetch leads</span>
        </div>
        <pre><code>const res = await fetch(
  'https://api.leadova.com/api/v1/leads',
  &#123;
    headers: &#123;
      Authorization: `Bearer $&#123;API_TOKEN&#125;`,
    &#125;,
  &#125;
);
const data = await res.json();
console.log(data.data.leads);</code></pre>
      </div>

      <div class="code-block card">
        <div class="code-header">
          <span class="code-lang">Python</span>
          <span class="code-label">Submit a lead</span>
        </div>
        <pre><code>import requests

resp = requests.post(
    "https://api.leadova.com/api/v1/leads/ingest",
    json=&#123;
        "vertical_slug": "insurance",
        "country_code": "PH",
        "fields": &#123;
            "full_name": "Maria Santos",
            "email": "maria@example.com",
            "phone": "+639171234567",
            "insurance_type": "Life",
        &#125;,
        "consent_text_shown": "I consent to...",
        "consent_given": True,
    &#125;,
)
print(resp.json())</code></pre>
      </div>
    </div>
  </section>

  <!-- Apply for access -->
  <section class="apply-section">
    <div class="apply-card card">
      {#if applySuccess}
        <div class="apply-success">
          <h2>Application Received</h2>
          <p>We will review your application and contact you within 2 business days with API credentials.</p>
        </div>
      {:else}
        <h2>Apply for API Access</h2>
        <p class="apply-sub">Tell us about your integration needs and we will set up your credentials.</p>
        <form on:submit|preventDefault={handleApply}>
          <div class="form-row">
            <label>
              Your Name *
              <input type="text" bind:value={applyName} required />
            </label>
            <label>
              Email *
              <input type="email" bind:value={applyEmail} required />
            </label>
          </div>
          <label>
            Company Name *
            <input type="text" bind:value={applyCompany} required />
          </label>
          <label>
            Use Case
            <textarea bind:value={applyUseCase} rows="3" placeholder="How do you plan to use the API?"></textarea>
          </label>
          <button type="submit" class="btn btn-primary" disabled={applySubmitting} style="width:100%;justify-content:center;">
            {applySubmitting ? 'Submitting...' : 'Apply for API Access'}
          </button>
        </form>
      {/if}
    </div>
  </section>
</div>

<style>
  .hero-sm { background: var(--navy); color: white; padding: 3rem 0; text-align: center; }
  .hero-sm h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
  .hero-sm p { color: rgba(255,255,255,0.7); }
  .page { padding: 3rem 0; }

  .options-section { margin-bottom: 4rem; }
  .options-section h2, .api-preview h2 { font-size: 1.75rem; text-align: center; margin-bottom: 2rem; }
  .options-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  .option-card { display: flex; flex-direction: column; }
  .option-icon { margin-bottom: 1rem; }
  .option-card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
  .option-card p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; }
  .option-card ul { list-style: none; margin-bottom: 1.25rem; flex: 1; }
  .option-card li { padding: 0.3rem 0; font-size: 0.85rem; color: var(--text-muted); }
  .option-card li::before { content: '\2713  '; color: var(--green); font-weight: 700; }

  .api-preview { margin-bottom: 4rem; }
  .code-examples { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; }
  .code-block { padding: 0; overflow: hidden; }
  .code-header { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 1rem; background: var(--bg-surface); border-bottom: 1px solid var(--border); }
  .code-lang { font-weight: 700; font-size: 0.78rem; color: var(--navy); text-transform: uppercase; }
  .code-label { font-size: 0.78rem; color: var(--text-dim); }
  pre { margin: 0; padding: 1rem; overflow-x: auto; font-size: 0.8rem; line-height: 1.6; }
  code { font-family: 'SF Mono', 'Fira Code', monospace; color: var(--text); }

  .apply-section { display: flex; justify-content: center; }
  .apply-card { max-width: 550px; width: 100%; }
  .apply-card h2 { font-size: 1.35rem; margin-bottom: 0.25rem; }
  .apply-sub { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem; }
  .apply-card form { display: flex; flex-direction: column; gap: 0.9rem; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .apply-card label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.88rem; color: var(--text-muted); font-weight: 500; }
  .apply-success { text-align: center; padding: 2rem 0; }
  .apply-success h2 { color: var(--green); margin-bottom: 0.5rem; }
  .apply-success p { color: var(--text-muted); }

  @media (max-width: 768px) {
    .options-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
  }
</style>
