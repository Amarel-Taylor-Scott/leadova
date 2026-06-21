<script>
  let currency = 'PHP';

  const tiers = {
    PHP: [
      { name: 'Starter', price: '2,500', period: '/mo', features: ['Up to 3 verticals', 'Basic lead filters', 'Email support', 'CSV export', 'Consent audit trail'], cta: 'Get Starter', featured: false },
      { name: 'Growth', price: '4,500', period: '/mo', features: ['Unlimited verticals', 'Advanced filters', 'Priority support', 'API access', 'Lead scoring', 'Multi-country access', 'Real-time notifications'], cta: 'Get Growth', featured: true },
      { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Growth', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'Volume discounts', 'White-label options', 'Bulk import/export'], cta: 'Contact Sales', featured: false },
    ],
    USD: [
      { name: 'Starter', price: '49', period: '/mo', features: ['Up to 3 verticals', 'Basic lead filters', 'Email support', 'CSV export', 'Consent audit trail'], cta: 'Get Starter', featured: false },
      { name: 'Growth', price: '99', period: '/mo', features: ['Unlimited verticals', 'Advanced filters', 'Priority support', 'API access', 'Lead scoring', 'Multi-country access', 'Real-time notifications'], cta: 'Get Growth', featured: true },
      { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Growth', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'Volume discounts', 'White-label options', 'Bulk import/export'], cta: 'Contact Sales', featured: false },
    ],
  };

  $: currentTiers = tiers[currency] || tiers.PHP;
  $: symbol = currency === 'PHP' ? '\u20b1' : '$';
</script>

<svelte:head>
  <title>Pricing | Leadova</title>
  <meta name="description" content="Leadova pricing: Starter from P2,500/mo or $49/mo. Growth from P4,500/mo or $99/mo. Multi-vertical discount available." />
</svelte:head>

<section class="hero-sm">
  <div class="container">
    <h1>Simple, Per-Vertical Pricing</h1>
    <p>Subscribe to the verticals and countries you need. Multi-vertical discounts available.</p>
  </div>
</section>

<div class="container page">
  <div class="currency-toggle">
    <button class:active={currency === 'PHP'} on:click={() => currency = 'PHP'}>PHP (Philippines)</button>
    <button class:active={currency === 'USD'} on:click={() => currency = 'USD'}>USD</button>
  </div>

  <div class="tier-grid">
    {#each currentTiers as tier}
      <div class="tier-card card" class:featured={tier.featured}>
        {#if tier.featured}
          <div class="popular-badge">Most Popular</div>
        {/if}
        <h2>{tier.name}</h2>
        <div class="price">
          {#if tier.price === 'Custom'}
            Custom
          {:else}
            {symbol}{tier.price}<span>{tier.period}</span>
          {/if}
        </div>
        <ul>
          {#each tier.features as f}
            <li>{f}</li>
          {/each}
        </ul>
        {#if tier.price === 'Custom'}
          <a href="mailto:hello@leadova.com" class="btn btn-secondary full-width">{tier.cta}</a>
        {:else}
          <a href="/signup" class="btn full-width" class:btn-primary={tier.featured} class:btn-secondary={!tier.featured}>{tier.cta}</a>
        {/if}
      </div>
    {/each}
  </div>

  <div class="discount-callout card">
    <h3>Multi-Vertical Discount</h3>
    <p>Subscribe to 3 or more verticals and receive 15% off your total monthly cost. Enterprise plans include volume pricing for high-lead-count verticals.</p>
  </div>

  <div class="faq-section">
    <h2>Frequently Asked Questions</h2>
    <details>
      <summary>What is included in each subscription?</summary>
      <p>Each subscription gives you access to all leads in one vertical in one country. Leads include full consent documentation, custom form fields, and status tracking.</p>
    </details>
    <details>
      <summary>Can I subscribe to multiple verticals?</summary>
      <p>Yes. Each vertical+country combination is a separate subscription. Subscribe to as many as you need, and get multi-vertical discounts at 3 or more.</p>
    </details>
    <details>
      <summary>How does consent work?</summary>
      <p>Every lead gives explicit consent before submission. We record the consent method (web form, agent verbal, agent signature), timestamp, and exact text shown. Leads can withdraw consent at any time.</p>
    </details>
    <details>
      <summary>Can I cancel anytime?</summary>
      <p>Yes. Cancel any subscription and keep access through the end of your billing period. No penalties or hidden fees.</p>
    </details>
    <details>
      <summary>Do you support my country?</summary>
      <p>We currently operate in Philippines, United States, UAE, Singapore, Australia, Canada, UK, Japan, South Korea, and Saudi Arabia. More countries coming soon.</p>
    </details>
  </div>
</div>

<style>
  .hero-sm { background: var(--navy); color: white; padding: 3rem 0; text-align: center; }
  .hero-sm h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
  .hero-sm p { color: rgba(255,255,255,0.7); }
  .page { padding: 3rem 0; }

  .currency-toggle { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2.5rem; }
  .currency-toggle button { padding: 0.6rem 1.25rem; border-radius: var(--radius-sm); background: var(--bg-surface); color: var(--text-muted); font-weight: 500; font-size: 0.9rem; border: 1px solid var(--border); transition: all 0.15s; }
  .currency-toggle button.active { background: var(--navy); color: white; border-color: var(--navy); }

  .tier-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
  .tier-card { display: flex; flex-direction: column; position: relative; text-align: left; }
  .tier-card h2 { font-size: 1.25rem; margin-bottom: 0.5rem; }
  .price { font-size: 2.5rem; font-weight: 700; font-family: var(--font-heading); color: var(--navy); margin-bottom: 1.5rem; }
  .price span { font-size: 0.9rem; font-weight: 400; color: var(--text-muted); }
  .tier-card ul { list-style: none; flex: 1; margin-bottom: 1.5rem; }
  .tier-card li { padding: 0.35rem 0; font-size: 0.88rem; color: var(--text-muted); }
  .tier-card li::before { content: '\2713  '; color: var(--green); font-weight: 700; }
  .featured { border-color: var(--green); box-shadow: 0 0 0 2px var(--green-glow); }
  .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--green); color: white; padding: 0.2rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; }
  .full-width { width: 100%; justify-content: center; }

  .discount-callout { text-align: center; padding: 2rem; margin-bottom: 3rem; background: var(--green-glow); border-color: var(--green); }
  .discount-callout h3 { color: var(--green); margin-bottom: 0.5rem; }
  .discount-callout p { color: var(--text-muted); font-size: 0.92rem; }

  .faq-section { max-width: 700px; margin: 0 auto; }
  .faq-section h2 { text-align: center; margin-bottom: 1.5rem; }
  details { border-bottom: 1px solid var(--border); padding: 1rem 0; }
  summary { cursor: pointer; font-weight: 600; color: var(--navy); list-style: none; }
  summary::-webkit-details-marker { display: none; }
  details p { margin-top: 0.75rem; color: var(--text-muted); font-size: 0.9rem; }

  @media (max-width: 768px) {
    .tier-grid { grid-template-columns: 1fr; }
  }
</style>
