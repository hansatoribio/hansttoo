import type { Language } from '../types';

const SITE_URL = 'https://hansttoo.vercel.app';

type PageKind = 'home' | 'privacy' | 'thank-you';

const metadata: Record<Language, Record<PageKind, { title: string; description: string }>> = {
  en: {
    home: {
      title: 'Anime Tattoo Artist NYC | Fine Line & Microrealism | Hans',
      description: 'Request a custom anime, manga, microrealism, or fine-line tattoo consultation with Hans at Gara Art Studio in Midtown Manhattan, New York City.',
    },
    privacy: {
      title: 'Privacy Policy | Hans | NYC Tattoo Artist',
      description: 'How Hans handles consultation details, contact information, optional reference images, and website measurement choices.',
    },
    'thank-you': {
      title: 'Consultation Request Received | Hans | NYC Tattoo Artist',
      description: 'Confirmation that your tattoo consultation request was received.',
    },
  },
  es: {
    home: {
      title: 'Tatuador de Anime en NYC | Línea Fina y Microrealismo | Hans',
      description: 'Solicita una consulta con Hans para un tatuaje personalizado de anime, manga, microrealismo o línea fina en Gara Art Studio, Midtown Manhattan.',
    },
    privacy: {
      title: 'Política de Privacidad | Hans | Tatuador en NYC',
      description: 'Cómo Hans gestiona los datos de consulta, información de contacto, referencias opcionales y preferencias de medición del sitio.',
    },
    'thank-you': {
      title: 'Solicitud de Consulta Recibida | Hans | Tatuador en NYC',
      description: 'Confirmación de que se recibió tu solicitud de consulta para un tatuaje.',
    },
  },
};

export function localizedPath(language: Language, page: PageKind) {
  const suffix = page === 'home' ? '' : `/${page}`;
  return language === 'es' ? `/es${suffix}` : suffix || '/';
}

function setMeta(selector: string, attribute: string, value: string) {
  document.querySelector<HTMLElement>(selector)?.setAttribute(attribute, value);
}

function setAlternate(language: 'en' | 'es' | 'x-default', href: string) {
  document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${language}"]`)?.setAttribute('href', href);
}

export function updatePageMetadata(language: Language, page: PageKind) {
  const pageMetadata = metadata[language][page];
  const canonicalPath = localizedPath(language, page);
  const canonicalUrl = new URL(canonicalPath, SITE_URL).href;
  const englishUrl = new URL(localizedPath('en', page), SITE_URL).href;
  const spanishUrl = new URL(localizedPath('es', page), SITE_URL).href;
  const indexable = page !== 'thank-you';

  document.title = pageMetadata.title;
  document.documentElement.lang = language;
  setMeta('meta[name="description"]', 'content', pageMetadata.description);
  setMeta('meta[name="robots"]', 'content', indexable ? 'index, follow, max-snippet:-1, max-image-preview:large' : 'noindex, nofollow');
  setMeta('meta[property="og:title"]', 'content', pageMetadata.title);
  setMeta('meta[property="og:description"]', 'content', pageMetadata.description);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  setMeta('meta[property="og:locale"]', 'content', language === 'es' ? 'es_US' : 'en_US');
  setMeta('meta[property="og:locale:alternate"]', 'content', language === 'es' ? 'en_US' : 'es_US');
  setMeta('meta[name="twitter:title"]', 'content', pageMetadata.title);
  setMeta('meta[name="twitter:description"]', 'content', pageMetadata.description);
  setMeta('link[rel="canonical"]', 'href', canonicalUrl);
  setAlternate('en', englishUrl);
  setAlternate('es', spanishUrl);
  setAlternate('x-default', englishUrl);
}
