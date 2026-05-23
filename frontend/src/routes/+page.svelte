<script>
  const verticals = [
    { slug: 'ofw', name: 'OFW Services', icon: 'globe', status: 'active', desc: 'Remittance, insurance, and financial services for overseas Filipino workers.' },
    { slug: 'local-jobs', name: 'Local Jobs', icon: 'briefcase', status: 'active', desc: 'Job seekers looking for local employment across industries.' },
    { slug: 'roofing', name: 'Roofing', icon: 'home', status: 'active', desc: 'Homeowners seeking repair, replacement, and inspection services.' },
    { slug: 'real-estate', name: 'Real Estate', icon: 'building', status: 'active', desc: 'Buyers, sellers, and renters looking for property services.' },
    { slug: 'insurance', name: 'Insurance', icon: 'shield', status: 'active', desc: 'Individuals seeking life, health, auto, and property coverage.' },
    { slug: 'solar', name: 'Solar Energy', icon: 'sun', status: 'active', desc: 'Homeowners interested in solar panel installation.' },
    { slug: 'education', name: 'Education', icon: 'book', status: 'active', desc: 'Students seeking programs, certifications, and training.' },
    { slug: 'legal', name: 'Legal Services', icon: 'scale', status: 'active', desc: 'Legal representation and advisory services.' },
  ];

  const iconMap = {
    globe: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
    briefcase: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    building: 'M17 11V3H7v4H2v14h20V11h-5zM7 19H4v-2h3v2zm0-4H4v-2h3v2zm0-4H4V9h3v2zm6 8H9v-2h4v2zm0-4H9v-2h4v2zm0-4H9V9h4v2zm0-4H9V5h4v2zm6 12h-3v-2h3v2zm0-4h-3v-2h3v2z',
    shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
    sun: 'M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z',
    book: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z',
    scale: 'M12 3c-1.27 0-2.4.8-2.82 2H3v2h1.95L2 14c-.47 2 1 3 3.5 3s4.06-1 3.5-3L6.05 7h3.12c.33.85.98 1.5 1.83 1.83V20H6v2h12v-2h-5V8.82c.85-.32 1.5-.97 1.83-1.82h3.12L15 14c-.47 2 1 3 3.5 3s4.06-1 3.5-3l-2.95-7H21V5h-6.18C14.4 3.8 13.27 3 12 3z',
  };
</script>

<svelte:head>
  <title>Leadova - Leads That Come to You</title>
  <meta name="description" content="Config-driven lead generation across verticals and countries. Consent-based, compliance-first. Connecting people with the services they need." />
</svelte:head>

<section class="hero">
  <div class="container">
    <h1>Leads that come to you</h1>
    <p class="subtitle">
      Consent-based lead generation across multiple verticals and countries. We connect real people with the services they need, and deliver verified leads to your business.
    </p>
    <div class="hero-cta">
      <a href="/verticals" class="btn btn-primary btn-large">Explore Verticals</a>
      <a href="/businesses" class="btn btn-secondary btn-large">For Businesses</a>
    </div>
  </div>
</section>

<section class="verticals-section">
  <div class="container">
    <h2>8 Verticals. Multiple Countries. One Platform.</h2>
    <p class="section-sub">Each vertical is configured with its own lead forms, subscriber filters, and country-specific landing pages.</p>
    <div class="verticals-grid">
      {#each verticals as v}
        <a href="/verticals" class="vertical-card card">
          <div class="vertical-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--navy)">
              <path d={iconMap[v.icon] || iconMap.globe} />
            </svg>
          </div>
          <div class="vertical-info">
            <h3>{v.name}</h3>
            <p>{v.desc}</p>
          </div>
          <span class="badge badge-green">{v.status === 'active' ? 'Active' : 'Coming Soon'}</span>
        </a>
      {/each}
    </div>
  </div>
</section>

<section class="value-section">
  <div class="container value-grid">
    <div class="value-col">
      <h2>For People Looking for Services</h2>
      <p>Submit your information through our secure, consent-based forms. We match you with verified providers in your area. Your data is protected under local privacy laws.</p>
      <ul>
        <li>Free to submit</li>
        <li>Verified service providers</li>
        <li>Your consent is always tracked and respected</li>
        <li>Withdraw consent at any time</li>
      </ul>
    </div>
    <div class="value-col">
      <h2>For Businesses and Agencies</h2>
      <p>Subscribe to receive qualified leads in your verticals and target countries. Every lead comes with verified consent and compliance documentation.</p>
      <ul>
        <li>Choose your verticals and countries</li>
        <li>Receive real-time qualified leads</li>
        <li>Filter, search, and export</li>
        <li>Full consent audit trail</li>
      </ul>
      <a href="/businesses" class="btn btn-primary" style="margin-top:1rem">Learn More</a>
    </div>
  </div>
</section>

<section class="trust-section">
  <div class="container">
    <h2>Built on Consent and Compliance</h2>
    <div class="trust-grid">
      <div class="trust-card card">
        <h3>Consent-First</h3>
        <p>Every lead gives explicit consent. We record the method, timestamp, and exact text shown. Consent can be withdrawn at any time.</p>
      </div>
      <div class="trust-card card">
        <h3>Multi-Jurisdiction</h3>
        <p>Compliant with RA 10173 (Philippines), TCPA/CCPA (US), PDPA (Singapore), UK GDPR, and more. Each country's privacy law is respected.</p>
      </div>
      <div class="trust-card card">
        <h3>Soft Delete and Audit</h3>
        <p>Leads are never permanently lost accidentally. Full audit trail of who accessed what data and when.</p>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container">
    <h2>Ready to grow your business with qualified leads?</h2>
    <p>Start receiving verified, consent-based leads in your target verticals and countries.</p>
    <div class="cta-buttons">
      <a href="/signup" class="btn btn-primary btn-large">Get Started</a>
      <a href="/pricing" class="btn btn-secondary btn-large">View Pricing</a>
    </div>
  </div>
</section>

<style>
  .hero {
    background: var(--navy);
    color: white;
    padding: 5rem 0 4rem;
    text-align: center;
  }
  .hero h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: white;
    line-height: 1.1;
    margin-bottom: 1.25rem;
  }
  .subtitle {
    color: rgba(255,255,255,0.75);
    font-size: 1.15rem;
    max-width: 660px;
    margin: 0 auto 2rem;
  }
  .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  .hero-cta .btn-secondary { background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.3); }
  .hero-cta .btn-secondary:hover { background: rgba(255,255,255,0.2); border-color: white; }
  .btn-large { padding: 1rem 2rem; font-size: 1rem; }

  .verticals-section { padding: 4rem 0; }
  .verticals-section h2 { text-align: center; font-size: 2rem; margin-bottom: 0.5rem; }
  .section-sub { color: var(--text-muted); text-align: center; margin-bottom: 2.5rem; font-size: 1rem; }
  .verticals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
  .vertical-card { display: flex; flex-direction: column; gap: 0.75rem; text-decoration: none; color: var(--text); transition: transform 0.15s, box-shadow 0.15s; }
  .vertical-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(31,56,100,0.08); color: var(--text); }
  .vertical-icon { width: 48px; height: 48px; background: var(--bg-surface); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
  .vertical-info h3 { font-size: 1.05rem; margin-bottom: 0.25rem; }
  .vertical-info p { color: var(--text-muted); font-size: 0.85rem; }

  .value-section { padding: 4rem 0; background: var(--bg-surface); }
  .value-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
  .value-col h2 { font-size: 1.5rem; margin-bottom: 0.75rem; }
  .value-col p { color: var(--text-muted); margin-bottom: 1rem; }
  .value-col ul { list-style: none; }
  .value-col li { padding: 0.35rem 0; font-size: 0.92rem; color: var(--text-muted); }
  .value-col li::before { content: '\2713  '; color: var(--green); font-weight: 700; }

  .trust-section { padding: 4rem 0; }
  .trust-section h2 { text-align: center; font-size: 2rem; margin-bottom: 2rem; }
  .trust-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; }
  .trust-card h3 { font-size: 1.05rem; margin-bottom: 0.5rem; }
  .trust-card p { color: var(--text-muted); font-size: 0.9rem; }

  .cta-section {
    padding: 4rem 0;
    text-align: center;
    background: var(--navy);
    color: white;
  }
  .cta-section h2 { color: white; font-size: 2rem; margin-bottom: 0.75rem; }
  .cta-section p { color: rgba(255,255,255,0.7); margin-bottom: 1.5rem; font-size: 1.05rem; }
  .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  .cta-buttons .btn-secondary { background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.3); }

  @media (max-width: 768px) {
    .hero { padding: 3rem 0 2.5rem; }
    .value-grid { grid-template-columns: 1fr; }
  }
</style>
