/**
 * Apply the Better Auth schema to DATABASE_URL.
 *
 * The published `@better-auth/cli` trails the installed `better-auth` core
 * (1.4.x vs 1.7.x), so it can emit a schema that no longer matches the runtime.
 * This drives the migration from the version actually installed here, and reads
 * `lib/auth.ts` directly so the plan always reflects the real auth config
 * instead of a second copy that can drift.
 *
 *   pnpm db:migrate         apply the plan
 *   pnpm db:migrate --print show the SQL and exit without touching the database
 */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createJiti } from 'jiti'
import { getMigrations } from 'better-auth/db/migration'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const print = process.argv.includes('--print')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.')
  process.exit(1)
}

// `lib/auth.ts` is TypeScript and imports through the `@/*` tsconfig alias,
// neither of which plain Node resolves.
const jiti = createJiti(import.meta.url, { alias: { '@': root } })
const { auth } = await jiti.import(resolve(root, 'lib/auth.ts'))

const plan = await getMigrations(auth.options)

for (const { table } of plan.toBeCreated) console.log(`create table  ${table}`)
for (const { table, fields } of plan.toBeAdded) {
  console.log(`alter table   ${table} — add ${Object.keys(fields).join(', ')}`)
}
for (const { table, name } of plan.toBeAddedIndexes) console.log(`create index  ${name} on ${table}`)

for (const problem of plan.schemaProblems) console.warn(`schema problem: ${problem}`)
for (const change of plan.unsafeChanges) console.warn(`unsafe change:  ${change}`)

if (print) {
  console.log('\n--- SQL ---')
  console.log(await plan.compileMigrations())
  process.exit(0)
}

const pending =
  plan.toBeCreated.length + plan.toBeAdded.length + plan.toBeAddedIndexes.length
if (pending === 0) {
  console.log('Schema is already up to date.')
} else {
  await plan.runMigrations()
  console.log(`Applied ${pending} change(s).`)
}

// getMigrations opens its own Kysely connection over the pool in lib/db.
const { pool } = await jiti.import(resolve(root, 'lib/db/index.ts'))
await pool.end()
