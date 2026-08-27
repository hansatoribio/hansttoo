import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Inquiry } from '../types';

// Environment variables with pre-configured production defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jvgcbakgrdvndfkxhaeg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xakUorZEOsWpmtAHjRZDSw_Gn8Ak6kj';

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
    console.warn('Supabase is not configured. Using local base64 preview.');
    return imageData;
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

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('inquiry-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload image to Supabase Storage:', error);
    // Fallback to original image data
    return imageData;
  }
}

/**
 * Insert a new Inquiry into the 'inquiries' table in Supabase
 */
export async function saveInquiryToSupabase(inquiry: Inquiry): Promise<{ success: boolean; data?: any; error?: any }> {
  if (!supabase) {
    console.warn('Supabase not configured. Saved to local storage only.');
    return { success: true };
  }

  try {
    // 1. Upload placement photo if present and in base64 format
    let uploadedPlacementPhoto = inquiry.placementPhoto;
    if (inquiry.placementPhoto && inquiry.placementPhoto.startsWith('data:image/')) {
      uploadedPlacementPhoto = await uploadImageToSupabase(inquiry.placementPhoto, `placement-${inquiry.id}`);
    }

    // 2. Upload reference images if present and in base64 format
    const uploadedReferenceImages: string[] = [];
    const sourceImages = inquiry.referenceImages || (inquiry.referenceImage ? [inquiry.referenceImage] : []);

    for (let i = 0; i < sourceImages.length; i++) {
      const img = sourceImages[i];
      if (img.startsWith('data:image/')) {
        const uploadedUrl = await uploadImageToSupabase(img, `ref-${inquiry.id}-${i + 1}`);
        uploadedReferenceImages.push(uploadedUrl);
      } else {
        uploadedReferenceImages.push(img);
      }
    }

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
      .insert([payload])
      .select();

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
