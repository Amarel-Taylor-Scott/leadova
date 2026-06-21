<script>
  import { onMount } from 'svelte';

  let analytics = null;
  let loading = true;
  let activeTab = 'analytics';

  let adminLeads = [];
  let adminSubscribers = [];
  let adminAgents = [];
  let adminVerticals = [];

  const headers = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  onMount(async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    try {
      const res = await fetch('/api/v1/admin/analytics', { headers: headers() });
      const data = await res.json();
      if (data.success) analytics = data.data.analytics;
    } catch (err) {
      console.error('Admin load failed', err);
    }
    loading = false;
  });

  async function loadTab(tab) {
    activeTab = tab;
    const h = headers();

    if (tab === 'leads' && adminLeads.length === 0) {
      const res = await fetch('/api/v1/admin/leads?limit=100', { headers: h });
      const data = await res.json();
      if (data.success) adminLeads = data.data.leads || [];
    }
    if (tab === 'subscribers' && adminSubscribers.length === 0) {
      const res = await fetch('/api/v1/admin/subscribers', { headers: h });
      const data = await res.json();
      if (data.success) adminSubscribers = data.data.subscribers || [];
    }
    if (tab === 'agents' && adminAgents.length === 0) {
      const res = await fetch('/api/v1/admin/agents', { headers: h });
      const data = await res.json();
      if (data.success) adminAgents = data.data.agents || [];
    }
    if (tab === 'verticals' && adminVerticals.length === 0) {
      const res = await fetch('/api/v1/admin/verticals', { headers: h });
      const data = await res.json();
      if (data.success) adminVerticals = data.data.verticals || [];
    }
  }

  function getField(lead, field) {
    const f = typeof lead.custom_fields === 'string' ? JSON.parse(lead.custom_fields) : lead.custom_fields;
    return f?.[field] || '';
  }
</script>

<svelte:head><title>Admin | Leadova</title></svelte:head>

<div class="admin container">
  {#if loading}
    <div class="loading">Loading admin panel...</div>
  {:else}
    <h1>Admin Panel</h1>

    <div class="tabs">
      <button class:active={activeTab === 'analytics'} on:click={() => loadTab('analytics')}>Analytics</button>
      <button class:active={activeTab === 'leads'} on:click={() => loadTab('leads')}>Leads</button>
      <button class:active={activeTab === 'subscribers'} on:click={() => loadTab('subscribers')}>Subscribers</button>
      <button class:active={activeTab === 'agents'} on:click={() => loadTab('agents')}>Agents</button>
      <button class:active={activeTab === 'verticals'} on:click={() => loadTab('verticals')}>Verticals</button>
    </div>

    {#if activeTab === 'analytics' && analytics}
      <div class="stats-grid">
        <div class="stat-card card"><div class="stat-label">Total Leads</div><div class="stat-value">{analytics.total_leads}</div></div>
        <div class="stat-card card"><div class="stat-label">Subscribers</div><div class="stat-value">{analytics.total_subscribers}</div></div>
        <div class="stat-card card"><div class="stat-label">Agents</div><div class="stat-value">{analytics.total_agents}</div></div>
        <div class="stat-card card"><div class="stat-label">Active Subscriptions</div><div class="stat-value">{analytics.active_subscriptions}</div></div>
        <div class="stat-card card"><div class="stat-label">Waitlist</div><div class="stat-value">{analytics.waitlist_count}</div></div>
      </div>

      {#if analytics.leads_by_vertical?.length > 0}
        <div class="breakdown card">
          <h3>Leads by Vertical</h3>
          {#each analytics.leads_by_vertical as item}
            <div class="breakdown-row"><span>{item.name}</span><span class="count">{item.count}</span></div>
          {/each}
        </div>
      {/if}

      {#if analytics.leads_by_country?.length > 0}
        <div class="breakdown card">
          <h3>Leads by Country</h3>
          {#each analytics.leads_by_country as item}
            <div class="breakdown-row"><span>{item.flag_emoji} {item.name}</span><span class="count">{item.count}</span></div>
          {/each}
        </div>
      {/if}
    {/if}

    {#if activeTab === 'leads'}
      <div class="data-table">
        <div class="table-header"><span>ID</span><span>Name</span><span>Vertical</span><span>Country</span><span>Status</span><span>Date</span></div>
        {#each adminLeads as lead}
          <div class="table-row">
            <span>#{lead.id}</span>
            <span>{getField(lead, 'full_name') || 'N/A'}</span>
            <span>{lead.vertical_name}</span>
            <span>{lead.flag_emoji} {lead.country_name}</span>
            <span><span class="badge badge-navy">{lead.status}</span></span>
            <span class="text-muted">{new Date(lead.created_at).toLocaleDateString()}</span>
          </div>
        {/each}
      </div>
    {/if}

    {#if activeTab === 'subscribers'}
      <div class="data-table">
        <div class="table-header"><span>ID</span><span>Name</span><span>Email</span><span>Tier</span><span>Company</span></div>
        {#each adminSubscribers as sub}
          <div class="table-row">
            <span>#{sub.id}</span>
            <span>{sub.name || 'N/A'}</span>
            <span>{sub.email}</span>
            <span><span class="badge badge-navy">{sub.tier}</span></span>
            <span>{sub.company_name || '-'}</span>
          </div>
        {/each}
      </div>
    {/if}

    {#if activeTab === 'agents'}
      <div class="data-table">
        <div class="table-header"><span>ID</span><span>Name</span><span>Email</span><span>Code</span><span>Leads</span><span>Status</span></div>
        {#each adminAgents as ag}
          <div class="table-row">
            <span>#{ag.id}</span>
            <span>{ag.name || 'N/A'}</span>
            <span>{ag.email}</span>
            <span class="mono">{ag.agent_code}</span>
            <span>{ag.leads_submitted}</span>
            <span><span class="badge" class:badge-green={ag.status === 'active'}>{ag.status}</span></span>
          </div>
        {/each}
      </div>
    {/if}

    {#if activeTab === 'verticals'}
      <div class="data-table">
        <div class="table-header"><span>Slug</span><span>Name</span><span>Status</span></div>
        {#each adminVerticals as v}
          <div class="table-row">
            <span class="mono">{v.slug}</span>
            <span>{v.name}</span>
            <span><span class="badge" class:badge-green={v.status === 'active'} class:badge-orange={v.status === 'coming_soon'}>{v.status}</span></span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .admin { padding: 2rem 0; }
  .admin h1 { font-size: 1.75rem; margin-bottom: 1.5rem; }
  .loading { text-align: center; padding: 4rem; color: var(--text-muted); }

  .tabs { display: flex; gap: 0.25rem; margin-bottom: 2rem; border-bottom: 2px solid var(--border); }
  .tabs button { padding: 0.75rem 1.25rem; background: none; color: var(--text-muted); font-weight: 500; font-size: 0.9rem; border-bottom: 2px solid transparent; margin-bottom: -2px; }
  .tabs button.active { color: var(--navy); border-bottom-color: var(--navy); }

  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { text-align: center; padding: 1.25rem; }
  .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
  .stat-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-heading); color: var(--navy); }

  .breakdown { margin-bottom: 1.5rem; }
  .breakdown h3 { font-size: 1rem; margin-bottom: 0.75rem; }
  .breakdown-row { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.9rem; }
  .count { font-weight: 600; color: var(--navy); }

  .data-table { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .table-header, .table-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); padding: 0.75rem 1rem; align-items: center; gap: 0.5rem; }
  .table-header { background: var(--bg-surface); font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
  .table-row { border-top: 1px solid var(--border-subtle); font-size: 0.88rem; }
  .mono { font-family: monospace; }
  .text-muted { color: var(--text-muted); }
</style>
