/**
 * Helper utility to detect if a URL references a video file or format.
 */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Base64 video types
  if (url.startsWith('data:video/')) return true;
  
  // Standard video extensions
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v', '.quicktime'];
  if (videoExtensions.some(ext => cleanUrl.endsWith(ext))) return true;
  
  // Detect standard video hosting or file formats
  if (url.includes('drive.google.com') && (url.includes('video') || url.includes('mp4') || url.includes('mov'))) {
    return true;
  }
  
  return false;
}

/**
 * Parses Google Drive links and returns a preview-friendly iframe embed URL.
 */
export function getGoogleDriveEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  if (!url.includes('drive.google.com')) return null;
  
  // Extract file ID from standard patterns
  const match = url.match(/\/file\/d\/([^\/]+)/) || url.match(/[?&]id=([^&]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  
  return null;
}
