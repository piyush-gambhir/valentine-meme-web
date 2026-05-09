# valentine-meme-web

A meme web app: "Will You Be My Valentine?" — the **No** button morphs through 27 stages (splits, runs, fakes, becomes draggable, slider, checkbox) until **Yes** is the only option.

Live: https://valentine-meme.vercel.app

## Stack

- **Astro 5** (static output) — page shell
- **React 19** as an Astro island for the morphing button (`client:load`)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **TypeScript** strict mode
- **pnpm** for package management
- **Vercel adapter** (`@astrojs/vercel`) for deploy
- **Vitest** + Testing Library for tests
- **`astro:env`** for type-safe env vars

## Structure

```
valentine-meme-web/
├── src/
│   ├── components/
│   │   └── MorphButton.tsx     # The 27-stage React island
│   ├── layouts/
│   │   └── Layout.astro        # Static HTML shell, fonts, meta
│   ├── pages/
│   │   ├── index.astro         # Static page mounting <MorphButton client:load />
│   │   └── 404.astro           # Not-found page
│   └── styles/
│       └── globals.css         # Tailwind + custom animations
├── public/                     # favicon and static assets
├── astro.config.mjs
├── Dockerfile                  # Multi-stage; static dist served by nginx
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## Scripts

```bash
pnpm dev         # astro dev
pnpm build       # astro build  (outputs ./dist)
pnpm preview     # astro preview
pnpm test        # vitest run
pnpm typecheck   # astro check && tsc --noEmit
pnpm lint        # eslint
pnpm format      # prettier --write
```

## Environment

Defined via `astro:env` in `astro.config.mjs`:

| Var              | Type   | Default                 | Notes                           |
| ---------------- | ------ | ----------------------- | ------------------------------- |
| `PUBLIC_APP_URL` | string | `http://localhost:4321` | Used for OG metadata canonical. |

## Docker

```bash
docker build -t valentine-meme-web .
docker run -p 8080:80 valentine-meme-web
```

The image builds the static `dist/` and serves it via nginx.

## Why Astro?

Only one piece of the page needs to be interactive — the morph button — and Astro lets the rest ship as zero-JS static HTML. The React island is hydrated with `client:load` so all 27 stages run identically to the previous Next.js implementation.
