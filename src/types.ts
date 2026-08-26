export type Language = 'en' | 'es';

export type TattooStyle = 'fineline' | 'microrealism' | 'anime';

export interface PortfolioItem {
  id: string;
  titleEn: string;
  titleEs: string;
  style: TattooStyle;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  size: string;
  duration: string;
  recoveryDays: number;
  storyEn: string;
  storyEs: string;
  placementEn: string;
  placementEs: string;
  artistNotesEn?: string;
  artistNotesEs?: string;
}

export type InquiryStatus = 'pending' | 'contacted' | 'replied' | 'booked' | 'completed' | 'declined';

export interface Inquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  instagram?: string;
  style: TattooStyle | 'other';
  colorType?: 'black_and_grey' | 'color';
  placement: string;
  sizeCm: number;
  description: string;
  referenceImage?: string | null; // For backward compatibility
  referenceImages: string[]; // Support up to 5 reference images, min 1 required
  placementPhoto?: string | null; // Photo of the placement area
  preferredContactMethod?: 'whatsapp' | 'email';
  status: InquiryStatus;
  createdAt: string;
  artistNotes?: string;
  medicalNotes?: string;
  statusHistory?: { status: InquiryStatus; timestamp: string; note?: string }[];
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  commentEn: string;
  commentEs: string;
  tattooTypeEn: string;
  tattooTypeEs: string;
  date: string;
}
