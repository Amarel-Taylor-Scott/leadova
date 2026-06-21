<script>
  import { onMount, tick } from 'svelte';

  let verticals = [];
  let selectedVertical = '';
  let selectedCountry = '';
  let countries = [];
  let loading = true;

  // Chat state
  let sessionId = '';
  let messages = [];
  let inputValue = '';
  let chatStatus = 'idle';
  let typing = false;
  let currentField = null;
  let progress = null;
  let chatStarted = false;
  let chatBody;

  onMount(async () => {
    try {
      const res = await fetch('/api/v1/verticals');
      const data = await res.json();
      if (data.success) verticals = data.data.verticals || [];
    } catch (err) {
      console.error('Failed to load verticals', err);
    }
    loading = false;

    // Check for URL params (for iframe embedding)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const vs = params.get('vertical');
      const cc = params.get('country');
      if (vs) selectedVertical = vs;
      if (cc) selectedCountry = cc.toUpperCase();
      if (vs && cc) {
        onVerticalChange();
        await tick();
        startChat();
      }
    }
  });

  function onVerticalChange() {
    const v = verticals.find(v => v.slug === selectedVertical);
    countries = v ? (v.countries || []).filter(c => c.status === 'active') : [];
    selectedCountry = '';
  }

  async function scrollToBottom() {
    await tick();
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }

  async function startChat() {
    if (!selectedVertical || !selectedCountry) return;
    chatStarted = true;
    typing = true;
    messages = [];

    try {
      const res = await fetch('/api/v1/chatbot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical_slug: selectedVertical,
          country_code: selectedCountry,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sessionId = data.data.session_id;
        chatStatus = data.data.status;
        currentField = data.data.field || null;
        progress = data.data.progress || null;
        messages = [{ role: 'bot', text: data.data.message }];
      } else {
        messages = [{ role: 'bot', text: data.error?.message || 'Failed to start session.' }];
      }
    } catch (err) {
      messages = [{ role: 'bot', text: 'Connection error. Please try again.' }];
    }
    typing = false;
    scrollToBottom();
  }

  async function sendMessage() {
    const text = inputValue.trim();
    if (!text || !sessionId || typing) return;
    if (chatStatus === 'complete' || chatStatus === 'expired') return;

    inputValue = '';
    messages = [...messages, { role: 'user', text }];
    typing = true;
    scrollToBottom();

    try {
      const res = await fetch('/api/v1/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });
      const data = await res.json();
      if (data.success) {
        chatStatus = data.data.status;
        currentField = data.data.field || null;
        progress = data.data.progress || null;
        messages = [...messages, { role: 'bot', text: data.data.message }];
      } else {
        messages = [...messages, { role: 'bot', text: data.error?.message || 'Something went wrong.' }];
      }
    } catch (err) {
      messages = [...messages, { role: 'bot', text: 'Connection error. Please try again.' }];
    }
    typing = false;
    scrollToBottom();
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function selectOption(opt) {
    inputValue = opt;
    sendMessage();
  }

  function resetChat() {
    chatStarted = false;
    sessionId = '';
    messages = [];
    chatStatus = 'idle';
    currentField = null;
    progress = null;
  }
</script>

<svelte:head>
  <title>Chat Assistant | Leadova</title>
  <meta name="description" content="Chat with our AI assistant to get matched with service providers." />
</svelte:head>

<div class="chatbot-page">
  {#if !chatStarted}
    <section class="chat-hero">
      <div class="container">
        <h1>Leadova Chat Assistant</h1>
        <p class="hero-sub">Have a conversation with our assistant to get matched with the right service providers. Quick, easy, and private.</p>
      </div>
    </section>

    <div class="container chat-start-section">
      <div class="start-card card">
        {#if loading}
          <p class="loading-text">Loading...</p>
        {:else}
          <h2>Start a Conversation</h2>
          <p class="start-sub">Select a service category and your country to begin.</p>

          <div class="start-form">
            <label>
              Service Category
              <select bind:value={selectedVertical} on:change={onVerticalChange}>
                <option value="">Choose a category...</option>
                {#each verticals.filter(v => v.status === 'active') as v}
                  <option value={v.slug}>{v.name}</option>
                {/each}
              </select>
            </label>

            {#if countries.length > 0}
              <label>
                Your Country
                <select bind:value={selectedCountry}>
                  <option value="">Choose your country...</option>
                  {#each countries as c}
                    <option value={c.code}>{c.flag_emoji} {c.name}</option>
                  {/each}
                </select>
              </label>
            {/if}

            <button
              class="btn btn-primary start-btn"
              on:click={startChat}
              disabled={!selectedVertical || !selectedCountry}
            >
              Start Chat
            </button>
          </div>

          <div class="start-features">
            <div class="feature">
              <span class="feature-icon">1-2 min</span>
              <span>Quick conversation</span>
            </div>
            <div class="feature">
              <span class="feature-icon">100%</span>
              <span>Privacy protected</span>
            </div>
            <div class="feature">
              <span class="feature-icon">Free</span>
              <span>No cost to you</span>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Full-page chat interface -->
    <div class="chat-full">
      <div class="chat-full-header">
        <div class="chat-full-left">
          <button class="back-btn" on:click={resetChat} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="header-avatar">L</div>
          <div>
            <div class="header-title">Leadova Assistant</div>
            {#if progress}
              <div class="header-sub">Question {Math.min(progress.current + 1, progress.total)} of {progress.total}</div>
            {:else}
              <div class="header-sub">Online</div>
            {/if}
          </div>
        </div>
        {#if progress}
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width: {((progress.current) / progress.total) * 100}%"></div>
          </div>
        {/if}
      </div>

      <div class="chat-full-body" bind:this={chatBody}>
        {#each messages as msg}
          <div class="msg-row" class:bot-row={msg.role === 'bot'} class:user-row={msg.role === 'user'}>
            {#if msg.role === 'bot'}
              <div class="msg-av">L</div>
            {/if}
            <div class="msg-content" class:bot-msg={msg.role === 'bot'} class:user-msg={msg.role === 'user'}>
              {#each msg.text.split('\n') as line}
                {#if line.trim()}
                  <p>{line}</p>
                {/if}
              {/each}
            </div>
          </div>
        {/each}

        {#if typing}
          <div class="msg-row bot-row">
            <div class="msg-av">L</div>
            <div class="msg-content bot-msg typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        {/if}

        {#if currentField && currentField.options && currentField.options.length > 0 && chatStatus === 'collecting'}
          <div class="options-row">
            {#each currentField.options as opt}
              <button class="opt-btn" on:click={() => selectOption(opt)}>{opt}</button>
            {/each}
          </div>
        {/if}

        {#if chatStatus === 'consent'}
          <div class="options-row">
            <button class="opt-btn yes-btn" on:click={() => selectOption('yes')}>Yes, I agree</button>
            <button class="opt-btn no-btn" on:click={() => selectOption('no')}>No, cancel</button>
          </div>
        {/if}
      </div>

      <div class="chat-full-footer">
        {#if chatStatus === 'complete' || chatStatus === 'expired'}
          <div class="chat-ended">
            {chatStatus === 'complete' ? 'Conversation complete. Thank you!' : 'Session ended.'}
            <button class="btn btn-secondary" on:click={resetChat} style="margin-top:0.5rem">Start New Chat</button>
          </div>
        {:else}
          <div class="input-row">
            <input
              type="text"
              bind:value={inputValue}
              on:keydown={handleKeydown}
              placeholder={currentField ? currentField.label + '...' : 'Type your answer...'}
              disabled={typing}
            />
            <button class="send" on:click={sendMessage} disabled={!inputValue.trim() || typing} aria-label="Send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        {/if}
        <div class="powered">Powered by <strong>Leadova</strong></div>
      </div>
    </div>
  {/if}
</div>

<style>
  .chatbot-page { min-height: calc(100vh - 140px); }
  .chat-hero { background: var(--navy); color: white; padding: 3rem 0; text-align: center; }
  .chat-hero h1 { color: white; font-size: clamp(1.75rem, 4vw, 2.25rem); margin-bottom: 0.5rem; }
  .hero-sub { color: rgba(255,255,255,0.7); font-size: 1.05rem; max-width: 550px; margin: 0 auto; }

  .chat-start-section { padding: 3rem 0; display: flex; justify-content: center; }
  .start-card { max-width: 480px; width: 100%; text-align: center; }
  .start-card h2 { font-size: 1.35rem; margin-bottom: 0.25rem; }
  .start-sub { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
  .loading-text { color: var(--text-muted); padding: 2rem; }

  .start-form { display: flex; flex-direction: column; gap: 1rem; text-align: left; margin-bottom: 1.5rem; }
  .start-form label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.88rem; color: var(--text-muted); font-weight: 500; }
  .start-btn { width: 100%; justify-content: center; padding: 0.85rem; font-size: 1rem; }

  .start-features { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; }
  .feature { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
  .feature-icon { font-family: var(--font-heading); font-weight: 700; font-size: 1.1rem; color: var(--green); }
  .feature span:last-child { font-size: 0.8rem; color: var(--text-muted); }

  /* Full-page chat */
  .chat-full {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
    max-width: 700px;
    margin: 0 auto;
    background: var(--bg-surface);
  }
  .chat-full-header {
    background: var(--navy);
    color: white;
    padding: 0.85rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .chat-full-left { display: flex; align-items: center; gap: 0.65rem; }
  .back-btn { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 4px; }
  .back-btn:hover { color: white; }
  .header-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--green); color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.95rem;
  }
  .header-title { font-weight: 600; font-size: 0.95rem; }
  .header-sub { font-size: 0.72rem; opacity: 0.7; }
  .progress-bar-wrap {
    width: 80px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.2); overflow: hidden;
  }
  .progress-bar { height: 100%; background: var(--green); border-radius: 2px; transition: width 0.3s; }

  .chat-full-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .msg-row { display: flex; gap: 0.5rem; align-items: flex-end; }
  .bot-row { justify-content: flex-start; }
  .user-row { justify-content: flex-end; }
  .msg-av {
    width: 30px; height: 30px; border-radius: 50%;
    background: var(--navy); color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.72rem; flex-shrink: 0;
  }
  .msg-content {
    max-width: 75%;
    padding: 0.7rem 1rem;
    border-radius: 16px;
    font-size: 0.9rem;
    line-height: 1.55;
  }
  .msg-content p { margin: 0 0 0.3rem; }
  .msg-content p:last-child { margin: 0; }
  .bot-msg {
    background: white;
    color: var(--text);
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
  }
  .user-msg {
    background: var(--green);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .typing-dots { display: flex; gap: 5px; padding: 0.85rem 1.1rem; }
  .typing-dots span {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--text-dim);
    animation: dotBounce 1.2s infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes dotBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  .options-row { display: flex; flex-wrap: wrap; gap: 0.4rem; padding-left: 42px; }
  .opt-btn {
    padding: 0.45rem 1rem; border-radius: 20px; font-size: 0.82rem;
    font-weight: 500; background: white; color: var(--navy);
    border: 1px solid var(--border); cursor: pointer; transition: all 0.15s; font-family: inherit;
  }
  .opt-btn:hover { background: var(--navy); color: white; border-color: var(--navy); }
  .yes-btn { color: var(--green); border-color: var(--green); }
  .yes-btn:hover { background: var(--green); color: white; }
  .no-btn { color: var(--red); border-color: var(--red); }
  .no-btn:hover { background: var(--red); color: white; }

  .chat-full-footer {
    border-top: 1px solid var(--border);
    background: white;
    flex-shrink: 0;
  }
  .input-row { display: flex; gap: 0.5rem; padding: 0.75rem 1rem; align-items: center; }
  .input-row input {
    flex: 1; border: 1px solid var(--border); border-radius: 24px;
    padding: 0.65rem 1.15rem; font-size: 0.92rem; outline: none; font-family: inherit;
    background: var(--bg-surface);
  }
  .input-row input:focus { border-color: var(--navy); background: white; }
  .send {
    width: 42px; height: 42px; border-radius: 50%; background: var(--green);
    color: white; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .send:hover:not(:disabled) { background: var(--green-hover); }
  .send:disabled { opacity: 0.4; cursor: not-allowed; }
  .chat-ended { text-align: center; padding: 1rem; font-size: 0.88rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; }
  .powered { text-align: center; font-size: 0.7rem; color: var(--text-dim); padding: 0 0 0.6rem; }
  .powered strong { color: var(--navy); }

  @media (max-width: 768px) {
    .chat-full { max-width: 100%; }
    .start-features { gap: 1rem; }
  }
</style>
