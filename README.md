# Valentine Meme Web

A Valentine web app whose No button changes through 27 stages before acceptance. Astro 7 provides the static pages; a React 19 island handles interaction.

Live: https://valentine-meme.vercel.app

## Development

Use Node 26.12.1 and pnpm 12.15.0. Node 24.22.1 remains supported for Vercel hosting.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
pnpm preview
```

`PUBLIC_APP_URL` sets the canonical/OG origin and defaults to `http://localhost:4321`. TypeScript 7 runs through an explicit checker path; TypeScript 6 remains for Astro and typed ESLint APIs.

## Docker

```sh
docker build -t valentine-meme-web .
docker run -p 8080:80 valentine-meme-web
```

The Node 26 build emits static files served by nginx. An isolated browser against the image verifies hydration, keyboard refusal, acceptance, attempt count and reload reset without page errors. Font CSS was supplied locally during verification; no provider calls were made.

## Upgrade verification

Node 24 and 26 checks/builds pass. Full and production dependency audits report zero advisories after the bounded fast-uri security floor. CI now checks real lint, formatting, types and builds on both runtimes. The unused test scaffold and its dependencies were removed because no test cases existed; no unit-test coverage is claimed.

Existing formatting debt was repaired in a separate mechanical commit. Verification confirmed the 90 Markdown documents preserve instructions, metadata and links, checked 493 fenced examples, and confirmed the application TSX AST is unchanged. No formatting gate was disabled. Obsolete ignored formatter options were removed.

The existing release-age policy retains prettier-plugin-packagejson 3.0.2 until 3.0.3 is eligible. Existing lint warnings remain. Deployment stays manual, and no processing speedup was measured.
