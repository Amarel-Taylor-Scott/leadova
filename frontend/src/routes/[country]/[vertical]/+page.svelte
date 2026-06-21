<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import ChatWidget from '$lib/components/ChatWidget.svelte';

  let vertical = null;
  let countryData = null;
  let vcConfig = null;
  let formFields = [];
  let config = {};
  let loading = true;
  let error = '';

  // Form state
  let formValues = {};
  let consentChecked = false;
  let submitting = false;
  let submitSuccess = false;
  let submitError = '';

  // Waitlist state
  let waitlistEmail = '';
  let waitlistSubmitting = false;
  let waitlistSuccess = false;

  $: countryCode = $page.params.country?.toUpperCase();
  $: verticalSlug = $page.params.vertical;

  onMount(async () => {
    try {
      const res = await fetch(`/api/v1/verticals/${verticalSlug}`);
      const data = await res.json();
      if (!data.success) { error = 'Vertical not found'; loading = false; return; }

      vertical = data.data.vertical;
      const countries = data.data.countries || [];
      vcConfig = countries.find(c => c.code === countryCode);

      if (!vcConfig) { error = 'This vertical is not available in this country'; loading = false; return; }

      countryData = { code: vcConfig.code, name: vcConfig.name, flag_emoji: vcConfig.flag_emoji };

      // Parse landing page config
      const lpc = vcConfig.landing_page_config;
      config = typeof lpc === 'string' ? JSON.parse(lpc) : (lpc || {});

      // Determine form fields: override or default from vertical
      const ff = vcConfig.form_fields_override || vertical.form_fields;
      formFields = typeof ff === 'string' ? JSON.parse(ff) : (ff || []);

      // Initialize form values
      formValues = {};
      for (const field of formFields) {
        formValues[field.name] = '';
      }
    } catch (err) {
      error = 'Failed to load page data';
    }
    loading = false;
  });

  async function handleSubmit() {
    submitError = '';
    submitting = true;
    try {
      const consentText = `I consent to having my information collected and shared with verified service providers for ${vertical.name} services in ${countryData.name}. I understand I can withdraw consent at any time.`;

      const res = await fetch('/api/v1/leads/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical_slug: verticalSlug,
          country_code: countryCode,
          fields: formValues,
          consent_text_shown: consentText,
          consent_given: consentChecked,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Submission failed');
      submitSuccess = true;
    } catch (err) {
      submitError = err.message || 'Something went wrong. Please try again.';
    }
    submitting = false;
  }

  async function handleWaitlist() {
    waitlistSubmitting = true;
    try {
      const res = await fetch('/api/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: waitlistEmail,
          vertical_slug: verticalSlug,
          country_code: countryCode,
          user_type: 'lead',
          source: `/${countryCode.toLowerCase()}/${verticalSlug}`,
        }),
      });
      const data = await res.json();
      if (data.success) waitlistSuccess = true;
    } catch (err) {
      console.error('Waitlist error', err);
    }
    waitlistSubmitting = false;
  }
</script>

<svelte:head>
  {#if vcConfig}
    <title>{vcConfig.seo_title || `${vertical?.name} in ${countryData?.name} | Leadova`}</title>
    <meta name="description" content={vcConfig.seo_description || `${vertical?.name} leads in ${countryData?.name}.`} />
  {:else}
    <title>Leadova</title>
  {/if}
</svelte:head>

{#if loading}
  <div class="container page"><div class="loading">Loading...</div></div>
{:else if error}
  <div class="container page">
    <div class="error-card card">
      <h2>Not Available</h2>
      <p>{error}</p>
      <a href="/verticals" class="btn btn-primary" style="margin-top:1rem">Browse Verticals</a>
    </div>
  </div>
{:else if vcConfig.status === 'coming_soon'}
  <!-- COMING SOON: Waitlist form -->
  <section class="hero-landing">
    <div class="container">
      <div class="hero-badge">
        <span class="badge badge-orange">Coming Soon</span>
        <span class="country-flag">{countryData.flag_emoji} {countryData.name}</span>
      </div>
      <h1>{config.hero_title || `${vertical.name} in ${countryData.name}`}</h1>
      <p class="hero-sub">{config.hero_subtitle || 'This vertical is launching soon. Join the waitlist to be notified.'}</p>
    </div>
  </section>

  <div class="container page">
    <div class="waitlist-form card" style="max-width:500px;margin:0 auto;">
      {#if waitlistSuccess}
        <div class="success-msg">
          <h3>You are on the list</h3>
          <p>We will notify you when {vertical.name} launches in {countryData.name}.</p>
        </div>
      {:else}
        <h2>Join the Waitlist</h2>
        <p class="form-sub">Be the first to know when we launch.</p>
        <form on:submit|preventDefault={handleWaitlist}>
          <label>
            Email address
            <input type="email" bind:value={waitlistEmail} placeholder="you@example.com" required />
          </label>
          <button type="submit" class="btn btn-primary full-width" disabled={waitlistSubmitting}>
            {waitlistSubmitting ? 'Joining...' : config.cta_text || 'Join Waitlist'}
          </button>
        </form>
      {/if}
    </div>
  </div>
{:else}
  <!-- ACTIVE: Full lead form -->
  <section class="hero-landing">
    <div class="container">
      <div class="hero-badge">
        <span class="country-flag">{countryData.flag_emoji} {countryData.name}</span>
        <span class="badge badge-green">Active</span>
      </div>
      <h1>{config.hero_title || vertical.name}</h1>
      <p class="hero-sub">{config.hero_subtitle || vertical.description}</p>
    </div>
  </section>

  <div class="container landing-layout">
    <!-- Features and trust badges -->
    <div class="landing-info">
      {#if config.features && config.features.length > 0}
        <div class="features-box card">
          <h3>What You Get</h3>
          <ul>
            {#each config.features as feature}
              <li>{feature}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if config.trust_badges && config.trust_badges.length > 0}
        <div class="trust-box">
          {#each config.trust_badges as badge}
            <span class="trust-badge">{badge}</span>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Lead form -->
    <div class="form-box card">
      {#if submitSuccess}
        <div class="success-msg">
          <h3>Thank you for your submission</h3>
          <p>A verified provider will be in touch with you shortly. Your information is protected under {countryData.name}'s privacy regulations.</p>
          <a href="/" class="btn btn-secondary" style="margin-top:1rem">Back to Home</a>
        </div>
      {:else}
        <h2>{config.cta_text || 'Get Started'}</h2>
        <p class="form-sub">Fill out the form below. All fields with * are required.</p>

        {#if submitError}
          <div class="alert alert-error">{submitError}</div>
        {/if}

        <form on:submit|preventDefault={handleSubmit}>
          {#each formFields as field}
            <label>
              {field.label}{field.required ? ' *' : ''}
              {#if field.type === 'select' && field.options}
                <select bind:value={formValues[field.name]} required={field.required}>
                  <option value="">Select...</option>
                  {#each field.options as opt}
                    <option value={opt}>{opt}</option>
                  {/each}
                </select>
              {:else if field.type === 'textarea'}
                <textarea bind:value={formValues[field.name]} required={field.required} rows="3"></textarea>
              {:else if field.type === 'number'}
                <input type="number" bind:value={formValues[field.name]} required={field.required} />
              {:else if field.type === 'email'}
                <input type="email" bind:value={formValues[field.name]} required={field.required} placeholder={field.label} />
              {:else if field.type === 'tel'}
                <input type="tel" bind:value={formValues[field.name]} required={field.required} placeholder={field.label} />
              {:else}
                <input type="text" bind:value={formValues[field.name]} required={field.required} placeholder={field.label} />
              {/if}
            </label>
          {/each}

          <div class="consent-box">
            <label class="consent-label">
              <input type="checkbox" bind:checked={consentChecked} required />
              <span>I consent to having my information collected and shared with verified service providers for {vertical.name} services in {countryData.name}. I understand I can withdraw consent at any time by contacting privacy@leadova.com.</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary full-width" disabled={submitting || !consentChecked}>
            {submitting ? 'Submitting...' : config.cta_text || 'Submit'}
          </button>
        </form>
      {/if}
    </div>
  </div>

  <!-- Floating chatbot widget -->
  {#if vertical && countryData}
    <ChatWidget verticalSlug={verticalSlug} countryCode={countryCode} />
  {/if}
{/if}

<style>
  .hero-landing { background: var(--navy); color: white; padding: 3.5rem 0; text-align: center; }
  .hero-landing h1 { color: white; font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: 0.75rem; }
  .hero-sub { color: rgba(255,255,255,0.7); font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
  .hero-badge { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1rem; }
  .country-flag { color: white; font-size: 1rem; font-weight: 500; }
  .page { padding: 3rem 0; }
  .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
  .error-card { text-align: center; padding: 3rem; max-width: 500px; margin: 0 auto; }

  .landing-layout { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2.5rem; padding: 3rem 0; align-items: start; }
  .features-box { margin-bottom: 1.5rem; }
  .features-box h3 { font-size: 1.1rem; margin-bottom: 0.75rem; }
  .features-box ul { list-style: none; }
  .features-box li { padding: 0.4rem 0; font-size: 0.92rem; color: var(--text-muted); }
  .features-box li::before { content: '\2713  '; color: var(--green); font-weight: 700; }

  .trust-box { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .trust-badge { display: inline-flex; align-items: center; padding: 0.4rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 600; background: var(--green-glow); color: var(--green); border: 1px solid rgba(34, 197, 94, 0.2); }

  .form-box { position: sticky; top: 80px; }
  .form-box h2 { font-size: 1.25rem; margin-bottom: 0.25rem; }
  .form-sub { color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.25rem; }
  form { display: flex; flex-direction: column; gap: 0.9rem; }
  label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.88rem; color: var(--text-muted); font-weight: 500; }

  .consent-box { margin-top: 0.5rem; }
  .consent-label { display: flex; gap: 0.75rem; align-items: flex-start; flex-direction: row; font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; }
  .consent-label input[type="checkbox"] { width: auto; margin-top: 0.15rem; flex-shrink: 0; }
  .full-width { width: 100%; justify-content: center; margin-top: 0.5rem; }

  .success-msg { text-align: center; padding: 2rem 0; }
  .success-msg h3 { color: var(--green); font-size: 1.25rem; margin-bottom: 0.5rem; }
  .success-msg p { color: var(--text-muted); }

  .alert-error { padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; margin-bottom: 0.5rem; background: rgba(239,68,68,0.08); border: 1px solid var(--red); color: var(--red); }

  .waitlist-form h2 { font-size: 1.25rem; margin-bottom: 0.25rem; }
  .waitlist-form form { display: flex; flex-direction: column; gap: 1rem; }
  .waitlist-form label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.88rem; color: var(--text-muted); }

  @media (max-width: 768px) {
    .landing-layout { grid-template-columns: 1fr; }
    .form-box { position: static; }
  }
</style>
