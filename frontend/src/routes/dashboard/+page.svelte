<script>
  import { onMount } from 'svelte';

  let user = null;
  let subscriber = null;
  let subscriptions = [];
  let leads = [];
  let totalLeads = 0;
  let loading = true;
  let selectedVertical = '';
  let selectedCountry = '';
  let searchQuery = '';
  let pageNum = 1;

  // Reveal state
  let revealedLeads = {};
  let revealingId = null;

  // Upgrade modal
  let showUpgradeModal = false;
  let upgradePricing = null;

  // Contact modal
  let showContactModal = false;
  let contactLeadId = null;
  let contactSubject = '';
  let contactMessage = '';
  let contactSending = false;
  let contactSent = false;

  const headers = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  onMount(async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    try {
      const [userRes, subsRes] = await Promise.all([
        fetch('/api/v1/auth/me', { headers: headers() }),
        fetch('/api/v1/subscriptions', { headers: headers() }),
      ]);

      const userData = await userRes.json();
      const subsData = await subsRes.json();

      if (userData.success) {
        user = userData.data.user;
        subscriber = userData.data.subscriber;
      }
      if (subsData.success) subscriptions = subsData.data.subscriptions || [];

      await loadLeads();
    } catch (err) {
      console.error('Dashboard load failed', err);
    }
    loading = false;
  });

  async function loadLeads() {
    const params = new URLSearchParams({ page: String(pageNum), limit: '50' });
    if (selectedVertical) params.set('vertical_id', selectedVertical);
    if (selectedCountry) params.set('country_id', selectedCountry);
    if (searchQuery) params.set('q', searchQuery);

    try {
      const res = await fetch(`/api/v1/leads?${params}`, { headers: headers() });
      const data = await res.json();
      if (data.success) {
        leads = data.data.leads || [];
        totalLeads = data.data.total || 0;
      }
    } catch (err) {
      console.error('Failed to load leads', err);
    }
  }

  async function updateLeadStatus(leadId, status) {
    try {
      await fetch(`/api/v1/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ status }),
      });
      await loadLeads();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  function getFieldValue(lead, fieldName) {
    const fields = typeof lead.custom_fields === 'string' ? JSON.parse(lead.custom_fields) : lead.custom_fields;
    return fields?.[fieldName] || '';
  }

  function blurValue(val) {
    if (!val) return '---';
    if (val.includes('@')) {
      const parts = val.split('@');
      return parts[0].slice(0, 2) + '****@' + parts[1];
    }
    if (val.length > 4) {
      return val.slice(0, 3) + '****' + val.slice(-2);
    }
    return '****';
  }

  async function revealContact(leadId) {
    if (revealedLeads[leadId]) return;
    revealingId = leadId;

    try {
      const res = await fetch(`/api/v1/leads/${leadId}/reveal`, {
        method: 'POST',
        headers: headers(),
      });
      const data = await res.json();

      if (data.success) {
        revealedLeads[leadId] = data.data;
        revealedLeads = revealedLeads;
      } else if (res.status === 402) {
        upgradePricing = data.error?.pricing || null;
        showUpgradeModal = true;
      } else {
        alert(data.error?.message || 'Failed to reveal contact');
      }
    } catch (err) {
      console.error('Reveal error', err);
    }
    revealingId = null;
  }

  function openContactModal(leadId) {
    contactLeadId = leadId;
    contactSubject = '';
    contactMessage = '';
    contactSent = false;
    showContactModal = true;
  }

  async function sendContact() {
    if (!contactSubject.trim() || !contactMessage.trim()) return;
    contactSending = true;

    try {
      const res = await fetch(`/api/v1/leads/${contactLeadId}/contact`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ subject: contactSubject, message: contactMessage }),
      });
      const data = await res.json();
      if (data.success) {
        contactSent = true;
      } else if (res.status === 402) {
        showContactModal = false;
        upgradePricing = data.error?.pricing || null;
        showUpgradeModal = true;
      } else {
        alert(data.error?.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Contact error', err);
    }
    contactSending = false;
  }

  function exportLeads() {
    const token = localStorage.getItem('token');
    window.open(`/api/v1/leads/export?token=${token}`, '_blank');
  }

  function getStatusColor(status) {
    if (status === 'new') return 'badge-orange';
    if (status === 'verified' || status === 'converted') return 'badge-green';
    if (status === 'rejected') return 'badge-red';
    return 'badge-navy';
  }
</script>

<svelte:head><title>Dashboard | Leadova</title></svelte:head>

<div class="dashboard container">
  {#if loading}
    <div class="loading">Loading dashboard...</div>
  {:else if user}
    <header class="dash-header">
      <div>
        <h1>Welcome, {user.name || user.email.split('@')[0]}</h1>
        <p class="dash-sub">{subscriber ? `${subscriber.tier} tier` : 'No active subscriptions'}</p>
      </div>
      <div class="header-actions">
        <a href="/dashboard/import" class="btn btn-secondary">Import CSV</a>
        <button class="btn btn-secondary" on:click={exportLeads}>Export CSV</button>
      </div>
    </header>

    <!-- Subscriptions overview -->
    {#if subscriptions.length > 0}
      <div class="subs-grid">
        {#each subscriptions as sub}
          <div class="sub-card card" class:active={sub.status === 'active'} class:cancelled={sub.status === 'cancelled'}>
            <div class="sub-header">
              <span class="sub-flag">{sub.flag_emoji}</span>
              <div>
                <h3>{sub.vertical_name}</h3>
                <p class="sub-country">{sub.country_name}</p>
              </div>
              <span class="badge" class:badge-green={sub.status === 'active'} class:badge-red={sub.status === 'cancelled'}>
                {sub.status}
              </span>
            </div>
            <div class="sub-price">{sub.currency} {Number(sub.price_locked).toLocaleString()}/mo</div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty card">
        <h3>No subscriptions yet</h3>
        <p>Subscribe to verticals to start receiving leads.</p>
        <a href="/verticals" class="btn btn-primary" style="margin-top:1rem">Browse Verticals</a>
      </div>
    {/if}

    <!-- Filters -->
    <div class="filters">
      <select bind:value={selectedVertical} on:change={() => { pageNum = 1; loadLeads(); }}>
        <option value="">All verticals</option>
        {#each subscriptions.filter(s => s.status === 'active') as sub}
          <option value={sub.vertical_id}>{sub.vertical_name} ({sub.country_name})</option>
        {/each}
      </select>
      <input type="text" bind:value={searchQuery} placeholder="Search leads..." on:keydown={(e) => e.key === 'Enter' && loadLeads()} />
      <button class="btn btn-secondary" on:click={loadLeads}>Search</button>
    </div>

    <!-- Lead cards -->
    <div class="leads-section">
      <div class="section-header">
        <h2>Leads ({totalLeads})</h2>
      </div>

      {#if leads.length === 0}
        <div class="empty card">
          <h3>No leads found</h3>
          <p>Leads will appear here as people submit forms in your subscribed verticals.</p>
        </div>
      {:else}
        <div class="lead-cards">
          {#each leads as lead}
            {@const revealed = revealedLeads[lead.id]}
            <div class="lead-card card">
              <div class="lead-top">
                <div class="lead-info">
                  <h3 class="lead-name">{getFieldValue(lead, 'full_name') || 'Unknown'}</h3>
                  <div class="lead-badges">
                    <span class="badge badge-navy">{lead.vertical_name}</span>
                    <span class="lead-location">{lead.flag_emoji} {lead.country_name}</span>
                    <span class="badge {getStatusColor(lead.status)}">{lead.status}</span>
                  </div>
                </div>
                <div class="lead-date">{new Date(lead.created_at).toLocaleDateString()}</div>
              </div>

              <!-- Contact info with blur/reveal -->
              <div class="lead-contact-section">
                <div class="contact-row">
                  <span class="contact-label">Email</span>
                  {#if revealed}
                    <span class="contact-value revealed">{revealed.email || 'N/A'}</span>
                  {:else}
                    <span class="contact-value blurred">{blurValue(getFieldValue(lead, 'email'))}</span>
                  {/if}
                </div>
                <div class="contact-row">
                  <span class="contact-label">Phone</span>
                  {#if revealed}
                    <span class="contact-value revealed">{revealed.phone || 'N/A'}</span>
                  {:else}
                    <span class="contact-value blurred">{blurValue(getFieldValue(lead, 'phone'))}</span>
                  {/if}
                </div>
              </div>

              <!-- Actions -->
              <div class="lead-actions">
                {#if !revealed}
                  <button
                    class="btn btn-primary btn-sm"
                    on:click={() => revealContact(lead.id)}
                    disabled={revealingId === lead.id}
                  >
                    {revealingId === lead.id ? 'Revealing...' : 'Reveal Contact'}
                  </button>
                {:else}
                  <button class="btn btn-navy btn-sm" on:click={() => openContactModal(lead.id)}>
                    Contact via Leadova
                  </button>
                {/if}

                <select class="status-select" value={lead.subscriber_status?.status || 'new'} on:change={(e) => updateLeadStatus(lead.id, e.target.value)}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          {/each}
        </div>

        <div class="pagination">
          <button class="btn btn-ghost" disabled={pageNum <= 1} on:click={() => { pageNum--; loadLeads(); }}>Previous</button>
          <span class="page-info">Page {pageNum}</span>
          <button class="btn btn-ghost" disabled={leads.length < 50} on:click={() => { pageNum++; loadLeads(); }}>Next</button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Upgrade Modal -->
{#if showUpgradeModal}
  <div class="modal-overlay" on:click={() => showUpgradeModal = false}>
    <div class="modal card" on:click|stopPropagation>
      <h2>Subscription Required</h2>
      <p class="modal-desc">You need an active subscription to access contact information for this vertical and country.</p>

      {#if upgradePricing}
        <div class="pricing-box">
          <div class="pricing-vertical">{upgradePricing.vertical_name}</div>
          <div class="pricing-country">{upgradePricing.country_name}</div>
          <div class="pricing-amount">
            {upgradePricing.currency_code} {Number(upgradePricing.price).toLocaleString()}<span class="pricing-period">/month</span>
          </div>
        </div>
        <a href="/pricing" class="btn btn-primary full-width">View Pricing Plans</a>
      {:else}
        <a href="/verticals" class="btn btn-primary full-width">Browse Verticals</a>
      {/if}

      <button class="btn btn-ghost full-width" on:click={() => showUpgradeModal = false} style="margin-top:0.5rem">
        Maybe Later
      </button>
    </div>
  </div>
{/if}

<!-- Contact Modal -->
{#if showContactModal}
  <div class="modal-overlay" on:click={() => showContactModal = false}>
    <div class="modal card" on:click|stopPropagation>
      {#if contactSent}
        <div class="contact-success">
          <h2>Message Sent</h2>
          <p>Your message has been queued for delivery through the Leadova platform.</p>
          <button class="btn btn-primary" on:click={() => showContactModal = false}>Close</button>
        </div>
      {:else}
        <h2>Contact via Leadova</h2>
        <p class="modal-desc">Send a message through the platform. Your direct email will be shared as the reply-to address.</p>

        <form on:submit|preventDefault={sendContact}>
          <label>
            Subject
            <input type="text" bind:value={contactSubject} placeholder="Re: Your inquiry" required />
          </label>
          <label>
            Message
            <textarea bind:value={contactMessage} rows="5" placeholder="Hi, I received your inquiry and would like to help..." required></textarea>
          </label>
          <button type="submit" class="btn btn-primary full-width" disabled={contactSending}>
            {contactSending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        <button class="btn btn-ghost full-width" on:click={() => showContactModal = false} style="margin-top:0.5rem">Cancel</button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .dashboard { padding: 2rem 0; }
  .loading { text-align: center; padding: 4rem; color: var(--text-muted); }
  .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .dash-header h1 { font-size: 1.75rem; }
  .dash-sub { color: var(--text-muted); text-transform: capitalize; }
  .header-actions { display: flex; gap: 0.5rem; }

  .subs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .sub-card { padding: 1rem 1.25rem; }
  .sub-card.cancelled { opacity: 0.5; }
  .sub-header { display: flex; align-items: center; gap: 0.75rem; }
  .sub-flag { font-size: 1.5rem; }
  .sub-header h3 { font-size: 1rem; margin-bottom: 0; }
  .sub-country { font-size: 0.8rem; color: var(--text-muted); }
  .sub-header .badge { margin-left: auto; }
  .sub-price { font-family: var(--font-heading); font-size: 0.95rem; font-weight: 600; color: var(--navy); margin-top: 0.5rem; }

  .filters { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .filters select { max-width: 300px; }
  .filters input { max-width: 250px; }

  .section-header { margin-bottom: 1rem; }
  .section-header h2 { font-size: 1.15rem; }
  .empty { text-align: center; padding: 3rem; }
  .empty h3 { margin-bottom: 0.5rem; }
  .empty p { color: var(--text-muted); }

  /* Lead cards */
  .lead-cards { display: flex; flex-direction: column; gap: 0.75rem; }
  .lead-card { padding: 1.25rem; }
  .lead-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
  .lead-name { font-size: 1.05rem; margin-bottom: 0.3rem; }
  .lead-badges { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }
  .lead-location { font-size: 0.82rem; color: var(--text-muted); }
  .lead-date { font-size: 0.8rem; color: var(--text-dim); white-space: nowrap; }

  .lead-contact-section {
    background: var(--bg-surface); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.75rem;
  }
  .contact-row { display: flex; justify-content: space-between; align-items: center; padding: 0.25rem 0; }
  .contact-label { font-size: 0.78rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
  .contact-value { font-size: 0.9rem; }
  .contact-value.blurred {
    filter: blur(4px);
    user-select: none;
    color: var(--text-muted);
  }
  .contact-value.revealed {
    color: var(--navy);
    font-weight: 600;
  }

  .lead-actions { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  .btn-sm { padding: 0.45rem 1rem; font-size: 0.82rem; }
  .status-select { padding: 0.35rem 0.5rem; font-size: 0.8rem; width: auto; margin-left: auto; }

  .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
  .page-info { font-size: 0.9rem; color: var(--text-muted); }

  /* Modals */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;
    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .modal {
    max-width: 440px; width: 100%; animation: modalIn 0.2s ease-out;
  }
  @keyframes modalIn { from { transform: translateY(20px); opacity: 0; } }
  .modal h2 { font-size: 1.25rem; margin-bottom: 0.25rem; }
  .modal-desc { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem; }
  .modal form { display: flex; flex-direction: column; gap: 0.9rem; }
  .modal label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.88rem; color: var(--text-muted); font-weight: 500; }
  .full-width { width: 100%; justify-content: center; }

  .pricing-box {
    background: var(--bg-surface); border-radius: 10px; padding: 1.25rem; text-align: center;
    margin-bottom: 1.25rem;
  }
  .pricing-vertical { font-weight: 700; font-size: 1.05rem; color: var(--navy); }
  .pricing-country { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; }
  .pricing-amount { font-size: 1.75rem; font-weight: 700; font-family: var(--font-heading); color: var(--green); }
  .pricing-period { font-size: 0.85rem; font-weight: 400; color: var(--text-muted); }

  .contact-success { text-align: center; }
  .contact-success h2 { color: var(--green); margin-bottom: 0.5rem; }
  .contact-success p { color: var(--text-muted); margin-bottom: 1rem; }

  @media (max-width: 768px) {
    .dash-header { flex-direction: column; }
    .header-actions { width: 100%; }
    .header-actions .btn { flex: 1; justify-content: center; }
    .lead-top { flex-direction: column; gap: 0.5rem; }
    .lead-actions { flex-direction: column; }
    .lead-actions .btn { width: 100%; justify-content: center; }
    .status-select { margin-left: 0; width: 100%; }
  }
</style>
