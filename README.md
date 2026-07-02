# execv

Invite-only, whitelist-first referral and short-link management for paid SaaS workspaces.

## Product Shape

- Paid access can unlock a workspace immediately.
- Free requests can remain queued indefinitely unless a free tier is released.
- Affiliate credentials, tracking IDs, webhooks, and event mappings are tenant-owned workspace settings.
- Customers should never see or edit deployment environment variables.
- Provider and infrastructure names should stay out of product copy.

## Run locally

```bash
bun install
bun dev
```

The app can run in demo mode for local review.

## SaaS Configuration

Deployment secrets are operator-owned. Tenant affiliate setup is stored per
workspace through integration records, not through shared environment variables.
