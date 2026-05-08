# Will You Be My Valentine?

An interactive "will-you-be-my-valentine" meme. The **No** button morphs through 27 stages — splits in two, runs away, fakes a Yes, becomes draggable, turns into a slider, then a checkbox — until **Yes** is the only option left.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4
- Type-safe env via `@t3-oss/env-nextjs` + Zod
- Vitest + Testing Library
- Prettier, ESLint, Husky pre-commit hooks
- Docker multi-stage build

## Quickstart

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev              # next dev --turbopack
pnpm build            # next build --turbopack
pnpm start            # next start
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
pnpm test             # vitest
pnpm test:watch
pnpm test:coverage
pnpm test:ui
pnpm analyze          # ANALYZE=true next build
```

## Docker

```bash
docker build -t valentine-meme-web .
docker run -p 3000:3000 valentine-meme-web
```

## Docs

The `docs/` folder covers bundle optimization, code style, hooks, naming conventions, parallel routes, performance patterns, runtime selection, time utilities, and Docker setup.

## License

MIT
