export interface BrandGalleryItem {
  src: string;
  alt: string;
  title: string;
  description: string;
  category?: "Musculación" | "Funcional" | "Cardio" | "Comunidad";
}

export interface ScheduleEntry {
  days: string;
  hours: string;
}

export interface GymBrandConfig {
  identity: {
    name: string;
    shortName: string;
    heroTitle: string;
    heroSubtitle: string;
    footerTagline: string;
    city: string;
    subdivision: string;
  };
  contact: {
    defaultWhatsapp: string;
    address: string;
    googleMapsUrl: string;
    instagramUrl: string;
    instagramHandle: string;
    facebookUrl?: string;
    schedule: ScheduleEntry[];
  };
  assets: {
    logoMain: string;
    logoLogin: string;
    logoCheckIn: string;
    heroCover: string;
    tutorialsPlaylistUrl: string;
    galleryImages: BrandGalleryItem[];
  };
  theme: {
    bgCanvas: string;
    surface: string;
    border: string;
    primary: string;
    alert: string;
    warning: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    whatsapp: string;
  };
  messages: {
    expiredPlan: (params: { memberName: string; planName?: string; validUntil?: string }) => string;
    absentMember: (params: { memberName: string; daysAbsent: number }) => string;
    generalInquiry: (params?: { topic?: string; planName?: string; price?: string }) => string;
  };
}
