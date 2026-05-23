<script>
  let email = '';
  let submitted = false;
  let submitting = false;

  async function handleJoin() {
    submitting = true;
    try {
      await fetch('/api/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, user_type: 'agent', source: '/agents' }),
      });
      submitted = true;
    } catch (err) {
      console.error('Failed', err);
    }
    submitting = false;
  }
</script>

<svelte:head>
  <title>Become a Field Agent | Leadova</title>
  <meta name="description" content="Join Leadova as a field agent. Collect leads on the ground, earn commissions, and help connect people with services they need." />
</svelte:head>

<section class="hero-sm">
  <div class="container">
    <h1>Become a Leadova Field Agent</h1>
    <p>Collect leads in your community, earn commissions, and help people find the services they need.</p>
  </div>
</section>

<div class="container page">
  <div class="info-grid">
    <div class="info-col">
      <h2>How It Works</h2>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <h3>Apply and Get Approved</h3>
          <p>Sign up as an agent. Once approved, you receive a unique agent code and access to the agent portal.</p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <h3>Collect Leads</h3>
          <p>Meet people in your community who need services. Use the agent portal to submit their information with proper consent.</p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <h3>Earn Commissions</h3>
          <p>Get paid for every verified lead you submit. Track your performance and earnings in real time.</p>
        </div>
      </div>
    </div>

    <div class="info-col">
      <h2>Why Become an Agent</h2>
      <ul>
        <li>Flexible schedule, work on your own time</li>
        <li>Commission per verified lead submitted</li>
        <li>Support multiple verticals: jobs, insurance, real estate, and more</li>
        <li>Mobile-friendly agent portal</li>
        <li>Real-time activity tracking and stats</li>
        <li>Consent-first approach protects you and the leads</li>
      </ul>
    </div>
  </div>

  <div class="apply-box card">
    {#if submitted}
      <div class="success">
        <h3>Application received</h3>
        <p>We will review your application and get back to you within 48 hours.</p>
      </div>
    {:else}
      <h2>Apply to Become an Agent</h2>
      <p>Enter your email to start the application process.</p>
      <form on:submit|preventDefault={handleJoin}>
        <input type="email" bind:value={email} placeholder="your@email.com" required />
        <button type="submit" class="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Apply Now'}
        </button>
      </form>
    {/if}
  </div>
</div>

<style>
  .hero-sm { background: var(--navy); color: white; padding: 3rem 0; text-align: center; }
  .hero-sm h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
  .hero-sm p { color: rgba(255,255,255,0.7); }
  .page { padding: 3rem 0; }

  .info-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; margin-bottom: 3rem; }
  .info-col h2 { font-size: 1.5rem; margin-bottom: 1.5rem; }
  .steps { display: flex; flex-direction: column; gap: 1.5rem; }
  .step-num { width: 36px; height: 36px; border-radius: 50%; background: var(--green-glow); color: var(--green); font-family: var(--font-heading); font-weight: 700; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; border: 2px solid var(--green); }
  .step h3 { font-size: 1rem; margin-bottom: 0.25rem; }
  .step p { font-size: 0.9rem; color: var(--text-muted); }
  .info-col ul { list-style: none; }
  .info-col li { padding: 0.5rem 0; font-size: 0.92rem; color: var(--text-muted); }
  .info-col li::before { content: '\2713  '; color: var(--green); font-weight: 700; }

  .apply-box { max-width: 500px; margin: 0 auto; text-align: center; }
  .apply-box h2 { font-size: 1.25rem; margin-bottom: 0.5rem; }
  .apply-box p { color: var(--text-muted); margin-bottom: 1rem; font-size: 0.92rem; }
  .apply-box form { display: flex; gap: 0.75rem; }
  .apply-box input { flex: 1; }
  .success h3 { color: var(--green); margin-bottom: 0.5rem; }
  .success p { color: var(--text-muted); }

  @media (max-width: 768px) {
    .info-grid { grid-template-columns: 1fr; }
    .apply-box form { flex-direction: column; }
  }
</style>
