# Publishing `@doomscrollr/n8n-nodes-doomscrollr`

This repo is prepared for public npm publishing and n8n Creator Portal review.

## Before publishing

1. Create a public GitHub repo, recommended:
   `https://github.com/aaayersss/doomscrollr-n8n-nodes`
2. Push this local repo to `main`.
3. Add an npm automation token as GitHub Actions secret `NPM_TOKEN`.
4. Confirm the package name is available and the npm account has access to the `@doomscrollr` scope.
5. Run locally:

```bash
npm ci
npm run build
npm run lint
npm pack --dry-run
npm pack --dry-run
```

`npm run scan` checks the package currently published on npm, so run it after the first publish.

## Publish

Create a GitHub release/tag like `v0.1.0`. The publish workflow runs `npm publish --provenance --access public`. After npm propagation, run `npm run scan` and resolve any n8n scanner findings before Creator Portal submission.

## n8n Creator Portal

After npm publish, submit the package at:

https://creators.n8n.io/nodes

Suggested submission values:

- Package: `@doomscrollr/n8n-nodes-doomscrollr`
- Service: DOOMSCROLLR
- Category: Marketing / Communication / Automation
- Docs: `https://doomscrollr.com/docs/n8n.md`
- Repository: `https://github.com/aaayersss/doomscrollr-n8n-nodes`

The package should remain public, MIT licensed, English-only, and free of runtime dependencies for verification.
