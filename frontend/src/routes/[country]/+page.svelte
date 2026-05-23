<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let country = null;
  let loading = true;
  let error = '';

  $: countryCode = $page.params.country?.toUpperCase();

  onMount(async () => {
    try {
      const res = await fetch('/api/v1/countries');
      const data = await res.json();
      if (data.success) {
        country = data.data.countries.find(c => c.code === countryCode);
        if (!country) error = 'Country not found';
      }
    } catch (err) {
      error = 'Failed to load country data';
    }
    loading = false;
  });
</script>

<svelte:head>
  {#if country}
    <title>{country.flag_emoji} {country.name} | Leadova</title>
    <meta name="description" content="Lead generation verticals available in {country.name}. Browse active and upcoming verticals." />
  {:else}
    <title>Country | Leadova</title>
  {/if}
</svelte:head>

{#if loading}
  <div class="container page"><div class="loading">Loading...</div></div>
{:else if error || !country}
  <div class="container page">
    <div class="error-card card">
      <h2>Country not found</h2>
      <p>The country code "{countryCode}" was not recognized.</p>
      <a href="/verticals" class="btn btn-primary" style="margin-top:1rem">Browse Verticals</a>
    </div>
  </div>
{:else}
  <section class="hero-sm">
    <div class="container">
      <h1>{country.flag_emoji} {country.name}</h1>
      <p>Lead generation verticals available in {country.name}. Privacy jurisdiction: {country.privacy_jurisdiction}.</p>
    </div>
  </section>

  <div class="container page">
    {#if country.verticals && country.verticals.length > 0}
      <div class="verticals-grid">
        {#each country.verticals as v}
          <a href="/{countryCode.toLowerCase()}/{v.slug}" class="vertical-card card">
            <div class="vertical-header">
              <h3>{v.name}</h3>
              <span class="badge" class:badge-green={v.status === 'active'} class:badge-orange={v.status === 'coming_soon'}>
                {v.status === 'active' ? 'Active' : 'Coming Soon'}
              </span>
            </div>
            {#if v.price}
              <div class="vertical-price">
                {v.currency_code} {Number(v.price).toLocaleString()}/mo
              </div>
            {/if}
            <div class="vertical-cta-label">
              {v.status === 'active' ? 'Submit a lead or subscribe' : 'Join the waitlist'}
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div class="empty card">
        <h3>No verticals available yet</h3>
        <p>We are working on expanding to {country.name}. Check back soon or join our waitlist.</p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .hero-sm { background: var(--navy); color: white; padding: 3rem 0; text-align: center; }
  .hero-sm h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
  .hero-sm p { color: rgba(255,255,255,0.7); }
  .page { padding: 3rem 0; }
  .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
  .error-card { text-align: center; padding: 3rem; max-width: 500px; margin: 0 auto; }
  .error-card h2 { margin-bottom: 0.5rem; }
  .error-card p { color: var(--text-muted); }
  .verticals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
  .vertical-card { display: flex; flex-direction: column; gap: 0.75rem; text-decoration: none; color: var(--text); transition: transform 0.15s, box-shadow 0.15s; }
  .vertical-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(31,56,100,0.08); color: var(--text); }
  .vertical-header { display: flex; justify-content: space-between; align-items: center; }
  .vertical-header h3 { font-size: 1.15rem; }
  .vertical-price { font-family: var(--font-heading); font-size: 1.15rem; font-weight: 600; color: var(--navy); }
  .vertical-cta-label { font-size: 0.85rem; color: var(--green); font-weight: 500; }
  .empty { text-align: center; padding: 3rem; }
  .empty h3 { margin-bottom: 0.5rem; }
  .empty p { color: var(--text-muted); }
</style>
