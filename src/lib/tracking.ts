const config = {
  ga4Id: String(import.meta.env.VITE_GA4_ID || '').trim(),
  gtmId: String(import.meta.env.VITE_GTM_ID || '').trim(),
  googleAdsId: String(import.meta.env.VITE_GOOGLE_ADS_ID || '').trim(),
  googleAdsConversionLabel: String(import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL || '').trim(),
  metaPixelId: String(import.meta.env.VITE_META_PIXEL_ID || '').trim(),
};

const isGa4Id = (value: string) => /^G-[A-Z0-9]+$/.test(value);
const isGtmId = (value: string) => /^GTM-[A-Z0-9]+$/.test(value);
const isAdsId = (value: string) => /^AW-[0-9]+$/.test(value);
const isMetaPixelId = (value: string) => /^[0-9]+$/.test(value);
const CONSENT_STORAGE_KEY = 'hansttoo_measurement_consent';
export type TrackingConsent = 'granted' | 'denied';
let currentConsent: TrackingConsent = 'denied';
let initialized = false;

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
}

function loadScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function getStoredTrackingConsent(): TrackingConsent | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch {
    return null;
  }
}

function setGoogleConsent(command: 'default' | 'update', consent: TrackingConsent) {
  ensureDataLayer();
  window.gtag?.('consent', command, {
    analytics_storage: consent,
    ad_storage: consent,
    ad_user_data: consent,
    ad_personalization: consent,
    ...(command === 'default' && consent === 'denied' ? { wait_for_update: 500 } : {}),
  });
}

function loadMetaPixel() {
  if (!isMetaPixelId(config.metaPixelId)) return;
  if (window.fbq) {
    window.fbq('consent', 'grant');
    return;
  }

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as MetaPixelFunction;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';
  window.fbq = fbq;
  window._fbq = fbq;
  loadScript('hansttoo-meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', config.metaPixelId);
  window.fbq('track', 'PageView');
}

export function initTracking() {
  if (initialized) return;
  initialized = true;
  currentConsent = getStoredTrackingConsent() ?? 'denied';
  setGoogleConsent('default', currentConsent);
  window.gtag?.('set', 'ads_data_redaction', true);

  if (isGtmId(config.gtmId)) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript('hansttoo-gtm', 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(config.gtmId));
  } else if (isGa4Id(config.ga4Id) || isAdsId(config.googleAdsId)) {
    const loaderId = isGa4Id(config.ga4Id) ? config.ga4Id : config.googleAdsId;
    ensureDataLayer();
    loadScript('hansttoo-google-tag', 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(loaderId));
    window.gtag?.('js', new Date());
    if (isGa4Id(config.ga4Id)) window.gtag?.('config', config.ga4Id);
    if (isAdsId(config.googleAdsId)) window.gtag?.('config', config.googleAdsId);
  }

  if (currentConsent === 'granted') loadMetaPixel();
}

export function updateTrackingConsent(consent: TrackingConsent) {
  currentConsent = consent;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  } catch {
    // Consent still applies for this page even when browser storage is unavailable.
  }
  setGoogleConsent('update', consent);
  if (consent === 'granted') loadMetaPixel();
  else window.fbq?.('consent', 'revoke');
}

export function trackLeadConversion(details: { style: string; placement: string; size: number }) {
  const eventData = {
    event: 'generate_lead',
    lead_type: 'tattoo_consultation',
    tattoo_style: details.style,
    approximate_size_cm: details.size,
  };

  ensureDataLayer();
  window.dataLayer?.push(eventData);

  if (!isGtmId(config.gtmId) && isGa4Id(config.ga4Id)) {
    window.gtag?.('event', 'generate_lead', {
      lead_type: eventData.lead_type,
      tattoo_style: eventData.tattoo_style,
      approximate_size_cm: eventData.approximate_size_cm,
    });
  }

  if (!isGtmId(config.gtmId) && isAdsId(config.googleAdsId) && config.googleAdsConversionLabel) {
    window.gtag?.('event', 'conversion', {
      send_to: config.googleAdsId + '/' + config.googleAdsConversionLabel,
      value: 1,
      currency: 'USD',
    });
  }

  if (currentConsent === 'granted' && isMetaPixelId(config.metaPixelId) && window.fbq) {
    window.fbq('track', 'Lead', {
      content_category: 'tattoo_consultation',
      content_name: details.style,
    });
  }
}

interface MetaPixelFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}
