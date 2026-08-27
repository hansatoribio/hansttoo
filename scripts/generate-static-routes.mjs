import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectDirectory, 'dist');
const baseHtml = await readFile(path.join(distDirectory, 'index.html'), 'utf8');

const routes = [
  {
    path: 'es',
    lang: 'es',
    title: 'Tatuador de Anime en NYC | Línea Fina y Microrealismo | Hans',
    description: 'Solicita una consulta con Hans para un tatuaje personalizado de anime, manga, microrealismo o línea fina en Gara Art Studio, Midtown Manhattan.',
    canonical: 'https://hansttoo.vercel.app/es',
    alternateEn: 'https://hansttoo.vercel.app/',
    alternateEs: 'https://hansttoo.vercel.app/es',
    locale: 'es_US',
    alternateLocale: 'en_US',
    robots: 'index, follow, max-snippet:-1, max-image-preview:large',
  },
  {
    path: 'privacy',
    lang: 'en',
    title: 'Privacy Policy | Hans | NYC Tattoo Artist',
    description: 'How Hans handles consultation details, contact information, optional reference images, and website measurement choices.',
    canonical: 'https://hansttoo.vercel.app/privacy',
    alternateEn: 'https://hansttoo.vercel.app/privacy',
    alternateEs: 'https://hansttoo.vercel.app/es/privacy',
    locale: 'en_US',
    alternateLocale: 'es_US',
    robots: 'index, follow, max-snippet:-1, max-image-preview:large',
  },
  {
    path: 'es/privacy',
    lang: 'es',
    title: 'Política de Privacidad | Hans | Tatuador en NYC',
    description: 'Cómo Hans gestiona los datos de consulta, información de contacto, referencias opcionales y preferencias de medición del sitio.',
    canonical: 'https://hansttoo.vercel.app/es/privacy',
    alternateEn: 'https://hansttoo.vercel.app/privacy',
    alternateEs: 'https://hansttoo.vercel.app/es/privacy',
    locale: 'es_US',
    alternateLocale: 'en_US',
    robots: 'index, follow, max-snippet:-1, max-image-preview:large',
  },
  {
    path: 'thank-you',
    lang: 'en',
    title: 'Consultation Request Received | Hans | NYC Tattoo Artist',
    description: 'Confirmation that your tattoo consultation request was received.',
    canonical: 'https://hansttoo.vercel.app/thank-you',
    alternateEn: 'https://hansttoo.vercel.app/thank-you',
    alternateEs: 'https://hansttoo.vercel.app/es/thank-you',
    locale: 'en_US',
    alternateLocale: 'es_US',
    robots: 'noindex, nofollow',
  },
  {
    path: 'es/thank-you',
    lang: 'es',
    title: 'Solicitud de Consulta Recibida | Hans | Tatuador en NYC',
    description: 'Confirmación de que se recibió tu solicitud de consulta para un tatuaje.',
    canonical: 'https://hansttoo.vercel.app/es/thank-you',
    alternateEn: 'https://hansttoo.vercel.app/thank-you',
    alternateEs: 'https://hansttoo.vercel.app/es/thank-you',
    locale: 'es_US',
    alternateLocale: 'en_US',
    robots: 'noindex, nofollow',
  },
  {
    path: 'admin',
    lang: 'en',
    title: 'Admin | Hans | NYC Tattoo Artist',
    description: 'Private administration area for Hansttoo consultation requests.',
    canonical: 'https://hansttoo.vercel.app/admin',
    alternateEn: 'https://hansttoo.vercel.app/admin',
    alternateEs: 'https://hansttoo.vercel.app/es/admin',
    locale: 'en_US',
    alternateLocale: 'es_US',
    robots: 'noindex, nofollow',
  },
  {
    path: 'es/admin',
    lang: 'es',
    title: 'Administración | Hans | Tatuador en NYC',
    description: 'Área privada para administrar solicitudes de consulta de Hansttoo.',
    canonical: 'https://hansttoo.vercel.app/es/admin',
    alternateEn: 'https://hansttoo.vercel.app/admin',
    alternateEs: 'https://hansttoo.vercel.app/es/admin',
    locale: 'es_US',
    alternateLocale: 'en_US',
    robots: 'noindex, nofollow',
  },
];

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

function replaceAttribute(html, selectorPattern, attribute, value) {
  return html.replace(selectorPattern, (tag) => tag.replace(new RegExp(`${attribute}="[^"]*"`), `${attribute}="${escapeAttribute(value)}"`));
}

function renderRoute(route) {
  let html = baseHtml.replace('<html lang="en">', `<html lang="${route.lang}">`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`);
  html = replaceAttribute(html, /<meta name="description"[^>]*>/, 'content', route.description);
  html = replaceAttribute(html, /<meta name="robots"[^>]*>/, 'content', route.robots);
  html = replaceAttribute(html, /<link rel="canonical"[^>]*>/, 'href', route.canonical);
  html = replaceAttribute(html, /<link rel="alternate" hreflang="en"[^>]*>/, 'href', route.alternateEn);
  html = replaceAttribute(html, /<link rel="alternate" hreflang="es"[^>]*>/, 'href', route.alternateEs);
  html = replaceAttribute(html, /<link rel="alternate" hreflang="x-default"[^>]*>/, 'href', route.alternateEn);
  html = replaceAttribute(html, /<meta property="og:title"[^>]*>/, 'content', route.title);
  html = replaceAttribute(html, /<meta property="og:description"[^>]*>/, 'content', route.description);
  html = replaceAttribute(html, /<meta property="og:url"[^>]*>/, 'content', route.canonical);
  html = replaceAttribute(html, /<meta property="og:locale"[^>]*>/, 'content', route.locale);
  html = replaceAttribute(html, /<meta property="og:locale:alternate"[^>]*>/, 'content', route.alternateLocale);
  html = replaceAttribute(html, /<meta name="twitter:title"[^>]*>/, 'content', route.title);
  html = replaceAttribute(html, /<meta name="twitter:description"[^>]*>/, 'content', route.description);
  return html;
}

await Promise.all(routes.map(async (route) => {
  const routeDirectory = path.join(distDirectory, ...route.path.split('/'));
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(path.join(routeDirectory, 'index.html'), renderRoute(route), 'utf8');
}));

console.log(`Generated ${routes.length} route-specific HTML files.`);
