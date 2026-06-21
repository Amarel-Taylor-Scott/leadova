<script>
  import { onMount, tick } from 'svelte';

  export let verticalSlug = '';
  export let countryCode = '';

  let isOpen = false;
  let sessionId = '';
  let messages = [];
  let inputValue = '';
  let status = 'idle';
  let typing = false;
  let currentField = null;
  let progress = null;
  let chatBody;

  async function scrollToBottom() {
    await tick();
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }

  async function startSession() {
    if (!verticalSlug || !countryCode) return;
    typing = true;
    try {
      const res = await fetch('/api/v1/chatbot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical_slug: verticalSlug,
          country_code: countryCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sessionId = data.data.session_id;
        status = data.data.status;
        currentField = data.data.field || null;
        progress = data.data.progress || null;
        messages = [{ role: 'bot', text: data.data.message }];
      } else {
        messages = [{ role: 'bot', text: data.error?.message || 'Failed to start chat.' }];
      }
    } catch (err) {
      messages = [{ role: 'bot', text: 'Connection error. Please try again.' }];
    }
    typing = false;
    scrollToBottom();
  }

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen && messages.length === 0 && verticalSlug && countryCode) {
      startSession();
    }
  }

  async function sendMessage() {
    const text = inputValue.trim();
    if (!text || !sessionId || typing) return;
    if (status === 'complete' || status === 'expired') return;

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
        status = data.data.status;
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
</script>

<!-- Floating bubble -->
{#if !isOpen}
  <button class="chat-bubble" on:click={toggleChat} aria-label="Open chat">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>
{/if}

<!-- Chat panel -->
{#if isOpen}
  <div class="chat-panel">
    <div class="chat-header">
      <div class="chat-header-info">
        <div class="chat-avatar">L</div>
        <div>
          <div class="chat-title">Leadova Assistant</div>
          {#if progress}
            <div class="chat-progress">Question {progress.current + 1} of {progress.total}</div>
          {:else}
            <div class="chat-progress">Online</div>
          {/if}
        </div>
      </div>
      <button class="chat-close" on:click={toggleChat} aria-label="Close chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="chat-body" bind:this={chatBody}>
      {#each messages as msg}
        <div class="chat-msg" class:bot={msg.role === 'bot'} class:user={msg.role === 'user'}>
          {#if msg.role === 'bot'}
            <div class="msg-avatar">L</div>
          {/if}
          <div class="msg-bubble" class:bot-bubble={msg.role === 'bot'} class:user-bubble={msg.role === 'user'}>
            {#each msg.text.split('\n') as line}
              {#if line.trim()}
                <p>{line}</p>
              {/if}
            {/each}
          </div>
        </div>
      {/each}

      {#if typing}
        <div class="chat-msg bot">
          <div class="msg-avatar">L</div>
          <div class="msg-bubble bot-bubble typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      {/if}

      <!-- Quick options for select fields -->
      {#if currentField && currentField.options && currentField.options.length > 0 && status === 'collecting'}
        <div class="quick-options">
          {#each currentField.options as opt}
            <button class="quick-opt" on:click={() => selectOption(opt)}>{opt}</button>
          {/each}
        </div>
      {/if}

      {#if status === 'consent'}
        <div class="quick-options">
          <button class="quick-opt consent-yes" on:click={() => selectOption('yes')}>Yes, I agree</button>
          <button class="quick-opt consent-no" on:click={() => selectOption('no')}>No, cancel</button>
        </div>
      {/if}
    </div>

    <div class="chat-footer">
      {#if status === 'complete'}
        <div class="chat-done">Chat complete. Thank you!</div>
      {:else if status === 'expired'}
        <div class="chat-done">Session ended.</div>
      {:else}
        <div class="chat-input-row">
          <input
            type="text"
            bind:value={inputValue}
            on:keydown={handleKeydown}
            placeholder={currentField ? currentField.label + '...' : 'Type a message...'}
            disabled={typing}
          />
          <button class="send-btn" on:click={sendMessage} disabled={!inputValue.trim() || typing} aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      {/if}
      <div class="chat-powered">Powered by <strong>Leadova</strong></div>
    </div>
  </div>
{/if}

<style>
  .chat-bubble {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--green, #22c55e);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(34, 197, 94, 0.35);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .chat-bubble:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 28px rgba(34, 197, 94, 0.45);
  }

  .chat-panel {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 10000;
    width: 380px;
    max-width: calc(100vw - 32px);
    height: 540px;
    max-height: calc(100vh - 48px);
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .chat-header {
    background: var(--navy, #1F3864);
    color: white;
    padding: 0.85rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .chat-header-info { display: flex; align-items: center; gap: 0.65rem; }
  .chat-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--green, #22c55e);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    flex-shrink: 0;
  }
  .chat-title { font-weight: 600; font-size: 0.92rem; }
  .chat-progress { font-size: 0.72rem; opacity: 0.7; }
  .chat-close {
    background: none;
    border: none;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    padding: 4px;
  }
  .chat-close:hover { color: white; }

  .chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: #f8f9fc;
  }

  .chat-msg {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }
  .chat-msg.user { flex-direction: row-reverse; }

  .msg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--navy, #1F3864);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.7rem;
    flex-shrink: 0;
  }

  .msg-bubble {
    max-width: 80%;
    padding: 0.6rem 0.85rem;
    border-radius: 14px;
    font-size: 0.88rem;
    line-height: 1.5;
  }
  .msg-bubble p { margin: 0 0 0.35rem; }
  .msg-bubble p:last-child { margin-bottom: 0; }
  .bot-bubble {
    background: white;
    color: var(--text, #1a1a2e);
    border: 1px solid var(--border, #e2e6ef);
    border-bottom-left-radius: 4px;
  }
  .user-bubble {
    background: var(--green, #22c55e);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 0.75rem 1rem;
  }
  .typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-dim, #8890a5);
    animation: typingBounce 1.2s infinite;
  }
  .typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  .quick-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0 0.5rem;
  }
  .quick-opt {
    padding: 0.4rem 0.85rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    background: white;
    color: var(--navy, #1F3864);
    border: 1px solid var(--border, #e2e6ef);
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .quick-opt:hover {
    background: var(--navy, #1F3864);
    color: white;
    border-color: var(--navy, #1F3864);
  }
  .consent-yes {
    background: rgba(34,197,94,0.1);
    color: var(--green, #22c55e);
    border-color: var(--green, #22c55e);
  }
  .consent-yes:hover {
    background: var(--green, #22c55e);
    color: white;
  }
  .consent-no {
    background: rgba(239,68,68,0.08);
    color: var(--red, #ef4444);
    border-color: var(--red, #ef4444);
  }
  .consent-no:hover {
    background: var(--red, #ef4444);
    color: white;
  }

  .chat-footer {
    border-top: 1px solid var(--border, #e2e6ef);
    background: white;
    flex-shrink: 0;
  }
  .chat-input-row {
    display: flex;
    gap: 0.5rem;
    padding: 0.65rem 0.75rem;
    align-items: center;
  }
  .chat-input-row input {
    flex: 1;
    border: 1px solid var(--border, #e2e6ef);
    border-radius: 20px;
    padding: 0.55rem 1rem;
    font-size: 0.88rem;
    outline: none;
    font-family: inherit;
    background: var(--bg-surface, #f1f3f8);
  }
  .chat-input-row input:focus {
    border-color: var(--navy, #1F3864);
    background: white;
  }
  .send-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--green, #22c55e);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s;
  }
  .send-btn:hover:not(:disabled) { background: var(--green-hover, #16a34a); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .chat-done {
    text-align: center;
    padding: 0.85rem;
    font-size: 0.85rem;
    color: var(--text-muted, #5a6178);
    font-weight: 500;
  }
  .chat-powered {
    text-align: center;
    font-size: 0.68rem;
    color: var(--text-dim, #8890a5);
    padding: 0 0 0.5rem;
  }
  .chat-powered strong { color: var(--navy, #1F3864); }

  @media (max-width: 440px) {
    .chat-panel {
      width: calc(100vw - 16px);
      right: 8px;
      bottom: 8px;
      height: calc(100vh - 80px);
    }
    .chat-bubble { bottom: 16px; right: 16px; width: 56px; height: 56px; }
  }
</style>
