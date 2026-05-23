<svelte:head>
  <title>Contact | Leadova</title>
</svelte:head>

<section class="hero-sm">
  <div class="container">
    <h1>Contact Us</h1>
    <p>Have questions? We are here to help.</p>
  </div>
</section>

<div class="container page">
  <div class="contact-grid">
    <div class="contact-info card">
      <h2>Get in Touch</h2>
      <div class="contact-item">
        <h3>General Inquiries</h3>
        <a href="mailto:hello@leadova.com">hello@leadova.com</a>
      </div>
      <div class="contact-item">
        <h3>Support</h3>
        <a href="mailto:support@leadova.com">support@leadova.com</a>
      </div>
      <div class="contact-item">
        <h3>Privacy and Data Requests</h3>
        <a href="mailto:privacy@leadova.com">privacy@leadova.com</a>
        <p>For consent withdrawal, data access, or deletion requests.</p>
      </div>
    </div>
    <div class="contact-form card">
      <h2>Send a Message</h2>
      <form>
        <label>Name <input type="text" placeholder="Your name" required /></label>
        <label>Email <input type="email" placeholder="your@email.com" required /></label>
        <label>Subject
          <select>
            <option>General inquiry</option>
            <option>Business / subscriber question</option>
            <option>Agent application</option>
            <option>Privacy / data request</option>
            <option>Technical support</option>
          </select>
        </label>
        <label>Message <textarea rows="4" placeholder="How can we help?" required></textarea></label>
        <button type="submit" class="btn btn-primary full-width">Send Message</button>
      </form>
    </div>
  </div>
</div>

<style>
  .hero-sm { background: var(--navy); color: white; padding: 3rem 0; text-align: center; }
  .hero-sm h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
  .hero-sm p { color: rgba(255,255,255,0.7); }
  .page { padding: 3rem 0; }
  .contact-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 2rem; }
  .contact-item { margin-bottom: 1.5rem; }
  .contact-item h3 { font-size: 0.95rem; margin-bottom: 0.25rem; }
  .contact-item a { font-size: 0.95rem; }
  .contact-item p { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }
  .contact-form h2 { margin-bottom: 1rem; }
  form { display: flex; flex-direction: column; gap: 0.9rem; }
  label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.88rem; color: var(--text-muted); font-weight: 500; }
  .full-width { width: 100%; justify-content: center; }
  @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }
</style>
