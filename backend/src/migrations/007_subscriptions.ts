import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('subscriptions', (t) => {
    t.increments('id').primary();
    t.integer('subscriber_id').notNullable().references('id').inTable('subscribers').onDelete('CASCADE');
    t.integer('vertical_id').notNullable().references('id').inTable('verticals').onDelete('CASCADE');
    t.integer('country_id').notNullable().references('id').inTable('countries').onDelete('CASCADE');
    t.decimal('price_locked', 10, 2).notNullable();
    t.string('currency', 3).notNullable().defaultTo('USD');
    t.enum('status', ['active', 'cancelled', 'past_due']).notNullable().defaultTo('active');
    t.string('stripe_subscription_id', 255);
    t.timestamp('period_start');
    t.timestamp('period_end');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.unique(['subscriber_id', 'vertical_id', 'country_id']);
    t.index('subscriber_id');
    t.index('status');
    t.index('stripe_subscription_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('subscriptions');
}
