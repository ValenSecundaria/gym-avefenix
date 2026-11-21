import type { GymBrandConfig } from "./brand.types";

export * from "./brand.types";

export const GYM_BRAND_CONFIG: GymBrandConfig = {
  identity: {
    name: "TRAINING UP! Gym",
    shortName: "training up",
    heroTitle: "Entrená en TRAINING UP! Gym",
    heroSubtitle: "Musculación, Entrenamiento Funcional y Fuerza • Bahía Blanca",
    footerTagline:
      "Centro de entrenamiento, musculación y fuerza en Bahía Blanca equipado para tu progreso diario.",
    city: "Bahía Blanca",
    subdivision: "Bahía Blanca",
  },
  contact: {
    defaultWhatsapp: "5492914720786",
    address: "Zelarrayán 1251, Bahía Blanca",
    googleMapsUrl:
      "https://www.google.com/maps/place/Training+Up/@-38.7061282,-62.2841522,17z/data=!4m6!3m5!1s0x95eda352cebd35e3:0xc247d39c3ac8358c!8m2!3d-38.7059398!4d-62.2785731!16s%2Fg%2F11b7jy1lq2?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
    instagramUrl: "https://www.instagram.com/trainingupgym/?hl=es",
    instagramHandle: "@trainingupgym",
    schedule: [
      { days: "Lunes a Viernes", hours: "06:30 a 22:00 hs" },
      { days: "Sábados", hours: "16:00 a 19:00 hs" },
      { days: "Domingos y Feriados", hours: "Cerrado" },
    ],
  },
  assets: {
    logoMain: "/brand/Logo-trainingUP.png",
    logoLogin: "/brand/Logo-trainingUP.png",
    logoCheckIn: "/brand/Logo-trainingUP.png",
    heroCover: "/brand/instalaciones (5).png",
    tutorialsPlaylistUrl: "",
    galleryImages: [
      {
        src: "/brand/instalaciones (1).png",
        alt: "Instalaciones de Training UP! - Zona de entrenamiento",
        title: "Zona de Entrenamiento",
        category: "Comunidad",
        description: "Espacio amplio y equipado para entrenamientos de fuerza y acondicionamiento.",
      },
      {
        src: "/brand/instalaciones (2).png",
        alt: "Instalaciones de Training UP! - Musculación",
        title: "Sala de Musculación",
        category: "Musculación",
        description: "Equipamiento de musculación, bancos y peso libre para todos los niveles.",
      },
      {
        src: "/brand/instalaciones (3).png",
        alt: "Instalaciones de Training UP! - Fuerza y Peso Libre",
        title: "Fuerza y Peso Libre",
        category: "Musculación",
        description: "Racks, barras y discos calibrados para progresar de forma segura.",
      },
      {
        src: "/brand/instalaciones (4).png",
        alt: "Instalaciones de Training UP! - Funcional y Cardio",
        title: "Funcional y Cardio",
        category: "Funcional",
        description: "Sector preparado para circuitos metabólicos y resistencia cardiovascular.",
      },
      {
        src: "/brand/instalaciones (5).png",
        alt: "Instalaciones de Training UP! - Vista general",
        title: "Vista General del Gimnasio",
        category: "Cardio",
        description: "Ambiente preparado para entrenar con seguimiento profesional diario.",
      },
    ],
  },
  theme: {
    bgCanvas: "#09090B",
    surface: "#141417",
    border: "#27272A",
    primary: "#E11D48",
    primaryHover: "#BE123C",
    alert: "#DC2626",
    warning: "#F59E0B",
    textPrimary: "#FAFAFA",
    textSecondary: "#A1A1AA",
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
