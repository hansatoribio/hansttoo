# Hansttoo launch checklist

Nothing in this checklist should be activated until Hans reviews the site, the privacy language, and the event behavior.

## Required for consultation delivery

- `VITE_SUPABASE_URL`: the approved Hansttoo Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: that project’s public publishable/anon key. Never use a service-role or secret key in the browser.
- Review `supabase_schema.sql` in the official Supabase SQL Editor before running it. The website does not apply schema changes.
- Submit one clearly marked test consultation after approval, confirm the row exists, confirm any reference object is private, then delete the test record and object manually.

## Google measurement — choose one setup

The website can be used for a Google Search campaign without a Google Business Profile or location asset. See `paid-ads-brief.md`. Google Ads billing and advertiser verification may still require Hans's real legal/billing address privately in the Google account.

### Google Tag Manager (recommended when an agency manages tags)

- `VITE_GTM_ID`: container ID in the form `GTM-XXXXXXX`.
- In GTM, create a GA4 configuration/tag and a GA4 event tag triggered by the data-layer event `generate_lead`.
- In GTM, create the Google Ads conversion tag triggered by `generate_lead` when Google Ads conversion measurement is required.
- Enable the tags’ built-in consent checks for `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization`. The site sets Consent Mode v2 defaults before GTM loads and updates them when the visitor changes the privacy choice.
- Publish the GTM container only after testing it in Tag Assistant preview.

### Direct Google tags (when GTM is not used)

- `VITE_GA4_ID`: GA4 measurement ID in the form `G-XXXXXXXXXX`.
- `VITE_GOOGLE_ADS_ID`: Google Ads destination ID in the form `AW-123456789`.
- `VITE_GOOGLE_ADS_CONVERSION_LABEL`: the conversion action’s label from Google Ads.

The direct implementation sends `generate_lead` only after Supabase confirms the inquiry insert. It sends no name, email, phone, Instagram username, placement text, idea description, or uploaded image to Google.

Google tags use advanced Consent Mode v2: all optional storage and advertising consent signals default to denied, consent updates are persisted locally, and ads data redaction is enabled. When storage is denied, Google may still receive limited cookieless consent and event pings for modeling. Confirm the final regional/legal setup with the business’s privacy adviser before launch.

## Meta measurement

- `VITE_META_PIXEL_ID`: the numeric Meta Pixel ID.
- Verify the website `PageView` and `Lead` events with Meta Pixel Helper or Events Manager Test Events only if the website Pixel will be used for consented analytics or a separately approved future retargeting campaign.
- Meta Pixel is not loaded until the visitor allows measurement, and the choice can be revoked from the footer.

The approved Meta acquisition campaign sends people directly to Instagram Direct for @hansttoo, not to this website. Its primary result is a messaging conversation and it must not be optimized or reported from the website Pixel. The website `Lead` event remains limited to website form submissions: it fires only after Supabase confirms the inquiry insert and includes the selected tattoo style but no direct contact information, free-text description, or uploaded image.

Meta Conversions API is not enabled. If Hans later approves server-side measurement, provide the Pixel/Dataset ID and create the access token only through Meta’s official Events Manager. Never place a Conversions API access token in a `VITE_` variable or browser code; a server-side endpoint and shared `event_id` deduplication must be reviewed separately.

## Content still needed

- Original, renderable portfolio files that Hans confirms are his work.
- A clear mapping of each image to style and accessible alt text.
- An original, attributable source for any client review before reviews are published.
- Hans’s decision on a privacy-request contact channel other than Instagram, if desired.

## Final pre-launch verification

- Test English (`/`) and Spanish (`/es`) navigation, localized privacy routes, gallery filters, FAQ controls, map links, and the Privacy Policy.
- Test form validation, optional uploads, backend error handling, successful submission, `/thank-you`, and one conversion event per confirmed lead.
- Verify desktop and mobile layouts, keyboard navigation, visible focus, headings, image alternatives, console errors, `robots.txt`, and `sitemap.xml`.
- Confirm the production build contains only approved IDs and the correct canonical domain.
- Open a test Google URL containing UTM/click parameters, submit to the local non-persistent test backend, and confirm the allow-listed attribution reaches the lead while arbitrary query parameters do not.
- Separately preview the Meta ad and confirm its button opens Instagram Direct for @hansttoo; do not route that ad through the website.
- Validate canonical and reciprocal `hreflang` links, submit `sitemap.xml` in Google Search Console after deployment, and validate the Person/WebSite graph with Google’s Rich Results Test or Schema.org validator.
- Do not publish campaigns or production changes until Hans approves the final result.
