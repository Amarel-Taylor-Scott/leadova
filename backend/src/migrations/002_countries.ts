import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('countries', (t) => {
    t.increments('id').primary();
    t.string('code', 2).notNullable().unique();
    t.string('name', 255).notNullable();
    t.string('flag_emoji', 10);
    t.string('currency_code', 3).notNullable();
    t.string('currency_symbol', 5).notNullable();
    t.string('privacy_jurisdiction', 100);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('code');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('countries');
}
