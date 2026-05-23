<script>
  import '../app.css';

  let loggedIn = false;
  let userRole = '';
  let mobileOpen = false;

  function checkAuth() {
    if (typeof localStorage === 'undefined') return;
    const token = localStorage.getItem('token');
    loggedIn = !!token;
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userRole = payload.role || '';
      }
    } catch { userRole = ''; }
  }

  if (typeof window !== 'undefined') checkAuth();

  function logout() {
    localStorage.removeItem('token');
    loggedIn = false;
    userRole = '';
    window.location.href = '/';
  }
</script>

<nav class="nav">
  <div class="nav-inner container">
    <a href="/" class="logo">Leadova</a>

    <button class="mobile-toggle" on:click={() => mobileOpen = !mobileOpen} aria-label="Toggle menu">
      <span class="bar"></span><span class="bar"></span><span class="bar"></span>
    </button>

    <div class="nav-links" class:open={mobileOpen}>
      <a href="/verticals">Verticals</a>
      <a href="/businesses">For Businesses</a>
      <a href="/pricing">Pricing</a>
      <a href="/agents">For Agents</a>
      <a href="/chatbot">Chatbot</a>
      <a href="/partners">Partners</a>

      {#if loggedIn}
        {#if userRole === 'admin'}
          <a href="/admin">Admin</a>
        {/if}
        {#if userRole === 'subscriber'}
          <a href="/dashboard">Dashboard</a>
        {/if}
        {#if userRole === 'agent'}
          <a href="/agent">Agent Portal</a>
        {/if}
        <button class="btn-ghost nav-logout" on:click={logout}>Log out</button>
      {:else}
        <a href="/login" class="btn btn-primary nav-cta">Log In</a>
      {/if}
    </div>
  </div>
</nav>

<main>
  <slot />
</main>

<footer class="footer">
  <div class="container footer-grid">
    <div class="footer-col">
      <div class="footer-logo">Leadova</div>
      <p class="footer-desc">Config-driven lead generation platform. Connecting people with services they need, across verticals and countries.</p>
    </div>
    <div class="footer-col">
      <h4>Platform</h4>
      <a href="/verticals">Verticals</a>
      <a href="/businesses">For Businesses</a>
      <a href="/pricing">Pricing</a>
      <a href="/agents">For Agents</a>
      <a href="/chatbot">Chatbot</a>
      <a href="/partners">Partners</a>
      <a href="/developers">API Docs</a>
      <a href="/blog">Blog</a>
    </div>
    <div class="footer-col">
      <h4>Legal</h4>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
      <a href="/consent">Consent Policy</a>
      <a href="/contact">Contact</a>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <a href="mailto:hello@leadova.com">hello@leadova.com</a>
      <a href="mailto:support@leadova.com">support@leadova.com</a>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>&copy; {new Date().getFullYear()} Leadova. All rights reserved.</p>
  </div>
</footer>

<style>
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: var(--navy);
    padding: 0.75rem 0;
    box-shadow: 0 2px 8px rgba(31, 56, 100, 0.15);
  }
  .nav-inner { display: flex; align-items: center; justify-content: space-between; }
  .logo {
    font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700;
    color: white;
  }
  .logo:hover { color: white; }
  .nav-links { display: flex; align-items: center; gap: 1.5rem; }
  .nav-links a { color: rgba(255,255,255,0.8); font-size: 0.9rem; font-weight: 500; }
  .nav-links a:hover { color: white; }
  .nav-cta { padding: 0.5rem 1.25rem; font-size: 0.85rem; }
  .nav-logout { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
  .nav-logout:hover { color: white; }
  .mobile-toggle { display: none; background: none; padding: 0.25rem; }
  .bar { display: block; width: 22px; height: 2px; background: white; margin: 4px 0; border-radius: 2px; }
  main { min-height: calc(100vh - 140px); }

  .footer {
    background: var(--navy-dark);
    color: rgba(255,255,255,0.7);
    padding: 3rem 0 1.5rem;
    margin-top: 4rem;
  }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
  .footer-logo { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.5rem; }
  .footer-desc { font-size: 0.85rem; line-height: 1.6; }
  .footer-col { display: flex; flex-direction: column; gap: 0.5rem; }
  .footer-col h4 { color: white; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
  .footer-col a { color: rgba(255,255,255,0.6); font-size: 0.85rem; }
  .footer-col a:hover { color: white; }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.4); }

  @media (max-width: 768px) {
    .mobile-toggle { display: block; }
    .nav-links { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--navy); padding: 1rem 1.5rem; gap: 1rem; }
    .nav-links.open { display: flex; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
