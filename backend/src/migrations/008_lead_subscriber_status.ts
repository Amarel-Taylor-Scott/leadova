import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('lead_subscriber_status', (t) => {
    t.increments('id').primary();
    t.integer('lead_id').notNullable().references('id').inTable('leads').onDelete('CASCADE');
    t.integer('subscriber_id').notNullable().references('id').inTable('subscribers').onDelete('CASCADE');
    t.enum('status', ['new', 'contacted', 'converted', 'rejected']).notNullable().defaultTo('new');
    t.text('notes');
    t.timestamp('contacted_at');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.unique(['lead_id', 'subscriber_id']);
    t.index('lead_id');
    t.index('subscriber_id');
    t.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('lead_subscriber_status');
}
