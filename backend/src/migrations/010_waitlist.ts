import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('waitlist', (t) => {
    t.increments('id').primary();
    t.string('email', 255).notNullable();
    t.string('vertical_slug', 100);
    t.string('country_code', 2);
    t.enum('user_type', ['lead', 'subscriber', 'agent']).notNullable().defaultTo('lead');
    t.string('source', 255);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('email');
    t.index('vertical_slug');
    t.index('country_code');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('waitlist');
}
