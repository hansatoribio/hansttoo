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

The reviewed SQL in `supabase_schema.sql` is not applied automatically. Hans must review and apply it through the official Supabase interface before production use. It limits anonymous users to creating pending inquiries and uploading private reference images. It removes the legacy anonymous read/update/delete policies. Applying it can disable the old browser-based admin dashboard; review leads through the Supabase Dashboard until a separately authenticated admin backend exists.

## Conversion measurement

See `docs/launch-checklist.md` for the exact Google and Meta identifiers required and the pre-launch test procedure.

## Deployment

`npm run build` creates the static client in `dist/`. `server.js` serves that directory and falls back to `index.html` for `/privacy` and `/thank-you`. `discloud.config` is the only deployment configuration checked into this repository. No deployment is performed by the build or verification scripts.

## Portfolio assets

The repository’s current local tattoo/artist files are byte-corrupted and cannot be rendered reliably. The public site therefore does not display them or any stock substitutes. Add verified original files before enabling an on-site image gallery. Until then, the Selected Work section links to Hans’s official Instagram.
