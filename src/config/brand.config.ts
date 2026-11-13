import type { GymBrandConfig } from "./brand.types";

export * from "./brand.types";

export const GYM_BRAND_CONFIG: GymBrandConfig = {
  identity: {
    name: "Gimnasio Ave Fénix",
    shortName: "Ave Fénix",
    heroTitle: "Renacé más fuerte en Ave Fénix",
    heroSubtitle: "Entrenamiento de Fuerza y Rendimiento • Ingeniero White",
    footerTagline: "Centro de alto rendimiento físico y transformación integral en Ingeniero White. Disciplina, fuego y acero guiados por profesionales.",
    city: "Bahía Blanca",
    subdivision: "Ingeniero White",
  },
  contact: {
    defaultWhatsapp: "5492915768403",
    address: "Lautaro 3322, Ingeniero White",
    googleMapsUrl: "https://maps.google.com/?q=Lautaro+3322,+Ingeniero+White,+Buenos+Aires",
    instagramUrl: "https://www.instagram.com/avefenix.gimnasio/",
    instagramHandle: "@avefenix.gimnasio",
    facebookUrl: "https://www.facebook.com/",
    schedule: [
      { days: "Lunes a Viernes", hours: "07:00 a 22:00 hs" },
      { days: "Sábados", hours: "09:00 a 13:00 hs" },
      { days: "Domingos y Feriados", hours: "Cerrado" },
    ],
  },
  assets: {
    logoMain: "/brand/logo.png",
    logoLogin: "/brand/logo.png",
    logoCheckIn: "/brand/logo.png",
    heroCover: "/brand/hero-cover.png",
    tutorialsPlaylistUrl: "https://www.youtube.com/playlist?list=PLTYOY-m8hANk",
    galleryImages: [
      {
        src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
        alt: "Sector Musculación y Peso Libre",
        title: "Sector Musculación y Peso Libre",
        category: "Musculación",
        description: "Racks olímpicos, barras calibradas y mancuernas de alto gramaje para fuerza pura.",
      },
      {
        src: "/brand/gallery/profesores.jpeg",
        alt: "Equipo de Profesores",
        title: "Equipo de Profesores",
        category: "Comunidad",
        description: "Profesores capacitados para orientar, acompañar y corregir cada una de tus rutinas.",
      },
      {
        src: "/brand/gallery/creemos-en-la-fuerza.jpg",
        alt: "Máquinas Biomecánicas Guiadas",
        title: "Máquinas Biomecánicas Guiadas",
        category: "Musculación",
        description: "Equipamiento biomecánico regulable para aislamiento muscular con máxima seguridad.",
      },
      {
        src: "/brand/gallery/staff.jpeg",
        alt: "Parte del Staff técnico",
        title: "Parte del Staff técnico",
        category: "Cardio",
        description: "Cintas de correr y bicicletas para resistencia cardiovascular y quema calórica.",
      },
      {
        src: "/brand/logo-badge.jpg",
        alt: "Identidad del gimnasio",
        title: "Un símbolo que refleja la historia y personalidad del gimnasio",
        category: "Comunidad",
        description: "Compañerismo, superación constante y asesoramiento continuo de los profes.",
      },
    ],
  },
  theme: {
    bgCanvas: "#0B0B0C",
    surface: "#17171C",
    border: "#2C2D35",
    primary: "#F95716",
    alert: "#D92614",
    warning: "#FFB300",
    textPrimary: "#F4F5F7",
    textSecondary: "#8A909A",
    success: "#10B981",
    whatsapp: "#25D366",
  },
  messages: {
    expiredPlan: ({ memberName, planName, validUntil }) =>
      `¡Hola ${memberName}! Te escribimos de ${GYM_BRAND_CONFIG.identity.name} para recordarte que tu cuota${
        planName ? ` del plan ${planName}` : ""
      }${validUntil ? ` venció el ${validUntil}` : ""}. ¡Te esperamos en recepción para renovarla!`,
    absentMember: ({ memberName, daysAbsent }) =>
      `¡Hola ${memberName}! Te escribimos de ${GYM_BRAND_CONFIG.identity.name}. Hace ${daysAbsent} días que no te vemos entrenar y queríamos saber cómo estás. ¡Te esperamos esta semana para retomar con toda la energía!`,
    generalInquiry: (params) => {
      if (params?.planName) {
        return `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por el plan ${params.planName}${
          params.price ? ` (${params.price})` : ""
        }.`;
      }
      if (params?.topic) {
        return `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por ${params.topic}.`;
      }
      return `Hola ${GYM_BRAND_CONFIG.identity.name}! Me gustaría recibir más información acerca de los horarios y planes.`;
    },
  },
};
