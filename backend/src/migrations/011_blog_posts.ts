import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('blog_posts', (t) => {
    t.increments('id').primary();
    t.string('slug', 255).notNullable().unique();
    t.string('title', 500).notNullable();
    t.text('content').notNullable();
    t.text('excerpt');
    t.string('author', 255);
    t.timestamp('published_at');
    t.enum('status', ['draft', 'published']).notNullable().defaultTo('draft');
    t.string('seo_title', 255);
    t.text('seo_description');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('slug');
    t.index('status');
    t.index('published_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('blog_posts');
}
