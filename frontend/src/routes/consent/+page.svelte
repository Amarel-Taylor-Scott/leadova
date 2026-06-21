<svelte:head>
  <title>Consent Policy | Leadova</title>
</svelte:head>

<div class="container page legal">
  <h1>Consent Policy</h1>
  <p class="updated">Last updated: January 2026</p>

  <section>
    <h2>1. Our Commitment to Consent</h2>
    <p>Leadova operates on a strict consent-first model. No personal information is collected, stored, or shared without the explicit and informed consent of the individual.</p>
  </section>

  <section>
    <h2>2. How Consent Is Collected</h2>
    <p>We support four methods of consent collection:</p>
    <ul>
      <li><strong>Web Form</strong>: The individual reads the consent text on the form page and checks a consent checkbox before submitting. The consent text, timestamp, IP address, and user agent are recorded.</li>
      <li><strong>Agent Verbal</strong>: A field agent reads the consent text aloud to the individual. The agent confirms verbal consent was given, and the consent method, timestamp, and agent ID are recorded.</li>
      <li><strong>Agent Signature</strong>: The individual provides a physical or digital signature acknowledging the consent text. The agent records this with the consent method, timestamp, and agent ID.</li>
      <li><strong>Chatbot</strong>: The consent text is presented during a chatbot conversation, and the individual agrees before any personal information is collected.</li>
    </ul>
  </section>

  <section>
    <h2>3. What Is Recorded</h2>
    <p>For every consent event, we record:</p>
    <ul>
      <li>Consent method (web_form, agent_verbal, agent_signature, chatbot)</li>
      <li>Exact timestamp of consent</li>
      <li>The full consent text shown to the individual</li>
      <li>IP address (for web submissions)</li>
      <li>Agent ID (for agent-collected leads)</li>
    </ul>
  </section>

  <section>
    <h2>4. Withdrawing Consent</h2>
    <p>You have the right to withdraw your consent at any time. When consent is withdrawn:</p>
    <ul>
      <li>Your data is immediately marked as withdrawn</li>
      <li>Subscribers are notified and prohibited from contacting you</li>
      <li>Your data is soft-deleted and permanently purged within 30 days</li>
      <li>A withdrawal timestamp is recorded for compliance</li>
    </ul>
    <p>To withdraw consent, email <a href="mailto:privacy@leadova.com">privacy@leadova.com</a> with the subject "Consent Withdrawal" and include your name and email address.</p>
  </section>

  <section>
    <h2>5. Compliance</h2>
    <p>Our consent practices comply with:</p>
    <ul>
      <li><strong>RA 10173 (Philippines)</strong>: Consent must be freely given, specific, informed, and indicated willingness per Section 3(b) of the Data Privacy Act.</li>
      <li><strong>TCPA (United States)</strong>: Prior express written consent is obtained before sharing personal information with service providers.</li>
      <li><strong>CCPA (California)</strong>: Consumers are informed of data collection and have the right to opt out.</li>
      <li><strong>GDPR (UK/EU)</strong>: Consent is freely given, specific, informed, and unambiguous per Article 7.</li>
      <li><strong>PDPA (Singapore)</strong>: Consent is obtained for the purpose of collection as stated at the time of collection.</li>
    </ul>
  </section>

  <section>
    <h2>6. Contact</h2>
    <p>For consent-related inquiries: <a href="mailto:privacy@leadova.com">privacy@leadova.com</a></p>
  </section>
</div>

<style>
  .legal { max-width: 760px; padding: 3rem 1.5rem; }
  .legal h1 { font-size: 2rem; margin-bottom: 0.5rem; }
  .updated { color: var(--text-muted); margin-bottom: 2rem; font-size: 0.9rem; }
  section { margin-bottom: 2rem; }
  section h2 { font-size: 1.15rem; margin-bottom: 0.75rem; }
  section p { color: var(--text-muted); margin-bottom: 0.75rem; font-size: 0.95rem; line-height: 1.7; }
  section ul { margin: 0.5rem 0 0.75rem 1.5rem; }
  section li { color: var(--text-muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 0.25rem; }
</style>
