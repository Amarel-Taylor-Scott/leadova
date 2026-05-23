<script>
  const benefits = [
    { title: 'OFW Services Leads', desc: 'Connect with overseas Filipino workers seeking remittance, insurance, loans, and financial services across 6+ countries.' },
    { title: 'Local Jobs Leads', desc: 'Access job seekers actively looking for employment. Filter by job type, industry, and experience level.' },
    { title: 'Roofing Leads', desc: 'Homeowners requesting repair, replacement, and inspection quotes. Pre-qualified by service type and property.' },
    { title: 'Real Estate Leads', desc: 'Buyers, sellers, renters, and investors with verified intent. Filter by property type and budget.' },
    { title: 'Insurance Leads', desc: 'Individuals actively shopping for life, health, auto, and property insurance coverage.' },
    { title: 'Solar Energy Leads', desc: 'Homeowners interested in solar installation. Pre-qualified by property ownership and energy usage.' },
  ];
</script>

<svelte:head>
  <title>For Businesses | Leadova</title>
  <meta name="description" content="Subscribe to receive qualified, consent-based leads across verticals and countries. Built for agencies, brokers, and service providers." />
</svelte:head>

<section class="hero-sm">
  <div class="container">
    <h1>For Businesses and Agencies</h1>
    <p>Subscribe to verticals and countries. Receive real-time, consent-based leads delivered to your dashboard.</p>
  </div>
</section>

<div class="container page">
  <section class="how-it-works">
    <h2>How It Works</h2>
    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <h3>Choose Your Verticals</h3>
        <p>Select the industries and countries where you want to receive leads. Subscribe per vertical per country.</p>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <h3>Receive Qualified Leads</h3>
        <p>Leads flow into your dashboard in real time. Every lead has verified consent and compliance documentation.</p>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <h3>Contact and Convert</h3>
        <p>Use built-in filters to find the right leads. Track your status, add notes, and export to your CRM.</p>
      </div>
    </div>
  </section>

  <section class="benefits">
    <h2>Leads Across Every Vertical</h2>
    <div class="benefits-grid">
      {#each benefits as b}
        <div class="benefit-card card">
          <h3>{b.title}</h3>
          <p>{b.desc}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="comparison">
    <h2>Why Choose Leadova</h2>
    <div class="comparison-table card">
      <div class="comp-row header">
        <span>Feature</span>
        <span>Leadova</span>
        <span>Traditional Lead Gen</span>
      </div>
      <div class="comp-row">
        <span>Consent tracking</span>
        <span class="check">Full audit trail</span>
        <span class="no">Often missing</span>
      </div>
      <div class="comp-row">
        <span>Multi-country</span>
        <span class="check">10+ countries</span>
        <span class="no">Usually single market</span>
      </div>
      <div class="comp-row">
        <span>Vertical selection</span>
        <span class="check">Subscribe per vertical</span>
        <span class="no">Generic leads</span>
      </div>
      <div class="comp-row">
        <span>Privacy compliance</span>
        <span class="check">RA 10173, TCPA, GDPR</span>
        <span class="no">Varies</span>
      </div>
      <div class="comp-row">
        <span>Pricing</span>
        <span class="check">Transparent per-vertical</span>
        <span class="no">Hidden costs</span>
      </div>
    </div>
  </section>

  <section class="cta-box">
    <h2>Start receiving qualified leads today</h2>
    <p>Choose your verticals and countries. Cancel anytime.</p>
    <div class="cta-btns">
      <a href="/pricing" class="btn btn-primary btn-large">View Pricing</a>
      <a href="/signup" class="btn btn-secondary btn-large">Create Account</a>
    </div>
  </section>
</div>

<style>
  .hero-sm { background: var(--navy); color: white; padding: 3rem 0; text-align: center; }
  .hero-sm h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
  .hero-sm p { color: rgba(255,255,255,0.7); }
  .page { padding: 3rem 0; }

  .how-it-works { margin-bottom: 4rem; }
  .how-it-works h2, .benefits h2, .comparison h2 { font-size: 1.75rem; text-align: center; margin-bottom: 2rem; }
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; text-align: center; }
  .step-num { width: 48px; height: 48px; border-radius: 50%; background: var(--green-glow); color: var(--green); font-family: var(--font-heading); font-weight: 700; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; border: 2px solid var(--green); }
  .step h3 { font-size: 1rem; margin-bottom: 0.5rem; }
  .step p { font-size: 0.88rem; color: var(--text-muted); }

  .benefits { margin-bottom: 4rem; }
  .benefits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
  .benefit-card h3 { font-size: 1.05rem; margin-bottom: 0.5rem; }
  .benefit-card p { color: var(--text-muted); font-size: 0.9rem; }

  .comparison { margin-bottom: 4rem; }
  .comparison-table { overflow: hidden; padding: 0; }
  .comp-row { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr; padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
  .comp-row.header { background: var(--bg-surface); font-weight: 600; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; }
  .comp-row:last-child { border-bottom: none; }
  .check { color: var(--green); font-weight: 600; }
  .no { color: var(--text-dim); }

  .cta-box { text-align: center; background: var(--bg-surface); border-radius: var(--radius); padding: 3rem 2rem; }
  .cta-box h2 { font-size: 1.75rem; margin-bottom: 0.5rem; }
  .cta-box p { color: var(--text-muted); margin-bottom: 1.5rem; }
  .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

  @media (max-width: 768px) {
    .steps { grid-template-columns: 1fr; }
    .comp-row { grid-template-columns: 1fr; gap: 0.25rem; }
  }
</style>
