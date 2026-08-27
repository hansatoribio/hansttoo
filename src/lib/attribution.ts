import type { LeadAttribution } from '../types';

const campaignParameters = {
  utm_source: 'source',
  utm_medium: 'medium',
  utm_campaign: 'campaign',
  utm_content: 'content',
  utm_term: 'term',
  gclid: 'gclid',
  gbraid: 'gbraid',
  wbraid: 'wbraid',
  fbclid: 'fbclid',
} as const;

const fieldLimit = 200;
const clickIdLimit = 500;

function clean(value: string | null, limit = fieldLimit): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, limit);
  return normalized || undefined;
}

function externalReferrerSource(referrer: string, currentHost: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
    return hostname && hostname !== currentHost.replace(/^www\./, '').toLowerCase()
      ? clean(hostname)
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Reads only allow-listed campaign values. It never keeps a full referrer URL,
 * arbitrary query parameters, form data, or contact information.
 */
export function readLeadAttribution(
  currentUrl = window.location.href,
  referrer = document.referrer,
): LeadAttribution {
  const url = new URL(currentUrl);
  const attribution: LeadAttribution = {
    landingPath: clean(url.pathname, 300) || '/',
  };

  for (const [parameter, field] of Object.entries(campaignParameters)) {
    const limit = field.endsWith('clid') || field.endsWith('braid') ? clickIdLimit : fieldLimit;
    const value = clean(url.searchParams.get(parameter), limit);
    if (value) attribution[field] = value;
  }

  if (!attribution.source && (attribution.gclid || attribution.gbraid || attribution.wbraid)) {
    attribution.source = 'google';
    attribution.medium = attribution.medium || 'cpc';
  }
  if (!attribution.source && attribution.fbclid) {
    attribution.source = 'meta';
    attribution.medium = attribution.medium || 'paid_social';
  }

  const referralSource = externalReferrerSource(referrer, url.hostname);
  if (!attribution.source && referralSource) {
    attribution.source = referralSource;
    attribution.medium = 'referral';
  }
  if (!attribution.source) {
    attribution.source = 'direct';
    attribution.medium = 'none';
  }

  return attribution;
}
