# suttsc.com

A command palette pretending to be an operating system. One Next.js app with Payload
inside it, on Vercel Hobby with Neon Postgres. A rebuild of the Laravel + Inertia site:
same behaviour, copy and URLs, different machinery. See `CLAUDE.md` for the rules.

## Running it locally

```sh
cp .env.example .env        # fill in the secrets; a local Postgres is fine
pnpm install
pnpm migrate                # creates the tables and seeds the stats row, owner and first project
pnpm dev
```

`OWNER_EMAIL` must be set when the seed migration runs, or there is no owner row and the
admin can't be reached. Sign-in needs a Google OAuth client with
`http://localhost:3000/api/auth/callback/google` as a redirect URI.

## Checks

```sh
pnpm check                  # tsc, eslint, prettier, vitest
pnpm build && pnpm test:e2e # Playwright against next start (needs DATABASE_URI)
```

## Where things live

| Path                           | What                                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| `src/terminal/`                | The command registry, outputs and one file per command             |
| `src/shell/`, `src/windows/`   | The palette, taskbar, window frame and window bodies (client)      |
| `src/app/(frontend)/`          | Pages, `POST /terminal`, `/api/links`, Auth.js and cron routes     |
| `src/app/(payload)/`           | The Payload admin at `/admin` and its API at `/payload-api`        |
| `src/collections/`, `globals/` | Payload config                                                     |
| `src/repositories/`            | Payload-backed data access plus in-memory fakes for tests          |
| `src/services/`                | Running log, link titles, Strava sync and other logic              |
| `src/integrations/`            | Strava and page-title clients, each with a fake                    |
| `src/auth/`                    | Auth.js, the owner email check, the flash cookie, Payload strategy |
| `scripts/`                     | `record-deploy.ts` (build step) and the one-off Laravel import     |

## Deploying

The Vercel build command is `pnpm build:vercel` (set in `vercel.json`):
`payload migrate && next build && tsx scripts/record-deploy.ts`.

Before the first production deploy:

- [ ] Repo under the personal GitHub account (Hobby can't connect to organisation repos)
- [ ] Vercel project created, framework Next.js, Neon added from the Marketplace (its `DATABASE_URL` is used; no `DATABASE_URI` needed)
- [ ] Every variable in `.env.example` set for Production (and Preview if previews should sign in)
- [ ] Google console redirect URIs: `https://suttsc.com/api/auth/callback/google` and the `*.vercel.app` production URL
- [ ] `CRON_SECRET` set (the crons in `vercel.json` are daily)
- [ ] Optional: `SITE_URL` and `CRON_SECRET` as GitHub secrets for the hourly Strava workflow
- [ ] Data migrated: `LARAVEL_DATABASE_URL=… DATABASE_URI=… pnpm tsx scripts/migrate-from-laravel.ts`
- [ ] Commercial-use question answered: Hobby is non-commercial and `/hire` advertises availability
- [ ] Cloudflare DNS pointed at Vercel (DNS only); leave CloudFront running for a week as the rollback
- [ ] A required CI check on `main` before Vercel deploys it
