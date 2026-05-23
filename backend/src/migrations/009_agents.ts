import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('agents', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('agent_code', 20).notNullable().unique();
    t.jsonb('assigned_verticals').defaultTo('[]');
    t.jsonb('assigned_countries').defaultTo('[]');
    t.decimal('commission_rate', 5, 2).defaultTo(0);
    t.integer('leads_submitted').notNullable().defaultTo(0);
    t.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('agent_code');
    t.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('agents');
}
