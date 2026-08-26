import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Inquiry } from '../types';

// Environment variables with pre-configured production defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jvgcbakgrdvndfkxhaeg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xakUorZEOsWpmtAHjRZDSw_Gn8Ak6kj';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Convert base64 data to Blob for upload
function base64ToBlob(base64Data: string): Blob {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Upload an image (base64 string or File) to Supabase Storage bucket ('inquiry-images')
 */
export async function uploadImageToSupabase(imageData: string, fileNamePrefix: string = 'ref'): Promise<string> {
  if (!supabase) {
    console.warn('Supabase is not configured. Using local base64 preview.');
    return imageData;
  }

  try {
    const isBase64 = imageData.startsWith('data:image/');
    let fileBody: Blob | File;
    let ext = 'jpg';

    if (isBase64) {
      fileBody = base64ToBlob(imageData);
      const mimeMatch = imageData.match(/data:image\/([a-zA-Z0-9+]+);base64,/);
      if (mimeMatch && mimeMatch[1]) {
        ext = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];
      }
    } else {
      // If it's already a URL, return it
      return imageData;
    }

    const uniqueName = `${fileNamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `uploads/${uniqueName}`;

    const { data, error } = await supabase.storage
      .from('inquiry-images')
      .upload(filePath, fileBody, {
        cacheControl: '3600',
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
 * Fetch all Inquiries from Supabase
 */
export async function fetchInquiriesFromSupabase(): Promise<Inquiry[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

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
