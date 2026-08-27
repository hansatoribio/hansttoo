import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Inquiry } from '../types';

// Public browser configuration must be supplied by the deployment environment.
// Never fall back to a project URL or key checked into source control.
const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * High-performance client-side image compression using HTML5 Canvas.
 * Reduces 5MB-15MB high-res phone uploads down to ~150KB-250KB web-optimized images.
 * Drastically saves Supabase Storage quota and speeds up uploads on mobile data.
 */
export async function compressImageBase64(
  base64Str: string,
  maxWidth: number = 1400,
  maxHeight: number = 1400,
  quality: number = 0.82
): Promise<Blob> {
  return new Promise((resolve) => {
    // If not a data URL or running in an environment without document/Image, fallback to standard blob
    if (!base64Str.startsWith('data:image/') || typeof window === 'undefined') {
      resolve(base64ToBlob(base64Str));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate proportional scale
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64ToBlob(base64Str));
        return;
      }

      // Smooth bicubic resampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP for optimal compression, fallback to JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(base64ToBlob(base64Str));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      resolve(base64ToBlob(base64Str));
    };

    img.src = base64Str;
  });
}

// Convert base64 data to fallback Blob
function base64ToBlob(base64Data: string): Blob {
  try {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0]?.split(':')[1] || 'image/jpeg';
    const raw = window.atob(parts[1] || '');
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  } catch (e) {
    return new Blob([], { type: 'image/jpeg' });
  }
}

/**
 * Upload an image (with automatic compression) to Supabase Storage bucket ('inquiry-images')
 */
export async function uploadImageToSupabase(imageData: string, fileNamePrefix: string = 'ref'): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const isBase64 = imageData.startsWith('data:image/');
    if (!isBase64) {
      // If it's already a URL, return it directly
      return imageData;
    }

    // Compress the image before network upload
    const compressedBlob = await compressImageBase64(imageData, 1400, 1400, 0.82);
    const ext = compressedBlob.type.includes('webp') ? 'webp' : 'jpg';

    const uniqueName = `${fileNamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `uploads/${uniqueName}`;

    const { error } = await supabase.storage
      .from('inquiry-images')
      .upload(filePath, compressedBlob, {
        cacheControl: '31536000', // 1 year cache for static assets
        contentType: compressedBlob.type,
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }

    // The bucket is private. Store only the object path; an authorized backend or
    // project owner can create a short-lived signed URL when reviewing the lead.
    return filePath;
  } catch (error) {
    console.error('Failed to upload image to Supabase Storage:', error);
    throw error;
  }
}

/**
 * Insert a new Inquiry into the 'inquiries' table in Supabase
 */
export async function saveInquiryToSupabase(inquiry: Inquiry): Promise<{ success: boolean; data?: any; error?: any }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase is not configured.') };
  }

  try {
    // 1. Upload placement photo if present and in base64 format
    let uploadedPlacementPhoto = inquiry.placementPhoto;
    if (inquiry.placementPhoto && inquiry.placementPhoto.startsWith('data:image/')) {
      uploadedPlacementPhoto = await uploadImageToSupabase(inquiry.placementPhoto, `placement-${inquiry.id}`);
    }

    // 2. Upload reference images if present and in base64 format
    const sourceImages = inquiry.referenceImages || (inquiry.referenceImage ? [inquiry.referenceImage] : []);
    const uploadedReferenceImages = await Promise.all(sourceImages.map((img, index) =>
      img.startsWith('data:image/')
        ? uploadImageToSupabase(img, `ref-${inquiry.id}-${index + 1}`)
        : Promise.resolve(img)
    ));

    // 3. Save record to PostgreSQL database
    const payload = {
      id: inquiry.id,
      full_name: inquiry.fullName,
      email: inquiry.email,
      phone: inquiry.phone,
      instagram: inquiry.instagram || null,
      preferred_contact_method: inquiry.preferredContactMethod || 'whatsapp',
      style: inquiry.style,
      color_type: inquiry.colorType || 'black_and_grey',
      placement: inquiry.placement,
      placement_photo: uploadedPlacementPhoto || null,
      size_cm: inquiry.sizeCm,
      description: inquiry.description,
      reference_images: uploadedReferenceImages,
      reference_image: uploadedReferenceImages[0] || null,
      status: inquiry.status || 'pending',
      created_at: inquiry.createdAt || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inquiries')
      .insert([payload]);

    if (error) {
      console.error('Supabase DB Insert Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting inquiry to Supabase:', error);
    return { success: false, error };
  }
}

/**
 * Fetch all Inquiries from Supabase with performance limit to prevent db overload
 */
export async function fetchInquiriesFromSupabase(limit: number = 100): Promise<Inquiry[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch inquiries from Supabase:', error);
      return [];
    }

    return (data || []).map((row: any): Inquiry => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      instagram: row.instagram,
      preferredContactMethod: row.preferred_contact_method,
      style: row.style,
      colorType: row.color_type,
      placement: row.placement,
      placementPhoto: row.placement_photo,
      sizeCm: row.size_cm,
      description: row.description,
      referenceImage: row.reference_image,
      referenceImages: row.reference_images || (row.reference_image ? [row.reference_image] : []),
      status: row.status,
      artistNotes: row.artist_notes,
      medicalNotes: row.medical_notes,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error('Error in fetchInquiriesFromSupabase:', error);
    return [];
  }
}

/**
 * Update an inquiry status in Supabase
 */
export async function updateInquiryStatusInSupabase(id: string, status: Inquiry['status']): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Failed to update status in Supabase:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in updateInquiryStatusInSupabase:', error);
    return false;
  }
}

/**
 * Delete an inquiry from Supabase
 */
export async function deleteInquiryFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete inquiry from Supabase:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in deleteInquiryFromSupabase:', error);
    return false;
  }
}

/**
 * Update inquiry artist notes in Supabase
 */
export async function updateInquiryNotesInSupabase(id: string, artistNotes: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('inquiries')
      .update({ artist_notes: artistNotes })
      .eq('id', id);

    if (error) {
      console.error('Failed to update notes in Supabase:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in updateInquiryNotesInSupabase:', error);
    return false;
  }
}

export interface AdminSettings {
  id?: string;
  adminPasscode?: string;
  recoveryEmail?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metaPixelId?: string;
  googleAnalyticsId?: string;
  instagramUsername?: string;
  instagramWidgetUrl?: string;
  mapOpenHour?: number;
  mapCloseHour?: number;
  mapScheduleText?: string;
  mapAddressLine1?: string;
  mapAddressLine2?: string;
  mapGoogleMapsUrl?: string;
  customTranslations?: Record<string, Record<string, string>>;
  updatedAt?: string;
}

/**
 * Fetch Admin Settings (including the passcode) from Supabase
 */
export async function fetchAdminSettingsFromSupabase(): Promise<AdminSettings | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.warn('Admin settings table not yet created or inaccessible:', error);
      return null;
    }

    if (!data) return null;

    // Cache passcode and recovery email in localStorage for offline resilience
    if (data.admin_passcode) {
      localStorage.setItem('hans_admin_passcode', data.admin_passcode);
    }
    if (data.recovery_email) {
      localStorage.setItem('hans_recovery_email', data.recovery_email);
    }
    if (data.custom_translations) {
      localStorage.setItem('hans_custom_translations', JSON.stringify(data.custom_translations));
    }

    return {
      id: data.id,
      adminPasscode: data.admin_passcode,
      recoveryEmail: data.recovery_email,
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
      seoKeywords: data.seo_keywords,
      metaPixelId: data.meta_pixel_id,
      googleAnalyticsId: data.google_analytics_id,
      instagramUsername: data.instagram_username,
      instagramWidgetUrl: data.instagram_widget_url,
      mapOpenHour: Number(data.map_open_hour || 11),
      mapCloseHour: Number(data.map_close_hour || 20),
      mapScheduleText: data.map_schedule_text,
      mapAddressLine1: data.map_address_line1,
      mapAddressLine2: data.map_address_line2,
      mapGoogleMapsUrl: data.map_google_maps_url,
      customTranslations: data.custom_translations || {},
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in fetchAdminSettingsFromSupabase:', error);
    return null;
  }
}

/**
 * Save Admin Settings (including new passcode) to Supabase
 */
export async function saveAdminSettingsToSupabase(settings: Partial<AdminSettings>): Promise<boolean> {
  if (!supabase) return false;

  try {
    const payload: any = {
      id: 'main',
      updated_at: new Date().toISOString()
    };

    if (settings.adminPasscode !== undefined) payload.admin_passcode = settings.adminPasscode;
    if (settings.recoveryEmail !== undefined) payload.recovery_email = settings.recoveryEmail;
    if (settings.seoTitle !== undefined) payload.seo_title = settings.seoTitle;
    if (settings.seoDescription !== undefined) payload.seo_description = settings.seoDescription;
    if (settings.seoKeywords !== undefined) payload.seo_keywords = settings.seoKeywords;
    if (settings.metaPixelId !== undefined) payload.meta_pixel_id = settings.metaPixelId;
    if (settings.googleAnalyticsId !== undefined) payload.google_analytics_id = settings.googleAnalyticsId;
    if (settings.instagramUsername !== undefined) payload.instagram_username = settings.instagramUsername;
    if (settings.instagramWidgetUrl !== undefined) payload.instagram_widget_url = settings.instagramWidgetUrl;
    if (settings.mapOpenHour !== undefined) payload.map_open_hour = settings.mapOpenHour;
    if (settings.mapCloseHour !== undefined) payload.map_close_hour = settings.mapCloseHour;
    if (settings.mapScheduleText !== undefined) payload.map_schedule_text = settings.mapScheduleText;
    if (settings.mapAddressLine1 !== undefined) payload.map_address_line1 = settings.mapAddressLine1;
    if (settings.mapAddressLine2 !== undefined) payload.map_address_line2 = settings.mapAddressLine2;
    if (settings.mapGoogleMapsUrl !== undefined) payload.map_google_maps_url = settings.mapGoogleMapsUrl;
    if (settings.customTranslations !== undefined) payload.custom_translations = settings.customTranslations;

    const { error } = await supabase
      .from('admin_settings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Failed to save admin settings to Supabase:', error);
      return false;
    }

    if (settings.adminPasscode) {
      localStorage.setItem('hans_admin_passcode', settings.adminPasscode);
    }
    return true;
  } catch (error) {
    console.error('Error in saveAdminSettingsToSupabase:', error);
    return false;
  }
}

/**
 * Verify Admin Passcode dynamically against Supabase (No hardcoded passwords in code!)
 */
export async function verifyAdminPasscodeFromSupabase(inputPasscode: string): Promise<boolean> {
  const cleanInput = inputPasscode.trim();
  if (!cleanInput) return false;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('admin_passcode')
        .eq('id', 'main')
        .maybeSingle();

      if (!error && data && data.admin_passcode) {
        // Cache the verified passcode in localStorage
        localStorage.setItem('hans_admin_passcode', data.admin_passcode);
        return data.admin_passcode === cleanInput || data.admin_passcode.toLowerCase() === cleanInput.toLowerCase();
      }
    } catch (err) {
      console.warn('Supabase online check failed, falling back to local verification:', err);
    }
  }

  // Fallback to locally stored passcode (initialized when admin logged in)
  const stored = localStorage.getItem('hans_admin_passcode');
  if (stored) {
    return stored === cleanInput || stored.toLowerCase() === cleanInput.toLowerCase();
  }

  return false;
}

/**
 * Save subscriber to Supabase
 */
export async function saveSubscriberToSupabase(email: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('subscribers')
      .upsert({
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email: email.trim().toLowerCase(),
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (error) {
      console.error('Failed to save subscriber to Supabase:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in saveSubscriberToSupabase:', error);
    return false;
  }
}

/**
 * Fetch all subscribers from Supabase
 */
export async function fetchSubscribersFromSupabase(): Promise<string[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('email')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch subscribers from Supabase:', error);
      return [];
    }

    return (data || []).map((row: any) => row.email).filter(Boolean);
  } catch (error) {
    console.error('Error in fetchSubscribersFromSupabase:', error);
    return [];
  }
}

/**
 * Delete subscriber from Supabase
 */
export async function deleteSubscriberFromSupabase(email: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('email', email.trim().toLowerCase());

    if (error) {
      console.error('Failed to delete subscriber from Supabase:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in deleteSubscriberFromSupabase:', error);
    return false;
  }
}
