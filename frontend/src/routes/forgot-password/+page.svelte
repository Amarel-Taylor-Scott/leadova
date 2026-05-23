<script>
  let email = '';
  let submitted = false;
  let loading = false;
  let error = '';

  async function handleSubmit() {
    error = '';
    loading = true;
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Request failed');
      submitted = true;
    } catch (err) {
      error = err.message || 'Something went wrong';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Forgot Password | Leadova</title></svelte:head>

<div class="auth-page">
  <div class="auth-card card">
    {#if submitted}
      <h1>Check your email</h1>
      <p class="auth-sub">If an account with that email exists, we have sent a password reset link.</p>
      <a href="/login" class="btn btn-secondary full-width" style="margin-top:1rem">Back to Login</a>
    {:else}
      <h1>Forgot your password?</h1>
      <p class="auth-sub">Enter your email and we will send you a reset link.</p>

      {#if error}
        <div class="alert alert-error">{error}</div>
      {/if}

      <form on:submit|preventDefault={handleSubmit}>
        <label>
          Email
          <input type="email" bind:value={email} placeholder="you@example.com" required autocomplete="email" />
        </label>

        <button type="submit" class="btn btn-primary full-width" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p class="auth-footer">Remember your password? <a href="/login">Log in</a></p>
    {/if}
  </div>
</div>

<style>
  .auth-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 2rem; }
  .auth-card { max-width: 420px; width: 100%; }
  .auth-card h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  .auth-sub { color: var(--text-muted); margin-bottom: 1.5rem; }
  form { display: flex; flex-direction: column; gap: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }
  .full-width { width: 100%; justify-content: center; margin-top: 0.5rem; }
  .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted); }
  .alert-error { padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.9rem; margin-bottom: 1rem; background: rgba(239,68,68,0.08); border: 1px solid var(--red); color: var(--red); }
</style>
