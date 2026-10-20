import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * The rows the site expects to exist: one stats row to count into, one
 * integrations row, the owner, and the first project.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "site_stats" ("deploy_count", "nice_try_count", "updated_at", "created_at")
    SELECT 0, 0, now(), now() WHERE NOT EXISTS (SELECT 1 FROM "site_stats");

    INSERT INTO "integrations" ("updated_at", "created_at")
    SELECT now(), now() WHERE NOT EXISTS (SELECT 1 FROM "integrations");

    INSERT INTO "projects" ("name", "summary", "stack", "order", "updated_at", "created_at")
    SELECT
      'suttsc.com',
      'This. A command palette pretending to be an operating system.',
      'next.js · payload · react · 2026',
      1,
      now(),
      now()
    WHERE NOT EXISTS (SELECT 1 FROM "projects");
  `)

  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase()

  if (owner) {
    await db.execute(sql`
      INSERT INTO "users" ("email", "updated_at", "created_at")
      SELECT ${owner}, now(), now() WHERE NOT EXISTS (SELECT 1 FROM "users");
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "users";
    DELETE FROM "projects" WHERE "name" = 'suttsc.com';
    DELETE FROM "integrations";
    DELETE FROM "site_stats";
  `)
}
