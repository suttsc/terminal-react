# suttsc.com

A personal site built as a small operating system for one person. The homepage is a
Raycast-style command palette; commands answer inline, show a numbered menu, open a
draggable window, or navigate to a real page. A taskbar carries the site name, a back
button, minimised windows and the owner's local time. One user, ever.

Stack: Next.js (App Router, TypeScript strict) with Payload CMS inside it, Neon Postgres,
Auth.js (Google), Tailwind v4, Vitest, Playwright. Hosted on Vercel Hobby.
Reference implementation: the archived Laravel repo (suttsc/suttsc.com). Port behaviour and copy from it verbatim.
Spec: [suttsc.com — Next.js + Payload rebuild spec](https://claude.ai/artifact/5L97Ui6YKfEKShyQhMifvV).

## Who writes the code

suttsc does. When asked how something should work, give the design and the reasoning
first. Write code when asked, when fixing something specific, or when a snippet is the
clearest way to make a point. Don't scaffold whole features unprompted.

## The command registry

- One file per command in `src/terminal/commands/`, default-exporting `defineCommand()`
  or `defineOwnerCommand()`, and listed in `commands/index.ts`
- `handle(ctx)` returns exactly one of `inline()`, `menu()`, `window()`, `navigate()`.
  Never a bare string or ad-hoc object
- Every command has a test. The registry is the contract
- Commands failing `authorized(ctx)` are stripped from the manifest on the server and
  404 exactly like a missing command. Never filter in React
- Follow the shape of the existing commands exactly

## Hard rules

- Never call a third-party API before the response is sent. Cron routes pull into local
  collections; link titles are fetched in `after()`. If something seems to need a
  synchronous external call, stop and say so
- Never persist anything identifying about a visitor: no emails, names, avatars, IPs or
  fingerprints in any collection, log, cookie you read later, or analytics. The only
  thing kept is `site-stats.niceTryCount`. Refuse features that need visitor data
- Every command that shows content has a real server-rendered route
- Owner auth: Google only, `isOwnerEmail()` exact timing-safe match plus
  `email_verified`. Never a domain check or substring. The `users` collection holds one
  row; the local strategy stays disabled
- The Payload admin at `/admin` is owner-only and `noindex`. The palette owner commands stay
- Free tier: crons at most daily, no queues, no Blob. Flag anything that needs a paid plan

## Conventions

- TypeScript strict, no `any` outside the window registry's `ComponentType<any>`
- Server components by default; `'use client'` only in `src/shell`, `src/windows` and tool UIs
- Route handlers validate with zod; services hold logic; components render outputs only
- Integrations behind an interface with a fake used in tests
- Tailwind for all styling; colours only via theme tokens in `app.css`
- Palette is a real combobox; focus trapped in windows and returned on close;
  `motion-safe:` on every animation
- Resist building a window manager: drag, focus, close, minimise. Nothing else
- British English in copy, comments and commit messages
- Commits start with `fix: `, `feat: `, `chore: `, `build: ` or `docs: `
- Commit straight to `main` while the project is young; no feature branches

## Tone of user-facing copy

Deadpan. The site behaves like a real OS that has quietly decided you are suttsc. One dry
line beats three. When writing copy, pitch two or three options rather than committing to one.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm check` runs typecheck, lint, format check and Vitest; `pnpm test:e2e` runs Playwright against `next start`
- `pnpm migrate:create <name>` after any collection or global change, then commit the migration
- `pnpm generate:types` and `pnpm generate:importmap` after changing Payload config or admin components
