import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('leads', (t) => {
    t.increments('id').primary();
    t.integer('vertical_id').notNullable().references('id').inTable('verticals').onDelete('CASCADE');
    t.integer('country_id').notNullable().references('id').inTable('countries').onDelete('CASCADE');
    t.jsonb('custom_fields').defaultTo('{}');
    t.enum('consent_method', ['web_form', 'agent_verbal', 'agent_signature', 'chatbot']).notNullable();
    t.timestamp('consent_timestamp').notNullable();
    t.text('consent_text_shown').notNullable();
    t.timestamp('consent_withdrawn_at');
    t.enum('source', ['web', 'agent', 'chatbot', 'api', 'csv']).notNullable();
    t.integer('agent_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('ip_address', 45);
    t.string('user_agent', 500);
    t.enum('status', ['new', 'verified', 'contacted', 'converted', 'rejected', 'withdrawn']).notNullable().defaultTo('new');
    t.timestamp('deleted_at');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('vertical_id');
    t.index('country_id');
    t.index('status');
    t.index('source');
    t.index('agent_id');
    t.index('created_at');
    t.index('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('leads');
}
