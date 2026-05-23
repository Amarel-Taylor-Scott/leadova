import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('subscribers', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('company_name', 255);
    t.enum('tier', ['starter', 'growth', 'enterprise']).notNullable().defaultTo('starter');
    t.timestamp('trial_ends_at');
    t.string('stripe_customer_id', 255);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('tier');
    t.index('stripe_customer_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('subscribers');
}
