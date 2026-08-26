import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required Scopes for Sheets and Drive
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If logged in but no token in memory, we need to sign in again to get fresh credentials
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Credentials.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('OAuth Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Helper to convert base64 to Blob
export function base64ToBlob(base64Data: string): Blob {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

// Upload a single Base64 image to Google Drive and return the shareable webViewLink
export async function uploadImageToDrive(base64Str: string, fileName: string): Promise<string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No Google access token available. Please sign in.');
  }

  const blob = base64ToBlob(base64Str);
  const metadata = {
    name: fileName,
    mimeType: blob.type,
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Drive upload failed: ${errText}`);
  }

  const data = await res.json();

  // Make file publicly readable by anyone so Hans can click/view the image
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (err) {
    console.error('Failed to make file publicly viewable:', err);
  }

  return data.webViewLink || data.webContentLink || `https://drive.google.com/file/d/${data.id}/view`;
}

// Locate or Create "Hans Tattoo Inquiries" Google Sheet and return its ID
export async function getOrCreateSpreadsheet(): Promise<string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No Google access token available. Please sign in.');
  }

  const sheetName = 'Hans Tattoo Inquiries';

  // 1. Search for existing spreadsheet
  const query = encodeURIComponent(`name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!searchRes.ok) {
    throw new Error(`Failed to search Google Drive: ${await searchRes.text()}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 2. Create new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: sheetName,
      },
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create Google Sheet: ${await createRes.text()}`);
  }

  const newSheet = await createRes.json();
  const spreadsheetId = newSheet.spreadsheetId;

  // 3. Initialize headers
  const headers = [
    'Date / Fecha',
    'Full Name / Nombre',
    'Email',
    'Phone / WhatsApp',
    'Instagram',
    'Style / Estilo',
    'Color Type / Tipo de Color',
    'Size (cm) / Tamaño',
    'Placement / Zona',
    'Description / Descripción',
    'Reference Image Links / Imágenes de Referencia',
    'Status / Estado',
    'Inquiry ID'
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:M1?valueInputOption=RAW`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [headers],
    }),
  });

  return spreadsheetId;
}

// Sync inquiry data to Sheets and upload images to Google Drive
export async function syncInquiryToGoogleSheets(inquiry: {
  fullName: string;
  email: string;
  phone?: string;
  instagram?: string;
  style: string;
  colorType?: string;
  sizeCm: number;
  placement: string;
  description: string;
  referenceImages?: string[];
  referenceImage?: string;
  id: string;
  createdAt: string;
  status: string;
}, onProgress?: (msg: string) => void): Promise<{ spreadsheetId: string; driveLinks: string[] }> {
  
  onProgress?.('Locating or creating Google Sheet...');
  const spreadsheetId = await getOrCreateSpreadsheet();

  const rawImages = inquiry.referenceImages && inquiry.referenceImages.length > 0 
    ? inquiry.referenceImages 
    : inquiry.referenceImage 
      ? [inquiry.referenceImage] 
      : [];

  const driveLinks: string[] = [];

  // Upload reference images to Google Drive
  for (let i = 0; i < rawImages.length; i++) {
    onProgress?.(`Uploading image ${i + 1} of ${rawImages.length} to Google Drive...`);
    try {
      const imgUrl = rawImages[i];
      // Only upload if it is a base64 string
      if (imgUrl.startsWith('data:image/')) {
        const name = `${inquiry.fullName.replace(/\s+/g, '_')}_ref_${i + 1}_${Date.now()}.png`;
        const driveLink = await uploadImageToDrive(imgUrl, name);
        driveLinks.push(driveLink);
      } else {
        // If it's already an external URL, keep it
        driveLinks.push(imgUrl);
      }
    } catch (err) {
      console.error(`Failed to upload image ${i + 1}:`, err);
      driveLinks.push('(Upload failed)');
    }
  }

  onProgress?.('Saving details to Google Sheets...');
  const token = getAccessToken();
  const rowValues = [
    new Date(inquiry.createdAt || Date.now()).toLocaleString(),
    inquiry.fullName,
    inquiry.email,
    inquiry.phone || '',
    inquiry.instagram || '',
    inquiry.style,
    inquiry.colorType || 'black_and_grey',
    `${inquiry.sizeCm} cm`,
    inquiry.placement,
    inquiry.description,
    driveLinks.join('\n'),
    inquiry.status,
    inquiry.id
  ];

  const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:M:append?valueInputOption=RAW`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!appendRes.ok) {
    throw new Error(`Failed to append row to Google Sheets: ${await appendRes.text()}`);
  }

  return { spreadsheetId, driveLinks };
}
