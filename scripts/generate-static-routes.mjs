import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectDirectory, 'dist');
const baseHtml = await readFile(path.join(distDirectory, 'index.html'), 'utf8');

const staticFallbacks = {
  esHome: `
      <main id="static-seo-content">
        <header>
          <a href="/es" aria-label="Hans | Tatuador en NYC inicio">hansttoo.</a>
          <p>HANS | TATUADOR EN NYC</p>
          <h1>Tatuajes personalizados de anime, microrrealismo y línea fina</h1>
          <p>Tatuajes personalizados por Hans en Gara Art Studio, Midtown Manhattan. Envía tu idea, tamaño aproximado y zona para solicitar disponibilidad.</p>
          <p>Artista independiente en NYC · Artista residente en Gara Art Studio · Solo con cita</p>
          <nav aria-label="Secciones del sitio">
            <a href="#portfolio">Ver trabajos reales</a>
            <a href="#booking">Solicitar una consulta</a>
            <a href="/" hreflang="en">English</a>
          </nav>
        </header>
        <section id="portfolio">
          <h2>Trabajos seleccionados y especialidades</h2>
          <p>Hans se especializa en tatuajes personalizados de anime y manga, microrrealismo y línea fina en la ciudad de Nueva York.</p>
          <h3>Tatuajes de Anime y Manga</h3>
          <p>Composiciones personalizadas según el personaje, panel, zona y escala solicitados por cada cliente.</p>
          <img src="/portfolio/anime-my-hero-tattoo-nyc.webp" alt="Tatuaje detallado de personaje de anime en negro y gris realizado por Hans" width="1067" height="1600" loading="lazy" />
          <h3>Tatuajes de Microrrealismo</h3>
          <p>Imágenes a pequeña escala planificadas según el detalle legible, el contraste y la zona elegida.</p>
          <img src="/portfolio/microrealism-empire-state-tattoo-nyc.webp" alt="Tatuaje de microrrealismo del Empire State realizado por Hans" width="1067" height="1600" loading="lazy" />
          <h3>Tatuajes de Línea Fina</h3>
          <p>Conceptos personalizados centrados en líneas y planificados cuidadosamente para cada zona.</p>
          <img src="/portfolio/fine-line-hummingbird-tattoo-nyc.webp" alt="Tatuaje de línea fina de colibrí y flor realizado por Hans" width="1067" height="1600" loading="lazy" />
          <a href="https://www.instagram.com/hansttoo/" rel="noopener">Ver trabajos auténticos publicados por @hansttoo</a>
        </section>
        <section>
          <h2>Artista del tatuaje independiente en Midtown Manhattan</h2>
          <p>Hans es artista residente independiente en Gara Art Studio. No es dueño del estudio.</p>
          <address>Citas en Gara Art Studio, 240 W 40th St, New York, NY 10018.</address>
        </section>
        <section id="booking">
          <h2>Solicitar una consulta de tatuaje</h2>
          <p>Envía tu nombre, método de contacto, estilo, tamaño aproximado, zona, descripción e imágenes opcionales. La solicitud no confirma una cita.</p>
        </section>
        <section>
          <h2>Antes de solicitar una cita</h2>
          <h3>¿Dónde se realizan las citas?</h3>
          <p>Las citas se realizan en Gara Art Studio, 240 W 40th St, Midtown Manhattan, después de que Hans confirme la disponibilidad directamente.</p>
          <h3>¿El formulario confirma la reserva?</h3>
          <p>No. Hans revisa cada solicitud antes de hablar de disponibilidad, precio y detalles de la cita.</p>
        </section>
        <footer>
          <a href="/es/privacy">Política de Privacidad</a>
          <a href="https://www.instagram.com/hansttoo/" rel="noopener">Instagram @hansttoo</a>
        </footer>
      </main>`,
  privacyEn: `
      <main id="static-seo-content">
        <a href="/">Back to website</a>
        <h1>Privacy Policy</h1>
        <p>This policy explains how Hans, an independent NYC tattoo artist using @hansttoo, handles consultation information.</p>
        <h2>Information collected and use</h2>
        <p>The consultation may include contact details, tattoo idea, size, placement, optional references, and allow-listed advertising attribution. Hans uses it to review and respond to the request.</p>
        <h2>Your choices</h2>
        <p>Reference images and advertising measurement are optional. Contact @hansttoo for privacy requests.</p>
      </main>`,
  privacyEs: `
      <main id="static-seo-content">
        <a href="/es">Volver al sitio</a>
        <h1>Política de Privacidad</h1>
        <p>Esta política explica cómo Hans, artista del tatuaje independiente en NYC que usa @hansttoo, gestiona la información de las consultas.</p>
        <h2>Información recopilada y uso</h2>
        <p>La consulta puede incluir datos de contacto, idea, tamaño, zona, referencias opcionales y atribución publicitaria permitida. Hans la usa para revisar y responder la solicitud.</p>
        <h2>Tus opciones</h2>
        <p>Las imágenes de referencia y la medición publicitaria son opcionales. Contacta a @hansttoo para solicitudes de privacidad.</p>
      </main>`,
  thankYouEn: '<main id="static-seo-content"><h1>Consultation request received</h1><p>Hans will review the details and reply through the preferred contact method if the project is a fit.</p><a href="/">Back to website</a></main>',
  thankYouEs: '<main id="static-seo-content"><h1>Solicitud de consulta recibida</h1><p>Hans revisará los detalles y responderá mediante el contacto preferido si el proyecto encaja.</p><a href="/es">Volver al sitio</a></main>',
  adminEn: '<main id="static-seo-content"><h1>Private administration area</h1><p>This page requires an authorized account.</p><a href="/">Back to website</a></main>',
  adminEs: '<main id="static-seo-content"><h1>Área privada de administración</h1><p>Esta página requiere una cuenta autorizada.</p><a href="/es">Volver al sitio</a></main>',
};

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
    fallback: staticFallbacks.esHome,
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
    fallback: staticFallbacks.privacyEn,
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
    fallback: staticFallbacks.privacyEs,
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
    fallback: staticFallbacks.thankYouEn,
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
    fallback: staticFallbacks.thankYouEs,
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
    fallback: staticFallbacks.adminEn,
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
    fallback: staticFallbacks.adminEs,
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
  html = html.replace(
    /<!-- static-fallback:start -->[\s\S]*?<!-- static-fallback:end -->/,
    `<!-- static-fallback:start -->${route.fallback}<!-- static-fallback:end -->`,
  );
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
