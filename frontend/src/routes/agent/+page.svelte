<script>
  import { onMount } from 'svelte';
  import SignaturePad from '$lib/components/SignaturePad.svelte';

  let agent = null;
  let stats = null;
  let activityLog = [];
  let loading = true;
  let verticals = [];
  let countries = [];
  let online = true;
  let offlineQueue = [];
  let sigPad;

  // Form state
  let selectedVertical = '';
  let selectedCountry = '';
  let formFields = [];
  let formValues = {};
  let consentMethod = 'agent_verbal';
  let verbalConfirmed = false;
  let signatureData = null;
  let submitting = false;
  let submitSuccess = false;
  let submitError = '';
  let gpsLocation = null;
  let gpsLoading = false;
  let gpsError = '';
  let activeTab = 'submit';

  const headers = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  onMount(async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    // Online/offline detection
    online = navigator.onLine;
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', () => { online = false; });

    // Load offline queue
    try {
      const stored = localStorage.getItem('leadova_offline_queue');
      if (stored) offlineQueue = JSON.parse(stored);
    } catch (e) { /* ignore */ }

    try {
      const [agentRes, statsRes, logRes, verticalsRes] = await Promise.all([
        fetch('/api/v1/agents/me', { headers: headers() }),
        fetch('/api/v1/agents/stats', { headers: headers() }),
        fetch('/api/v1/agents/log', { headers: headers() }),
        fetch('/api/v1/verticals'),
      ]);

      const agentData = await agentRes.json();
      const statsData = await statsRes.json();
      const logData = await logRes.json();
      const verticalsData = await verticalsRes.json();

      if (agentData.success) agent = agentData.data.agent;
      if (statsData.success) stats = statsData.data.stats;
      if (logData.success) activityLog = logData.data.leads || [];
      if (verticalsData.success) verticals = verticalsData.data.verticals || [];
    } catch (err) {
      console.error('Agent portal load failed', err);
    }
    loading = false;

    // Auto-capture GPS
    captureGPS();
  });

  function handleOnline() {
    online = true;
    syncOfflineQueue();
  }

  async function syncOfflineQueue() {
    if (offlineQueue.length === 0) return;
    const queue = [...offlineQueue];
    offlineQueue = [];
    localStorage.setItem('leadova_offline_queue', '[]');

    for (const item of queue) {
      try {
        await fetch('/api/v1/agents/submit-lead', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(item),
        });
      } catch (err) {
        offlineQueue.push(item);
      }
    }
    localStorage.setItem('leadova_offline_queue', JSON.stringify(offlineQueue));

    // Refresh stats
    try {
      const statsRes = await fetch('/api/v1/agents/stats', { headers: headers() });
      const statsData = await statsRes.json();
      if (statsData.success) stats = statsData.data.stats;
    } catch (e) { /* ignore */ }
  }

  function captureGPS() {
    if (!navigator.geolocation) {
      gpsError = 'GPS not available on this device';
      return;
    }
    gpsLoading = true;
    gpsError = '';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        gpsLoading = false;
      },
      (err) => {
        gpsError = 'Location access denied';
        gpsLoading = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function onVerticalChange() {
    if (!selectedVertical) { formFields = []; countries = []; return; }
    const v = verticals.find(v => v.slug === selectedVertical);
    if (!v) return;
    const ff = typeof v.form_fields === 'string' ? JSON.parse(v.form_fields) : (v.form_fields || []);
    formFields = ff;
    formValues = {};
    for (const f of ff) formValues[f.name] = '';
    countries = (v.countries || []).filter(c => c.status === 'active');
    selectedCountry = '';
  }

  function handleSignatureSubmit(e) {
    signatureData = e.detail.signature;
  }

  function handleSignatureClear() {
    signatureData = null;
  }

  async function handleSubmit() {
    submitError = '';
    submitSuccess = false;
    submitting = true;

    // Validate consent
    if (consentMethod === 'agent_verbal' && !verbalConfirmed) {
      submitError = 'Please confirm verbal consent was given.';
      submitting = false;
      return;
    }
    if (consentMethod === 'agent_signature' && !signatureData) {
      submitError = 'Please capture the signature before submitting.';
      submitting = false;
      return;
    }

    const v = verticals.find(v => v.slug === selectedVertical);
    const consentText = `Lead consented ${consentMethod === 'agent_verbal' ? 'verbally' : 'via written signature'} to having their information collected for ${v?.name || selectedVertical} services. Agent collected this information in person.`;

    const payload = {
      vertical_slug: selectedVertical,
      country_code: selectedCountry,
      fields: {
        ...formValues,
        ...(gpsLocation ? { _agent_gps: `${gpsLocation.lat},${gpsLocation.lng}` } : {}),
        ...(signatureData ? { _signature: signatureData } : {}),
      },
      consent_method: consentMethod,
      consent_text_shown: consentText,
    };

    if (!online) {
      // Save to offline queue
      offlineQueue.push(payload);
      localStorage.setItem('leadova_offline_queue', JSON.stringify(offlineQueue));
      submitSuccess = true;
      submitting = false;
      return;
    }

    try {
      const res = await fetch('/api/v1/agents/submit-lead', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Submission failed');
      submitSuccess = true;

      // Refresh stats
      const statsRes = await fetch('/api/v1/agents/stats', { headers: headers() });
      const statsData = await statsRes.json();
      if (statsData.success) stats = statsData.data.stats;

      // Reset form
      formValues = {};
      for (const f of formFields) formValues[f.name] = '';
      verbalConfirmed = false;
      signatureData = null;
    } catch (err) {
      submitError = err.message || 'Something went wrong';
    }
    submitting = false;
  }

  // Computed: today's leads
  function getTodayLeads() {
    const today = new Date().toDateString();
    return activityLog.filter(e => new Date(e.created_at).toDateString() === today).length;
  }

  function getWeekLeads() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return activityLog.filter(e => new Date(e.created_at) >= weekAgo).length;
  }
</script>

<svelte:head><title>Agent Portal | Leadova</title></svelte:head>

<div class="portal">
  {#if loading}
    <div class="loading-screen">
      <div class="spinner"></div>
      <p>Loading agent portal...</p>
    </div>
  {:else if !agent}
    <div class="no-agent">
      <h2>Agent Profile Not Found</h2>
      <p>Your account does not have an agent profile. Contact an administrator to set up your agent access.</p>
      <a href="/" class="btn btn-primary big-btn">Go Home</a>
    </div>
  {:else}
    <!-- Status bar -->
    <div class="status-bar">
      <div class="status-left">
        <span class="status-dot" class:dot-green={online} class:dot-red={!online}></span>
        <span>{online ? 'Online' : 'Offline'}</span>
        {#if offlineQueue.length > 0}
          <span class="queue-badge">{offlineQueue.length} queued</span>
        {/if}
      </div>
      <span class="agent-id">{agent.agent_code}</span>
    </div>

    <!-- Tab navigation -->
    <div class="tabs">
      <button class="tab" class:active={activeTab === 'submit'} on:click={() => activeTab = 'submit'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Submit
      </button>
      <button class="tab" class:active={activeTab === 'stats'} on:click={() => activeTab = 'stats'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        Stats
      </button>
      <button class="tab" class:active={activeTab === 'history'} on:click={() => activeTab = 'history'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        History
      </button>
    </div>

    <!-- SUBMIT TAB -->
    {#if activeTab === 'submit'}
      <div class="tab-content">
        {#if submitSuccess}
          <div class="success-screen">
            <div class="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2>{online ? 'Lead Submitted' : 'Saved Offline'}</h2>
            <p>{online ? 'Successfully recorded.' : 'Will sync when you are back online.'}</p>
            <button class="btn btn-primary big-btn" on:click={() => submitSuccess = false}>Submit Another Lead</button>
          </div>
        {:else}
          <div class="form-section">
            <h2 class="section-title">New Lead</h2>

            {#if submitError}
              <div class="alert-error">{submitError}</div>
            {/if}

            <form on:submit|preventDefault={handleSubmit}>
              <!-- Vertical selector -->
              <div class="field-group">
                <label class="field-label">Service Category</label>
                <div class="big-select-wrap">
                  <select bind:value={selectedVertical} on:change={onVerticalChange} required class="big-select">
                    <option value="">Choose category...</option>
                    {#each verticals.filter(v => v.status === 'active') as v}
                      <option value={v.slug}>{v.name}</option>
                    {/each}
                  </select>
                </div>
              </div>

              {#if countries.length > 0}
                <div class="field-group">
                  <label class="field-label">Country</label>
                  <div class="big-select-wrap">
                    <select bind:value={selectedCountry} required class="big-select">
                      <option value="">Choose country...</option>
                      {#each countries as c}
                        <option value={c.code}>{c.flag_emoji} {c.name}</option>
                      {/each}
                    </select>
                  </div>
                </div>
              {/if}

              <!-- Dynamic form fields -->
              {#each formFields as field}
                <div class="field-group">
                  <label class="field-label">
                    {field.label}{field.required ? ' *' : ''}
                  </label>
                  {#if field.type === 'select' && field.options}
                    <div class="big-select-wrap">
                      <select bind:value={formValues[field.name]} required={field.required} class="big-select">
                        <option value="">Select...</option>
                        {#each field.options as opt}
                          <option value={opt}>{opt}</option>
                        {/each}
                      </select>
                    </div>
                  {:else}
                    <!-- one-way value + on:input: Svelte forbids bind:value with a dynamic type -->
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
                      value={formValues[field.name] ?? ''}
                      on:input={(e) => { formValues[field.name] = e.currentTarget.value; formValues = formValues; }}
                      required={field.required}
                      placeholder={field.label}
                      class="big-input"
                      inputmode={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'number' ? 'numeric' : 'text'}
                    />
                  {/if}
                </div>
              {/each}

              <!-- GPS indicator -->
              <div class="field-group">
                <label class="field-label">Location</label>
                <div class="gps-row">
                  {#if gpsLoading}
                    <span class="gps-status">Detecting location...</span>
                  {:else if gpsLocation}
                    <span class="gps-status gps-ok">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      Location captured
                    </span>
                  {:else}
                    <span class="gps-status gps-fail">{gpsError || 'Location not available'}</span>
                    <button type="button" class="btn-small" on:click={captureGPS}>Retry</button>
                  {/if}
                </div>
              </div>

              <!-- Consent method -->
              <div class="field-group">
                <label class="field-label">Consent Method</label>
                <div class="consent-tabs">
                  <button type="button" class="consent-tab" class:active={consentMethod === 'agent_verbal'} on:click={() => consentMethod = 'agent_verbal'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    Verbal
                  </button>
                  <button type="button" class="consent-tab" class:active={consentMethod === 'agent_signature'} on:click={() => consentMethod = 'agent_signature'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    Signature
                  </button>
                </div>

                {#if consentMethod === 'agent_verbal'}
                  <label class="verbal-check">
                    <input type="checkbox" bind:checked={verbalConfirmed} />
                    <span>I confirm the lead verbally consented to having their information collected and shared with service providers.</span>
                  </label>
                {:else}
                  <div class="sig-section">
                    <p class="sig-notice">Have the lead sign below to confirm consent.</p>
                    <SignaturePad bind:this={sigPad} on:submit={handleSignatureSubmit} on:clear={handleSignatureClear} />
                    {#if signatureData}
                      <div class="sig-confirmed">Signature captured</div>
                    {/if}
                  </div>
                {/if}
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                class="btn btn-primary big-btn submit-btn"
                disabled={submitting || !selectedVertical || !selectedCountry}
              >
                {#if submitting}
                  Submitting...
                {:else if !online}
                  Save Offline
                {:else}
                  Submit Lead
                {/if}
              </button>
            </form>
          </div>
        {/if}
      </div>
    {/if}

    <!-- STATS TAB -->
    {#if activeTab === 'stats'}
      <div class="tab-content">
        <h2 class="section-title">Your Stats</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{getTodayLeads()}</div>
            <div class="stat-label">Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{getWeekLeads()}</div>
            <div class="stat-label">This Week</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{stats ? stats.this_month : 0}</div>
            <div class="stat-label">This Month</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{stats ? stats.total_leads : 0}</div>
            <div class="stat-label">All Time</div>
          </div>
        </div>

        {#if stats && stats.commission_rate}
          <div class="commission-card card">
            <div class="commission-label">Commission Rate</div>
            <div class="commission-value">{stats.commission_rate}%</div>
          </div>
        {/if}

        {#if stats && stats.by_vertical && stats.by_vertical.length > 0}
          <div class="breakdown-section">
            <h3>By Vertical</h3>
            {#each stats.by_vertical as bv}
              <div class="breakdown-row">
                <span>{bv.name}</span>
                <span class="breakdown-count">{bv.count}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- HISTORY TAB -->
    {#if activeTab === 'history'}
      <div class="tab-content">
        <h2 class="section-title">Recent Submissions</h2>
        {#if activityLog.length === 0}
          <div class="empty-state">
            <p>No leads submitted yet.</p>
          </div>
        {:else}
          <div class="history-list">
            {#each activityLog as entry}
              <div class="history-card">
                <div class="history-top">
                  <span class="badge badge-navy">{entry.vertical_name}</span>
                  <span class="history-flag">{entry.flag_emoji} {entry.country_name}</span>
                </div>
                <div class="history-bottom">
                  <span class="badge" class:badge-green={entry.status === 'verified'} class:badge-orange={entry.status === 'new'}>
                    {entry.status}
                  </span>
                  <span class="history-date">{new Date(entry.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .portal {
    max-width: 600px;
    margin: 0 auto;
    padding: 0;
    min-height: calc(100vh - 60px);
    background: var(--bg);
  }
  .loading-screen {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; color: var(--text-muted); gap: 1rem;
  }
  .spinner {
    width: 40px; height: 40px; border: 3px solid var(--border);
    border-top-color: var(--green); border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .no-agent {
    text-align: center; padding: 3rem 1.5rem;
  }
  .no-agent h2 { margin-bottom: 0.5rem; }
  .no-agent p { color: var(--text-muted); margin-bottom: 1.5rem; }

  /* Status bar */
  .status-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.6rem 1rem; background: white;
    border-bottom: 1px solid var(--border); font-size: 0.82rem;
  }
  .status-left { display: flex; align-items: center; gap: 0.5rem; }
  .status-dot {
    width: 8px; height: 8px; border-radius: 50%;
  }
  .dot-green { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .dot-red { background: var(--red); }
  .queue-badge {
    background: rgba(245,158,11,0.12); color: var(--orange);
    padding: 0.15rem 0.5rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600;
  }
  .agent-id { font-family: monospace; color: var(--text-muted); font-weight: 600; }

  /* Tabs */
  .tabs {
    display: flex; background: white; border-bottom: 1px solid var(--border);
    position: sticky; top: 50px; z-index: 50;
  }
  .tab {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
    padding: 0.75rem 0; font-size: 0.72rem; font-weight: 600;
    color: var(--text-dim); background: none; border: none; cursor: pointer;
    border-bottom: 2px solid transparent; transition: all 0.2s; font-family: inherit;
  }
  .tab.active { color: var(--green); border-bottom-color: var(--green); }
  .tab:hover { color: var(--navy); }

  .tab-content { padding: 1rem; }
  .section-title { font-size: 1.15rem; margin-bottom: 1rem; }

  /* Form */
  .form-section { padding-bottom: 2rem; }
  .field-group { margin-bottom: 1rem; }
  .field-label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.35rem; }

  .big-input, .big-select {
    width: 100%; padding: 0.85rem 1rem; font-size: 1rem;
    border: 1px solid var(--border); border-radius: 10px;
    background: white; font-family: inherit; color: var(--text);
    -webkit-appearance: none; appearance: none;
  }
  .big-input:focus, .big-select:focus {
    outline: none; border-color: var(--navy);
    box-shadow: 0 0 0 3px rgba(31,56,100,0.08);
  }
  .big-select-wrap { position: relative; }
  .big-select-wrap::after {
    content: ''; position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent;
    border-top: 6px solid var(--text-dim); pointer-events: none;
  }

  .gps-row { display: flex; align-items: center; gap: 0.5rem; }
  .gps-status {
    font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;
  }
  .gps-ok { color: var(--green); }
  .gps-fail { color: var(--orange); }
  .btn-small {
    padding: 0.35rem 0.75rem; font-size: 0.78rem; border-radius: 6px;
    background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border);
    cursor: pointer; font-family: inherit;
  }

  /* Consent */
  .consent-tabs { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  .consent-tab {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
    padding: 0.85rem; border-radius: 10px; background: var(--bg-surface); color: var(--text-muted);
    font-weight: 600; font-size: 0.85rem; border: 2px solid transparent;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .consent-tab.active { background: white; border-color: var(--navy); color: var(--navy); }

  .verbal-check {
    display: flex; gap: 0.65rem; align-items: flex-start;
    padding: 0.85rem; background: var(--bg-surface); border-radius: 10px;
    font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; cursor: pointer;
  }
  .verbal-check input[type="checkbox"] {
    width: 20px; height: 20px; flex-shrink: 0; margin-top: 0.1rem; accent-color: var(--green);
  }

  .sig-section { margin-top: 0.5rem; }
  .sig-notice { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.5rem; }
  .sig-confirmed {
    text-align: center; padding: 0.5rem; font-size: 0.82rem; color: var(--green); font-weight: 600;
  }

  /* Big submit button */
  .big-btn {
    width: 100%; justify-content: center; padding: 1rem; font-size: 1.05rem;
    border-radius: 12px; min-height: 56px;
  }
  .submit-btn { margin-top: 1rem; }

  /* Success screen */
  .success-screen {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 50vh; text-align: center; padding: 2rem;
  }
  .success-icon { margin-bottom: 1rem; }
  .success-screen h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  .success-screen p { color: var(--text-muted); margin-bottom: 1.5rem; }

  .alert-error {
    padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.88rem; margin-bottom: 1rem;
    background: rgba(239,68,68,0.08); border: 1px solid var(--red); color: var(--red);
  }

  /* Stats */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
  .stat-card {
    background: white; border: 1px solid var(--border); border-radius: 12px;
    padding: 1.25rem; text-align: center;
  }
  .stat-number {
    font-size: 2rem; font-weight: 700; font-family: var(--font-heading); color: var(--navy);
  }
  .stat-label {
    font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;
    letter-spacing: 0.05em; margin-top: 0.25rem;
  }
  .commission-card { text-align: center; margin-bottom: 1.5rem; }
  .commission-label { font-size: 0.82rem; color: var(--text-muted); }
  .commission-value { font-size: 2rem; font-weight: 700; color: var(--green); font-family: var(--font-heading); }

  .breakdown-section { background: white; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .breakdown-section h3 { font-size: 0.9rem; padding: 0.85rem 1rem; border-bottom: 1px solid var(--border); margin: 0; }
  .breakdown-row {
    display: flex; justify-content: space-between; padding: 0.75rem 1rem;
    font-size: 0.88rem; border-bottom: 1px solid var(--border-subtle);
  }
  .breakdown-row:last-child { border-bottom: none; }
  .breakdown-count { font-weight: 700; color: var(--navy); }

  /* History */
  .history-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .history-card {
    background: white; border: 1px solid var(--border); border-radius: 10px;
    padding: 0.85rem 1rem;
  }
  .history-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
  .history-flag { font-size: 0.82rem; color: var(--text-muted); }
  .history-bottom { display: flex; justify-content: space-between; align-items: center; }
  .history-date { font-size: 0.78rem; color: var(--text-dim); }
  .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }

  @media (max-width: 600px) {
    .portal { max-width: 100%; }
  }
</style>
