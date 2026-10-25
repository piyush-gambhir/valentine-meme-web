# Docker

The image builds the Astro static site with Node 26.12.1 and pnpm 12.15.0, then serves the generated files with nginx. Node and pnpm are build tools and are absent from the nginx runtime stage.

## Build and run

```sh
docker build -t valentine-meme-web:local .
docker run --rm -p 8080:80 valentine-meme-web:local
```

Open http://localhost:8080. The build installs the pinned pnpm explicitly and uses the frozen lockfile. Local dependency/build directories and environment credential files are excluded from the build context.

The current Docker path serves static output. It does not run a Next.js server or support server-side API routes. The configured `PUBLIC_APP_URL` controls canonical and OG metadata; set it for the intended origin when preparing a hosted build.
