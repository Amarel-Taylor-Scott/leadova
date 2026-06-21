import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('verticals', (t) => {
    t.increments('id').primary();
    t.string('slug', 100).notNullable().unique();
    t.string('name', 255).notNullable();
    t.text('description');
    t.string('icon', 50);
    t.jsonb('form_fields').defaultTo('[]');
    t.jsonb('filter_fields').defaultTo('[]');
    t.enum('status', ['active', 'coming_soon', 'disabled']).notNullable().defaultTo('active');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('slug');
    t.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('verticals');
}
