# DOOMSCROLLR n8n Community Node

**Automate DOOMSCROLLR — the audience layer for AI agents — from n8n.**

Use this community node to publish posts, collect subscribers, create products and pages, connect RSS/Pinterest sources, retrieve embed code, and inspect audience engagement from n8n workflows.

DOOMSCROLLR turns automations and AI agents into owned-audience websites: Linktree, Shopify, Substack, Gumroad, ShopMy/LTK, Eventbrite/Luma, product drops, affiliate feeds, newsletters, and membership-style flows — **but owned**.

[Docs](https://doomscrollr.com/docs/n8n.md?utm_source=github&utm_medium=readme&utm_campaign=developer_funnel&utm_content=n8n_docs) · [Workflow templates](https://doomscrollr.com/n8n/workflows/?utm_source=github&utm_medium=readme&utm_campaign=developer_funnel&utm_content=n8n_templates) · [OpenAPI](https://doomscrollr.com/openapi.json?utm_source=github&utm_medium=readme&utm_campaign=developer_funnel&utm_content=n8n_openapi) · [Featured examples](https://doomscrollr.com/featured?utm_source=github&utm_medium=readme&utm_campaign=developer_funnel&utm_content=n8n_featured_examples)

```bash
npm install @doomscrollr/n8n-nodes-doomscrollr
```

## High-value workflows

- New RSS item → create DOOMSCROLLR post
- New Typeform/Tally/Airtable lead → add subscriber
- New Shopify order → add/update subscriber
- New Airtable product row → create DOOMSCROLLR product
- New DOOMSCROLLR post → notify Slack
- DOOMSCROLLR audience export → sync Google Sheets

## Installation

Install the community node package in n8n:

```bash
npm install @doomscrollr/n8n-nodes-doomscrollr
```

For self-hosted n8n, you can also install it from **Settings → Community nodes** using:

```text
@doomscrollr/n8n-nodes-doomscrollr
```

## Credentials

Create a **DOOMSCROLLR API** credential in n8n. If you need a key, create a free account at [doomscrollr.com](https://doomscrollr.com/register?free=1&utm_source=github&utm_medium=readme&utm_campaign=developer_funnel&utm_content=n8n_get_api_key).

Fields:

- **API Key** — create an API key in your DOOMSCROLLR dashboard.
- **Base URL** — defaults to `https://doomscrollr.com`.

The node authenticates with `Authorization: Bearer <api key>` and tests credentials against `/api/v1/profile`.

## Included operations

The first package version exposes one regular n8n node, **DOOMSCROLLR**, with resource/operation groups:

- **Profile** — get account/profile details.
- **Posts** — list posts, create image posts, create link posts.
- **Subscribers** — list subscribers, add subscribers.
- **Products** — list products, create products.
- **Pages** — list pages, create pages, create contact/link pages.
- **Pinterest** — connect a board, check status, search pins, search pins and create posts.
- **RSS** — connect a feed, check status.
- **Capture Widget** — get or update capture settings.
- **Embed Code** — retrieve subscriber-capture embed code.
- **Analytics** — retrieve top liked posts.

## Example workflows

### Publish RSS items into DOOMSCROLLR

1. Add an RSS trigger or schedule.
2. Add **DOOMSCROLLR → RSS → Connect Feed** for a source you want to monitor.
3. Use **DOOMSCROLLR → Post → Create Link Post** to publish selected items to your owned audience hub.

### Turn a lead form into subscribers

1. Capture submissions with Webhook, Typeform, Tally, Airtable, or another n8n trigger.
2. Map email/name fields into **DOOMSCROLLR → Subscriber → Add**.
3. Optionally follow with **Embed Code → Get Code** to include capture forms on external sites.

### Create a product from automation

1. Receive product data from a form, AI agent, or commerce workflow.
2. Add **DOOMSCROLLR → Product → Create**.
3. Provide title, description, price, type, and optional cover image URL.

## Development

```bash
npm ci
npm run build
npm run lint
npm pack --dry-run
```

After the package is published to npm, run:

```bash
npm run scan
```

The package is built with the official `n8n-node` CLI and uses n8n credentials for all user-provided secrets. It does not read environment variables or the filesystem at runtime.

## Publishing

Publishing should happen from GitHub Actions with npm provenance enabled. See `PUBLISHING.md`.

## License

MIT
