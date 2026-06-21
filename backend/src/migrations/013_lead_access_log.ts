import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('lead_access_log', (t) => {
    t.increments('id').primary();
    t.integer('lead_id').notNullable().references('id').inTable('leads').onDelete('CASCADE');
    t.integer('subscriber_id').notNullable().references('id').inTable('subscribers').onDelete('CASCADE');
    t.enum('access_type', ['reveal', 'contact', 'export']).notNullable();
    t.string('ip_address', 45);
    t.timestamp('accessed_at').notNullable().defaultTo(knex.fn.now());

    t.index('lead_id');
    t.index('subscriber_id');
    t.index('access_type');
    t.index('accessed_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('lead_access_log');
}
