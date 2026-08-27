import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const files = [
  'index.html',
  'src/App.tsx',
  'src/components/Hero.tsx',
  'src/components/Portfolio.tsx',
  'src/components/InquiryForm.tsx',
  'src/components/AboutArtist.tsx',
  'src/components/FAQ.tsx',
  'src/components/InteractiveMap.tsx',
  'src/components/ConsentBanner.tsx',
];

async function joinedSource() {
  return (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n');
}

test('advertising-facing content contains no stock image hosts or prohibited claims', async () => {
  const source = (await joinedSource()).toLowerCase();
  for (const phrase of ['images.unsplash.com', 'private studio', 'exclusive private', 'virtually painless', 'verified client', 'live instagram feed']) {
    assert.equal(source.includes(phrase), false, 'Unexpected phrase: ' + phrase);
  }
});

test('SEO identifies Hans as a person without invented phone data', async () => {
  const html = await readFile('index.html', 'utf8');
  assert.match(html, /"@type": "Person"/);
  assert.match(html, /"@type": "WebSite"/);
  assert.match(html, /"jobTitle": "Tattoo Artist"/);
  assert.match(html, /"name": "Gara Art Studio"/);
  assert.match(html, /"postalCode": "10018"/);
  assert.match(html, /rel="canonical" href="https:\/\/hansttoo\.vercel\.app\/"/);
  assert.match(html, /hreflang="es" href="https:\/\/hansttoo\.vercel\.app\/es"/);
  assert.match(html, /og-hansttoo\.jpg/);
  assert.doesNotMatch(html, /"telephone"/);
  assert.doesNotMatch(html, /TattooParlor/);
});

test('consultation form keeps references optional and links privacy', async () => {
  const form = await readFile('src/components/InquiryForm.tsx', 'utf8');
  assert.match(form, /Reference images \(optional\)/);
  assert.match(form, /'\/es\/privacy' : '\/privacy'/);
  assert.doesNotMatch(form, /placementPhoto/);
  assert.doesNotMatch(form, /validationImages/);
  assert.match(form, /\+1 212 555 0123/);
});

test('tracking uses environment configuration and USD', async () => {
  const tracking = await readFile('src/lib/tracking.ts', 'utf8');
  assert.match(tracking, /VITE_GTM_ID/);
  assert.match(tracking, /VITE_GA4_ID/);
  assert.match(tracking, /VITE_GOOGLE_ADS_CONVERSION_LABEL/);
  assert.match(tracking, /VITE_META_PIXEL_ID/);
  assert.match(tracking, /ad_user_data: consent/);
  assert.match(tracking, /ad_personalization: consent/);
  assert.match(tracking, /currentConsent === 'granted'/);
  assert.match(tracking, /currency: 'USD'/);
  assert.doesNotMatch(tracking, /currency: 'EUR'/);
});

test('lead attribution is allow-listed, stored with the inquiry, and excludes arbitrary query data', async () => {
  const [attribution, app, supabaseClient, schema, privacy] = await Promise.all([
    readFile('src/lib/attribution.ts', 'utf8'),
    readFile('src/App.tsx', 'utf8'),
    readFile('src/lib/supabase.ts', 'utf8'),
    readFile('supabase_schema.sql', 'utf8'),
    readFile('src/components/PrivacyPolicy.tsx', 'utf8'),
  ]);
  for (const field of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid']) {
    assert.match(attribution, new RegExp(field));
    assert.match(supabaseClient, new RegExp(field));
    assert.match(schema, new RegExp(field));
  }
  assert.match(app, /readLeadAttribution/);
  assert.match(attribution, /url\.pathname/);
  assert.doesNotMatch(attribution, /Object\.fromEntries\(url\.searchParams/);
  assert.match(privacy, /allow-listed campaign parameters/);
  assert.match(privacy, /parámetros de campaña permitidos/);
});

test('paid media brief separates Google website leads from Meta Instagram Direct', async () => {
  const brief = await readFile('docs/paid-ads-brief.md', 'utf8');
  assert.match(brief, /Google Business Profile or public location asset/);
  assert.match(brief, /destination is \*\*Instagram Direct for @hansttoo\*\*/);
  assert.match(brief, /Meta ads do \*\*not\*\* send people to the website/);
  assert.match(brief, /Do not optimize or report this campaign using website page views, website Pixel/);
});

test('build prepares route-specific HTML for crawlable language metadata', async () => {
  const generator = await readFile('scripts/generate-static-routes.mjs', 'utf8');
  assert.match(generator, /path: 'es'/);
  assert.match(generator, /path: 'es\/privacy'/);
  assert.match(generator, /path: 'es\/thank-you'/);
  assert.match(generator, /path: 'admin'/);
  assert.match(generator, /path: 'es\/admin'/);
  assert.match(generator, /robots: 'noindex, nofollow'/);
});

test('admin uses Supabase Auth and RLS without the removed visual editor', async () => {
  const [app, admin, supabaseClient, schema] = await Promise.all([
    readFile('src/App.tsx', 'utf8'),
    readFile('src/components/AdminPage.tsx', 'utf8'),
    readFile('src/lib/supabase.ts', 'utf8'),
    readFile('supabase_schema.sql', 'utf8'),
  ]);
  assert.match(app, /path.*admin|currentPage === 'admin'/s);
  assert.match(admin, /Panel de consultas/);
  assert.match(supabaseClient, /signInWithPassword/);
  assert.match(schema, /create table if not exists public\.admin_users/);
  assert.match(schema, /admin_read_inquiries/);
  assert.match(schema, /admin_update_inquiries/);
  assert.doesNotMatch(supabaseClient, /service_role|admin_passcode|hans2026/);
  await assert.rejects(access('src/components/VisualElementEditorModal.tsx'));
  await assert.rejects(access('src/components/Dashboard.tsx'));
});

test('mobile hero uses content height instead of forcing a full viewport', async () => {
  const hero = await readFile('src/components/Hero.tsx', 'utf8');
  assert.match(hero, /sm:min-h-\[calc\(100svh-4rem\)\]/);
  assert.doesNotMatch(hero, /grid min-h-\[calc\(100svh-4rem\)\]/);
});
