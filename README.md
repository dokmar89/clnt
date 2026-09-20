# PassProve - customer operations portal

A Next.js/Supabase customer-portal variant covering company accounts, shops, billing views and support workflows.

**Status:** Legacy/parallel PassProve implementation retained for reference; not presented as the canonical production release.

## Scope

- Account and company administration interfaces.
- Shop management, API-key UI and activity views.
- Support tickets, knowledge-base pages and wallet/billing components.
- Authentication actions and registration-approval screens.

## Technology

Next.js, React, TypeScript, Tailwind CSS, Supabase, Nodemailer.

## Architecture and source map

- `app/` — portal and authentication routes
- `components/` — account, shop, billing and support UI
- `lib/actions/` — server action modules
- `lib/supabase/` — client/server database helpers

## Local development

Requires Node.js and npm. From the repository root:

```sh
npm install
npm run dev
```

Build command declared by this checkout: `npm run build`.

These are the repository scripts, not a claim of a passing build. Dependency installation, build and live integrations were not executed during the documentation review.

## Configuration and limitations

Review Supabase policies, authentication and server actions before using real customer records. Financial screens do not establish an audited payment system. Multiple Next.js configuration files and mixed route layouts require validation before consolidation.

## Portfolio relevance

A reference for customer-support tooling and the separation between operational UI and service/data access.

## Documentation next steps

Capture screenshots using synthetic data, document a reproducible test run, and record which integrations have been verified. Keep credentials and deployment-specific configuration outside version control.
