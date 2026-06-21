<script>
  let email = '';
  let password = '';
  let name = '';
  let role = 'subscriber';
  let error = '';
  let loading = false;

  async function handleSubmit() {
    error = '';
    loading = true;
    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Signup failed');
      localStorage.setItem('token', data.data.token);

      if (role === 'agent') window.location.href = '/agent';
      else window.location.href = '/dashboard';
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Sign Up | Leadova</title></svelte:head>

<div class="auth-page">
  <div class="auth-card card">
    <h1>Create your account</h1>
    <p class="auth-sub">Start receiving or submitting leads in minutes</p>

    {#if error}
      <div class="alert alert-error">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <label>
        I want to
        <div class="role-toggle">
          <button type="button" class="role-btn" class:active={role === 'subscriber'} on:click={() => role = 'subscriber'}>
            Receive Leads (Business)
          </button>
          <button type="button" class="role-btn" class:active={role === 'agent'} on:click={() => role = 'agent'}>
            Submit Leads (Agent)
          </button>
        </div>
      </label>

      <label>
        Your name
        <input type="text" bind:value={name} placeholder="Jane Smith" required />
      </label>

      <label>
        Email
        <input type="email" bind:value={email} placeholder="you@example.com" required autocomplete="email" />
      </label>

      <label>
        Password
        <input type="password" bind:value={password} placeholder="Min 10 characters" required minlength="10" autocomplete="new-password" />
      </label>

      <button type="submit" class="btn btn-primary full-width" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>

    <p class="auth-footer">Already have an account? <a href="/login">Log in</a></p>
  </div>
</div>

<style>
  .auth-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 2rem; }
  .auth-card { max-width: 440px; width: 100%; }
  .auth-card h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  .auth-sub { color: var(--text-muted); margin-bottom: 1.5rem; }
  form { display: flex; flex-direction: column; gap: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }
  .role-toggle { display: flex; gap: 0.5rem; }
  .role-btn { flex: 1; padding: 0.7rem 0.75rem; border-radius: var(--radius-sm); background: var(--bg-surface); color: var(--text-muted); font-weight: 500; font-size: 0.85rem; border: 1px solid var(--border); text-align: center; transition: all 0.15s; }
  .role-btn.active { background: var(--navy); color: white; border-color: var(--navy); }
  .full-width { width: 100%; justify-content: center; margin-top: 0.5rem; }
  .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted); }
  .alert-error { padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.9rem; margin-bottom: 1rem; background: rgba(239,68,68,0.08); border: 1px solid var(--red); color: var(--red); }
</style>
