import { Inquiry, PortfolioItem, Review } from './types';

// Portfolio media is intentionally empty until original, verified image files are
// supplied. Stock imagery must never be presented as Hans's tattoo work.
export const initialPortfolioItems: PortfolioItem[] = [];

// Reviews must be added only from a source Hans can verify. No demo testimonials
// are shipped on the public site.
export const initialReviews: Review[] = [];

// Keep production and local admin views free of fabricated client records.
export const initialDemoLeads: Inquiry[] = [];
