<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let post = null;
  let loading = true;
  let error = '';

  $: slug = $page.params.slug;

  onMount(async () => {
    try {
      const res = await fetch(`/api/v1/blog/${slug}`);
      const data = await res.json();
      if (data.success) post = data.data.post;
      else error = 'Post not found';
    } catch (err) {
      error = 'Failed to load post';
    }
    loading = false;
  });
</script>

<svelte:head>
  {#if post}
    <title>{post.seo_title || post.title} | Leadova Blog</title>
    <meta name="description" content={post.seo_description || post.excerpt || ''} />
  {:else}
    <title>Blog | Leadova</title>
  {/if}
</svelte:head>

<div class="container page">
  {#if loading}
    <div class="loading">Loading...</div>
  {:else if error || !post}
    <div class="empty card">
      <h2>Post not found</h2>
      <a href="/blog" class="btn btn-secondary" style="margin-top:1rem">Back to Blog</a>
    </div>
  {:else}
    <a href="/blog" class="back-link">Back to Blog</a>
    <article class="post">
      <h1>{post.title}</h1>
      <div class="post-meta">
        {#if post.author}<span>{post.author}</span>{/if}
        {#if post.published_at}<span>{new Date(post.published_at).toLocaleDateString()}</span>{/if}
      </div>
      <div class="post-content">{@html post.content}</div>
    </article>
  {/if}
</div>

<style>
  .page { padding: 3rem 0; max-width: 760px; margin: 0 auto; }
  .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
  .empty { text-align: center; padding: 3rem; }
  .back-link { font-size: 0.9rem; color: var(--text-muted); display: inline-block; margin-bottom: 1.5rem; }
  .back-link:hover { color: var(--navy); }
  .post h1 { font-size: 2rem; margin-bottom: 0.75rem; }
  .post-meta { display: flex; gap: 1rem; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
  .post-content { font-size: 1rem; line-height: 1.8; color: var(--text); }
</style>
