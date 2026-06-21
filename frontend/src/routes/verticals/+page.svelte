<script>
  import { onMount } from 'svelte';

  let verticals = [];
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/v1/verticals');
      const data = await res.json();
      if (data.success) verticals = data.data.verticals;
    } catch (err) {
      console.error('Failed to load verticals', err);
    }
    loading = false;
  });
</script>

<svelte:head>
  <title>Verticals | Leadova</title>
  <meta name="description" content="Explore all lead generation verticals available on Leadova. OFW, local jobs, roofing, real estate, insurance, solar, education, and legal services." />
</svelte:head>

<section class="hero-sm">
  <div class="container">
    <h1>Lead Generation Verticals</h1>
    <p>Each vertical has custom lead forms, subscriber filters, and country-specific configurations.</p>
  </div>
</section>

<div class="container page">
  {#if loading}
    <div class="loading">Loading verticals...</div>
  {:else}
    <div class="verticals-grid">
      {#each verticals as v}
        <div class="vertical-card card">
          <div class="vertical-header">
            <h2>{v.name}</h2>
            <span class="badge" class:badge-green={v.status === 'active'} class:badge-orange={v.status === 'coming_soon'}>
              {v.status === 'active' ? 'Active' : 'Coming Soon'}
            </span>
          </div>
          <p class="vertical-desc">{v.description}</p>

          {#if v.countries && v.countries.length > 0}
            <div class="countries-list">
              <h4>Available in:</h4>
              <div class="country-badges">
                {#each v.countries as c}
                  <a href="/{c.code.toLowerCase()}/{v.slug}" class="country-badge" class:active={c.status === 'active'} class:coming-soon={c.status === 'coming_soon'}>
                    <span class="flag">{c.flag_emoji}</span>
                    <span>{c.name}</span>
                    {#if c.status === 'coming_soon'}
                      <span class="cs-label">Soon</span>
                    {/if}
                  </a>
                {/each}
              </div>
            </div>
          {/if}

          <div class="vertical-cta">
            {#if v.countries && v.countries.length > 0}
              {@const firstActive = v.countries.find(c => c.status === 'active')}
              {#if firstActive}
                <a href="/{firstActive.code.toLowerCase()}/{v.slug}" class="btn btn-primary">View Lead Form</a>
              {:else}
                <a href="/{v.countries[0].code.toLowerCase()}/{v.slug}" class="btn btn-secondary">Join Waitlist</a>
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .hero-sm { background: var(--navy); color: white; padding: 3rem 0; text-align: center; }
  .hero-sm h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
  .hero-sm p { color: rgba(255,255,255,0.7); }
  .page { padding: 3rem 0; }
  .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
  .verticals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.5rem; }
  .vertical-card { display: flex; flex-direction: column; gap: 1rem; }
  .vertical-header { display: flex; justify-content: space-between; align-items: center; }
  .vertical-header h2 { font-size: 1.25rem; }
  .vertical-desc { color: var(--text-muted); font-size: 0.9rem; }
  .countries-list h4 { font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
  .country-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .country-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 500; background: var(--bg-surface); color: var(--text); text-decoration: none; border: 1px solid var(--border); transition: all 0.15s; }
  .country-badge:hover { border-color: var(--navy); color: var(--navy); }
  .country-badge.coming-soon { opacity: 0.6; }
  .cs-label { font-size: 0.7rem; color: var(--orange); }
  .flag { font-size: 1rem; }
  .vertical-cta { margin-top: auto; padding-top: 0.5rem; }
</style>
