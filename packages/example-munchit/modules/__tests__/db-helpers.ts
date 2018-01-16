import { Context, buildContext } from "graphql-api";
import { Knex, destroyConnection } from "db";

export async function truncateAll(knexOrContext: Knex | Context) {
  const knex =
    knexOrContext instanceof Context ? knexOrContext.pg : knexOrContext;
  const result = await knex.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      AND table_type='BASE TABLE';
   `);
  const tables: string[] = result.rows.map((r: any) => r.table_name);
  const recordTables = tables.filter(t => !t.includes("knex"));

  const promises = recordTables.map(tableName => {
    try {
      // console.log(`Truncating ${tableName}`);
      return knex.raw(`TRUNCATE ${tableName} CASCADE`);
    } catch (e) {
      console.error(e);
    }
  });
  await Promise.all(promises);
}

export function withContext(
  fn: (context: Context) => void | any
): () => Promise<any> {
  return async () => {
    const context = buildContext();
    await truncateAll(context);
    try {
      await fn(context);
    } finally {
      await destroyConnection();
    }
  };
}
