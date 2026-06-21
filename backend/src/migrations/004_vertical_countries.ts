import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('vertical_countries', (t) => {
    t.increments('id').primary();
    t.integer('vertical_id').notNullable().references('id').inTable('verticals').onDelete('CASCADE');
    t.integer('country_id').notNullable().references('id').inTable('countries').onDelete('CASCADE');
    t.enum('status', ['active', 'coming_soon']).notNullable().defaultTo('coming_soon');
    t.decimal('price', 10, 2);
    t.string('currency_code', 3);
    t.jsonb('landing_page_config').defaultTo('{}');
    t.string('seo_title', 255);
    t.text('seo_description');
    t.jsonb('form_fields_override').defaultTo('null');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.unique(['vertical_id', 'country_id']);
    t.index('vertical_id');
    t.index('country_id');
    t.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vertical_countries');
}
