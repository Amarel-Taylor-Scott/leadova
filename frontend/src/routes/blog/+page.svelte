<script>
  import { onMount } from 'svelte';

  let posts = [];
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/v1/blog');
      const data = await res.json();
      if (data.success) posts = data.data.posts || [];
    } catch (err) {
      console.error('Failed to load blog posts', err);
    }
    loading = false;
  });
</script>

<svelte:head>
  <title>Blog | Leadova</title>
  <meta name="description" content="Insights on lead generation, compliance, and growing your business across verticals and countries." />
</svelte:head>

<section class="hero-sm">
  <div class="container">
    <h1>Blog</h1>
    <p>Insights on lead generation, consent compliance, and multi-vertical growth.</p>
  </div>
</section>

<div class="container page">
  {#if loading}
    <div class="loading">Loading posts...</div>
  {:else if posts.length === 0}
    <div class="empty card">
      <h3>No posts yet</h3>
      <p>Blog content is coming soon. Check back for insights on lead generation and compliance.</p>
    </div>
  {:else}
    <div class="posts-grid">
      {#each posts as post}
        <a href="/blog/{post.slug}" class="post-card card">
          <h2>{post.title}</h2>
          {#if post.excerpt}
            <p class="excerpt">{post.excerpt}</p>
          {/if}
          <div class="post-meta">
            {#if post.author}<span>{post.author}</span>{/if}
            <span>{new Date(post.published_at).toLocaleDateString()}</span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .hero-sm { background: var(--navy); color: white; padding: 3rem 0; text-align: center; }
  .hero-sm h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
  .hero-sm p { color: rgba(255,255,255,0.7); }
  .page { padding: 3rem 0; }
  .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
  .empty { text-align: center; padding: 3rem; }
  .posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
  .post-card { text-decoration: none; color: var(--text); transition: transform 0.15s; }
  .post-card:hover { transform: translateY(-2px); color: var(--text); }
  .post-card h2 { font-size: 1.15rem; margin-bottom: 0.5rem; }
  .excerpt { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.75rem; }
  .post-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-dim); }
</style>
