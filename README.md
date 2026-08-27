# Hansttoo

Conversion-focused website for **Hans | NYC Tattoo Artist** (`@hansttoo`), an independent resident artist taking appointments at Gara Art Studio, 240 W 40th St, New York, NY 10018.

## Local development

Requirements: Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm run lint
npm run test
npm run build
```

## Consultation form configuration

Copy `.env.example` to `.env.local` and add only the public Supabase project URL and public publishable/anon key for this repository’s approved project. Never put a `service_role` or secret key in a `VITE_` variable; Vite exposes these values to browsers.

The form fails visibly when Supabase is not configured. It does not pretend a lead was delivered and does not store consultation data in local storage.

The reviewed SQL in `supabase_schema.sql` is not applied automatically. Hans must review and apply it through the official Supabase interface before production use. It limits public visitors to creating pending inquiries and uploading private reference images. It removes all legacy anonymous read/update/delete access.

## Secure admin panel

`/admin` is a private lead-management panel. It uses Supabase Auth plus Row Level Security; the removed visual website editor and its browser-stored passcode are not used.

To activate the panel:

1. Review and run `supabase_schema.sql` in this repository's approved Supabase project.
2. Create Hans's administrator user through **Supabase Dashboard → Authentication → Users**. Hans should enter or reset the password himself in the official interface.
3. Copy that user's UUID and add it through the SQL editor:

   ```sql
   insert into public.admin_users (user_id)
   values ('AUTH_USER_UUID')
   on conflict (user_id) do nothing;
   ```

The frontend uses only the public publishable/anon key. It never needs a `service_role` key. RLS allows the approved administrator to read inquiries, open short-lived links to private reference images, and update status or private artist notes. The panel intentionally does not delete leads or edit the public website.

## Conversion measurement

See `docs/launch-checklist.md` for the exact Google and Meta identifiers required and the pre-launch test procedure.

See `docs/paid-ads-brief.md` for the approved advertiser identity, no-location-asset Google Search setup, initial keyword/negative-keyword themes, Meta structure, and lead-quality measurement plan. The site attaches only allow-listed campaign attribution to submitted consultations so the secure admin panel can show which source produced each lead.

## Deployment

`npm run build` creates the static client in `dist/`, including route-specific HTML for English, Spanish, privacy, thank-you, and admin routes. The production project is deployed from the `main` branch to `https://hansttoo.vercel.app`; builds and verification scripts do not deploy by themselves.

## Portfolio assets

The Selected Work gallery uses only verified originals supplied by Hans. Optimized WebP copies live in `public/portfolio`; the high-resolution source photos remain unchanged outside the deployed asset folder.

To regenerate the web copies after replacing or adding approved originals, install Pillow and run:

```bash
python scripts/optimize_portfolio_images.py --source-root C:/path/to/hansttoo
```

The current selection reduces roughly 206.5 MB of source photography to about 1.3 MB while stripping camera metadata and preserving enough resolution for modern high-density screens.
