import type { GymBrandConfig } from "./brand.types";

export * from "./brand.types";

export const GYM_BRAND_CONFIG: GymBrandConfig = {
  identity: {
    name: "LA ROCA GYM",
    shortName: "Roca GYM",
    heroTitle: "Forjá tu fuerza en hierro real. Disciplina sin excusas.",
    heroSubtitle:
      "Musculación, Peso Libre, Máquinas y Acondicionamiento en Córdoba 535 • Doble turno Lun a Vie y Sábados",
    footerTagline: "© Valentin Gemetro - Todos los derechos reservados",
    city: "Bahía Blanca",
    subdivision: "Bahía Blanca",
  },
  contact: {
    defaultWhatsapp: "5492915175675",
    address: "Córdoba 535",
    googleMapsUrl:
      "https://www.google.com/maps/place/La+Roca+Gym/@-38.7033051,-62.2770293,17z/data=!4m9!1m2!2m1!1sgimansio!3m5!1s0x95edbb505c283269:0x916b658f3ae65b4c!8m2!3d-38.7019641!4d-62.2726284!16s%2Fg%2F1vxcxm1c?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D",
    instagramUrl: "",
    instagramHandle: "",
    schedule: [
      { days: "Lunes a Viernes", hours: "07:30 a 11:30 hs • 19:00 a 23:00 hs" },
      { days: "Sábados", hours: "19:00 a 21:00 hs" },
      { days: "Domingos", hours: "Cerrado" },
    ],
  },
  assets: {
    logoMain: "/brand/logo.png",
    logoLogin: "/brand/logo.png",
    logoCheckIn: "/brand/logo.png",
    heroCover: "/brand/hero-cover.png",
    tutorialsPlaylistUrl: "",
    galleryImages: [
      {
        src: "/brand/gallery/peso-libre-racks.png",
        alt: "LA ROCA GYM - Sector de Racks Olímpicos y Peso Libre",
        title: "Racks Olímpicos y Peso Libre",
        category: "Musculación",
        description:
          "Jaulas de potencia, bancos planos e inclinados, barras olímpicas y mancuernas pesadas para trabajo de fuerza real.",
      },
      {
        src: "/brand/gallery/maquinas-musculacion.png",
        alt: "LA ROCA GYM - Parque de Máquinas y Poleas",
        title: "Máquinas Guiadas y Poleas",
        category: "Musculación",
        description:
          "Prensas, dorsaleras, cruces de poleas y equipamiento biomecánico en acero industrial para hipertrofia segura.",
      },
      {
        src: "/brand/gallery/potencia-funcional.png",
        alt: "LA ROCA GYM - Pista de Potencia y Acondicionamiento",
        title: "Potencia y Acondicionamiento",
        category: "Funcional",
        description:
          "Corredor de empuje, kettlebells, sogas y estructura funcional para trabajo metabólico, zona media y potencia.",
      },
      {
        src: "/brand/gallery/cardio-preparacion.png",
        alt: "LA ROCA GYM - Sector Cardio y Entrada en Calor",
        title: "Sector Cardio y Activación",
        category: "Cardio",
        description:
          "Cintas comerciales, air bikes y remos ergómetros para activación previa, resistencia aeróbica y recuperación.",
      },
    ],
  },
  theme: {
    bgCanvas: "#0A0B0D",
    surface: "#16181D",
    border: "#2A2E37",
    primary: "#EAB308",
    primaryHover: "#CA8A04",
    alert: "#DC2626",
    warning: "#F97316",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    success: "#10B981",
    whatsapp: "#25D366",
  },
  messages: {
    expiredPlan: ({ memberName, planName, validUntil }) =>
      `¡Hola ${memberName}! Te escribimos de ${GYM_BRAND_CONFIG.identity.name} (Córdoba 535) para recordarte que tu cuota${
        planName ? ` del plan ${planName}` : ""
      }${validUntil ? ` venció el ${validUntil}` : ""}. ¡Te esperamos en recepción para renovarla y seguir entrenando!`,
    absentMember: ({ memberName, daysAbsent }) =>
      `¡Hola ${memberName}! Te escribimos de ${GYM_BRAND_CONFIG.identity.name}. Hace ${daysAbsent} días que no te vemos entrenar por Córdoba 535 y queríamos saber cómo estás. ¡Te esperamos esta semana para retomar con todo!`,
    generalInquiry: (params) => {
      if (params?.planName) {
        return `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por el plan ${params.planName}${
          params.price ? ` (${params.price})` : ""
        }.`;
      }
      if (params?.topic) {
        return `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por ${params.topic}.`;
      }
      return `Hola ${GYM_BRAND_CONFIG.identity.name}! Me gustaría recibir información sobre planes y horarios en Córdoba 535.`;
    },
  },
};
