import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Inquiry, Language, LeadAttribution } from '../types';

const supabaseUrl = String(import.meta.env.VITE_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface AdminIdentity {
  id: string;
  email: string;
}

export interface AdminInquiryResult {
  inquiries: Inquiry[];
  error?: string;
}

export interface VisitMetricPoint {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
}

export interface AdminVisitMetrics {
  periodDays: number;
  totalVisitors: number;
  totalPageViews: number;
  visitorsToday: number;
  visitors7Days: number;
  visitors30Days: number;
  periodVisitors: number;
  periodSessions: number;
  periodPageViews: number;
  periodLeads: number;
  conversionRate: number;
  daily: VisitMetricPoint[];
  sources: Array<{ source: string; pageViews: number }>;
  devices: Array<{ device: string; pageViews: number }>;
  topPages: Array<{ path: string; pageViews: number }>;
}

export interface AdminVisitMetricResult {
  metrics: AdminVisitMetrics | null;
  error?: string;
}

const analyticsVisitorKey = 'hansttoo_analytics_visitor_id';
const analyticsSessionKey = 'hansttoo_analytics_session_id';
let lastTrackedVisit = { key: '', timestamp: 0 };

function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

function createRandomId(): string {
  if (typeof window !== 'undefined' && typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function storedId(storage: Storage, key: string, create: boolean): string | null {
  try {
    const existing = storage.getItem(key);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
    if (!create) return null;
    const next = createRandomId();
    storage.setItem(key, next);
    return next;
  } catch {
    return create ? createRandomId() : null;
  }
}

function analyticsIdentifiers(create: boolean) {
  if (typeof window === 'undefined') return { visitorId: null, sessionId: null };
  return {
    visitorId: storedId(window.localStorage, analyticsVisitorKey, create),
    sessionId: storedId(window.sessionStorage, analyticsSessionKey, create),
  };
}

function analyticsSource(attribution: LeadAttribution): 'google' | 'meta' | 'direct' | 'referral' | 'other' {
  const source = attribution.source?.toLowerCase() || '';
  const medium = attribution.medium?.toLowerCase() || '';
  if (attribution.gclid || attribution.gbraid || attribution.wbraid || source.includes('google')) return 'google';
  if (attribution.fbclid || ['meta', 'facebook', 'instagram'].some((value) => source.includes(value))) return 'meta';
  if (source === 'direct') return 'direct';
  if (medium === 'referral') return 'referral';
  return 'other';
}

function analyticsDevice(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const agent = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|kindle|silk/.test(agent)) return 'tablet';
  if (/android|iphone|ipod|mobile/.test(agent)) return 'mobile';
  return 'desktop';
}

export async function trackSiteVisit(details: {
  path: string;
  language: Language;
  attribution: LeadAttribution;
}): Promise<boolean> {
  if (!supabase || typeof window === 'undefined') return false;
  const pagePath = details.path.startsWith('/') ? details.path.split(/[?#]/, 1)[0].slice(0, 300) || '/' : '/';
  const trackingKey = `${pagePath}:${details.language}`;
  const timestamp = Date.now();
  if (lastTrackedVisit.key === trackingKey && timestamp - lastTrackedVisit.timestamp < 3000) return true;

  const { visitorId, sessionId } = analyticsIdentifiers(true);
  if (!visitorId || !sessionId) return false;
  lastTrackedVisit = { key: trackingKey, timestamp };

  const { error } = await supabase.from('site_visit_events').insert({
    visitor_id: visitorId,
    session_id: sessionId,
    page_path: pagePath,
    source: analyticsSource(details.attribution),
    device_type: analyticsDevice(),
    language: details.language,
  });
  if (error) lastTrackedVisit = { key: '', timestamp: 0 };
  return !error;
}

function base64ToBlob(base64Data: string): Blob {
  try {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0]?.split(':')[1] || 'image/jpeg';
    const raw = window.atob(parts[1] || '');
    const bytes = new Uint8Array(raw.length);
    for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
    return new Blob([bytes], { type: contentType });
  } catch {
    return new Blob([], { type: 'image/jpeg' });
  }
}

export async function compressImageBase64(
  base64Str: string,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.82,
): Promise<Blob> {
  return new Promise((resolve) => {
    if (!base64Str.startsWith('data:image/') || typeof window === 'undefined') {
      resolve(base64ToBlob(base64Str));
      return;
    }

    const image = new Image();
    image.onload = () => {
      let width = image.width;
      let height = image.height;
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(base64ToBlob(base64Str));
        return;
      }
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob || base64ToBlob(base64Str)),
        'image/webp',
        quality,
      );
    };
    image.onerror = () => resolve(base64ToBlob(base64Str));
    image.src = base64Str;
  });
}

export async function uploadImageToSupabase(imageData: string, fileNamePrefix = 'ref'): Promise<string> {
  const client = requireSupabase();
  if (!imageData.startsWith('data:image/')) return imageData;

  const compressedBlob = await compressImageBase64(imageData);
  const extension = compressedBlob.type.includes('webp') ? 'webp' : 'jpg';
  const uniqueName = `${fileNamePrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const filePath = `uploads/${uniqueName}`;
  const { error } = await client.storage.from('inquiry-images').upload(filePath, compressedBlob, {
    cacheControl: '31536000',
    contentType: compressedBlob.type,
    upsert: false,
  });
  if (error) throw error;
  return filePath;
}

export async function saveInquiryToSupabase(inquiry: Inquiry): Promise<{ success: boolean; error?: unknown }> {
  if (!supabase) return { success: false, error: new Error('Supabase is not configured.') };

  try {
    const sourceImages = inquiry.referenceImages || (inquiry.referenceImage ? [inquiry.referenceImage] : []);
    const uploadedReferenceImages = await Promise.all(
      sourceImages.map((image, index) => (
        image.startsWith('data:image/')
          ? uploadImageToSupabase(image, `ref-${inquiry.id}-${index + 1}`)
          : Promise.resolve(image)
      )),
    );

    const { visitorId, sessionId } = analyticsIdentifiers(false);
    const { error } = await supabase.from('inquiries').insert({
      id: inquiry.id,
      full_name: inquiry.fullName,
      email: inquiry.email || null,
      phone: inquiry.phone || null,
      instagram: inquiry.instagram || null,
      preferred_contact_method: inquiry.preferredContactMethod || 'email',
      style: inquiry.style,
      color_type: inquiry.colorType || null,
      placement: inquiry.placement,
      size_cm: inquiry.sizeCm,
      description: inquiry.description,
      reference_images: uploadedReferenceImages,
      reference_image: uploadedReferenceImages[0] || null,
      utm_source: inquiry.attribution?.source || null,
      utm_medium: inquiry.attribution?.medium || null,
      utm_campaign: inquiry.attribution?.campaign || null,
      utm_content: inquiry.attribution?.content || null,
      utm_term: inquiry.attribution?.term || null,
      gclid: inquiry.attribution?.gclid || null,
      gbraid: inquiry.attribution?.gbraid || null,
      wbraid: inquiry.attribution?.wbraid || null,
      fbclid: inquiry.attribution?.fbclid || null,
      landing_path: inquiry.attribution?.landingPath || '/',
      analytics_visitor_id: visitorId,
      analytics_session_id: sessionId,
      status: 'pending',
      created_at: inquiry.createdAt || new Date().toISOString(),
    });

    return error ? { success: false, error } : { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

function mapInquiry(row: Record<string, unknown>): Inquiry {
  const referenceImages = Array.isArray(row.reference_images)
    ? row.reference_images.filter((value): value is string => typeof value === 'string')
    : typeof row.reference_image === 'string'
      ? [row.reference_image]
      : [];

  return {
    id: String(row.id),
    fullName: String(row.full_name || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    instagram: typeof row.instagram === 'string' ? row.instagram : undefined,
    preferredContactMethod: row.preferred_contact_method as Inquiry['preferredContactMethod'],
    style: row.style as Inquiry['style'],
    colorType: row.color_type as Inquiry['colorType'],
    placement: String(row.placement || ''),
    sizeCm: Number(row.size_cm || 0),
    description: String(row.description || ''),
    referenceImage: typeof row.reference_image === 'string' ? row.reference_image : null,
    referenceImages,
    placementPhoto: typeof row.placement_photo === 'string' ? row.placement_photo : null,
    status: row.status as Inquiry['status'],
    viewedAt: typeof row.viewed_at === 'string' ? row.viewed_at : undefined,
    tags: Array.isArray(row.tags)
      ? row.tags.filter((value): value is string => typeof value === 'string')
      : [],
    artistNotes: typeof row.artist_notes === 'string' ? row.artist_notes : '',
    medicalNotes: typeof row.medical_notes === 'string' ? row.medical_notes : undefined,
    createdAt: String(row.created_at || ''),
    attribution: {
      source: typeof row.utm_source === 'string' ? row.utm_source : undefined,
      medium: typeof row.utm_medium === 'string' ? row.utm_medium : undefined,
      campaign: typeof row.utm_campaign === 'string' ? row.utm_campaign : undefined,
      content: typeof row.utm_content === 'string' ? row.utm_content : undefined,
      term: typeof row.utm_term === 'string' ? row.utm_term : undefined,
      gclid: typeof row.gclid === 'string' ? row.gclid : undefined,
      gbraid: typeof row.gbraid === 'string' ? row.gbraid : undefined,
      wbraid: typeof row.wbraid === 'string' ? row.wbraid : undefined,
      fbclid: typeof row.fbclid === 'string' ? row.fbclid : undefined,
      landingPath: typeof row.landing_path === 'string' ? row.landing_path : '/',
    },
  };
}

async function currentUserIsAdmin(client: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await client
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  return !error && data?.user_id === userId;
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  if (!(await currentUserIsAdmin(supabase, data.user.id))) return null;
  return { id: data.user.id, email: data.user.email || '' };
}

export async function signInAdmin(email: string, password: string): Promise<AdminIdentity> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.user) throw new Error('invalid-credentials');

  if (!(await currentUserIsAdmin(client, data.user.id))) {
    await client.auth.signOut({ scope: 'local' });
    throw new Error('not-authorized');
  }
  return { id: data.user.id, email: data.user.email || '' };
}

export async function signOutAdmin(): Promise<void> {
  if (supabase) await supabase.auth.signOut({ scope: 'local' });
}

export async function fetchAdminInquiries(limit = 200): Promise<AdminInquiryResult> {
  if (!supabase) return { inquiries: [], error: 'not-configured' };
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { inquiries: [], error: error.code || 'load-failed' };
  return { inquiries: (data || []).map((row) => mapInquiry(row as Record<string, unknown>)) };
}

function numberMetric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function fetchAdminVisitMetrics(days = 30): Promise<AdminVisitMetricResult> {
  if (!supabase) return { metrics: null, error: 'not-configured' };
  const { data, error } = await supabase.rpc('get_admin_visit_metrics', {
    p_days: Math.max(1, Math.min(Math.round(days), 90)),
  });
  if (error || !data || typeof data !== 'object') {
    return { metrics: null, error: error?.code || 'load-failed' };
  }

  const row = data as Record<string, unknown>;
  const arrayValue = (value: unknown) => Array.isArray(value) ? value as Array<Record<string, unknown>> : [];
  return {
    metrics: {
      periodDays: numberMetric(row.periodDays) || days,
      totalVisitors: numberMetric(row.totalVisitors),
      totalPageViews: numberMetric(row.totalPageViews),
      visitorsToday: numberMetric(row.visitorsToday),
      visitors7Days: numberMetric(row.visitors7Days),
      visitors30Days: numberMetric(row.visitors30Days),
      periodVisitors: numberMetric(row.periodVisitors),
      periodSessions: numberMetric(row.periodSessions),
      periodPageViews: numberMetric(row.periodPageViews),
      periodLeads: numberMetric(row.periodLeads),
      conversionRate: numberMetric(row.conversionRate),
      daily: arrayValue(row.daily).map((item) => ({
        date: String(item.date || ''),
        visitors: numberMetric(item.visitors),
        sessions: numberMetric(item.sessions),
        pageViews: numberMetric(item.pageViews),
      })),
      sources: arrayValue(row.sources).map((item) => ({
        source: String(item.source || 'other'),
        pageViews: numberMetric(item.pageViews),
      })),
      devices: arrayValue(row.devices).map((item) => ({
        device: String(item.device || 'desktop'),
        pageViews: numberMetric(item.pageViews),
      })),
      topPages: arrayValue(row.topPages).map((item) => ({
        path: String(item.path || '/'),
        pageViews: numberMetric(item.pageViews),
      })),
    },
  };
}

export async function updateInquiryStatusInSupabase(id: string, status: Inquiry['status']): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  return !error && data?.id === id;
}

export async function updateInquiryNotesInSupabase(id: string, artistNotes: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('inquiries')
    .update({ artist_notes: artistNotes.trim() || null })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  return !error && data?.id === id;
}

export async function markInquiryViewedInSupabase(id: string, viewedAt: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('inquiries')
    .update({ viewed_at: viewedAt })
    .eq('id', id)
    .is('viewed_at', null)
    .select('id')
    .maybeSingle();
  return !error && (!data || data.id === id);
}

export async function updateInquiryTagsInSupabase(id: string, tags: string[]): Promise<boolean> {
  if (!supabase) return false;
  const normalizedTags = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 8);
  const { data, error } = await supabase
    .from('inquiries')
    .update({ tags: normalizedTags })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  return !error && data?.id === id;
}

export async function createSignedInquiryMediaUrls(paths: string[]): Promise<Record<string, string>> {
  const client = requireSupabase();
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  const entries = await Promise.all(uniquePaths.map(async (path) => {
    if (/^https:\/\//i.test(path)) return [path, path] as const;
    const { data, error } = await client.storage.from('inquiry-images').createSignedUrl(path, 300);
    return [path, error || !data?.signedUrl ? '' : data.signedUrl] as const;
  }));
  return Object.fromEntries(entries.filter(([, url]) => Boolean(url)));
}
