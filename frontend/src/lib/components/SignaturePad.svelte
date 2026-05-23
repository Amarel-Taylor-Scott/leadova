<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let canvas;
  let ctx;
  let isDrawing = false;
  let hasDrawn = false;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 160 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '160px';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  onMount(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', resizeCanvas);
    }
  });

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastX = pos.x;
    lastY = pos.y;
    hasDrawn = true;
  }

  function endDraw(e) {
    if (e) e.preventDefault();
    isDrawing = false;
    ctx.beginPath();
  }

  function clear() {
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    hasDrawn = false;
    dispatch('clear');
  }

  function submit() {
    if (!hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    dispatch('submit', { signature: dataUrl });
  }

  export function getSignature() {
    if (!hasDrawn) return null;
    return canvas.toDataURL('image/png');
  }

  export function isEmpty() {
    return !hasDrawn;
  }
</script>

<div class="sig-pad">
  <div class="sig-label">Sign below</div>
  <div class="sig-canvas-wrap">
    <canvas
      bind:this={canvas}
      on:mousedown={startDraw}
      on:mousemove={draw}
      on:mouseup={endDraw}
      on:mouseleave={endDraw}
      on:touchstart={startDraw}
      on:touchmove={draw}
      on:touchend={endDraw}
    ></canvas>
    <div class="sig-line"></div>
  </div>
  <div class="sig-actions">
    <button type="button" class="sig-btn sig-clear" on:click={clear}>Clear</button>
    <button type="button" class="sig-btn sig-submit" on:click={submit} disabled={!hasDrawn}>
      Confirm Signature
    </button>
  </div>
</div>

<style>
  .sig-pad {
    width: 100%;
  }
  .sig-label {
    font-size: 0.82rem;
    color: var(--text-muted, #5a6178);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  .sig-canvas-wrap {
    position: relative;
    border: 2px solid var(--border, #e2e6ef);
    border-radius: 8px;
    background: #fff;
    overflow: hidden;
    touch-action: none;
    cursor: crosshair;
  }
  .sig-canvas-wrap canvas {
    display: block;
    width: 100%;
  }
  .sig-line {
    position: absolute;
    bottom: 40px;
    left: 16px;
    right: 16px;
    height: 1px;
    background: #d1d5db;
    pointer-events: none;
  }
  .sig-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
  .sig-btn {
    padding: 0.65rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.88rem;
    font-family: inherit;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .sig-clear {
    background: var(--bg-surface, #f1f3f8);
    color: var(--text-muted, #5a6178);
    border: 1px solid var(--border, #e2e6ef);
  }
  .sig-clear:hover {
    border-color: var(--red, #ef4444);
    color: var(--red, #ef4444);
  }
  .sig-submit {
    flex: 1;
    background: var(--navy, #1F3864);
    color: white;
  }
  .sig-submit:hover:not(:disabled) {
    background: var(--navy-light, #2a4a7a);
  }
  .sig-submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
