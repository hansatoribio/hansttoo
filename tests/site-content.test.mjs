import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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

test('build prepares route-specific HTML for crawlable language metadata', async () => {
  const generator = await readFile('scripts/generate-static-routes.mjs', 'utf8');
  assert.match(generator, /path: 'es'/);
  assert.match(generator, /path: 'es\/privacy'/);
  assert.match(generator, /path: 'es\/thank-you'/);
  assert.match(generator, /robots: 'noindex, nofollow'/);
});
