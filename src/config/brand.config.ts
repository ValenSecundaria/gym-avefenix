import type { GymBrandConfig } from "./brand.types";

export * from "./brand.types";

export const GYM_BRAND_CONFIG: GymBrandConfig = {
  identity: {
    name: "Punto Bahia GYM",
    shortName: "Punto Bahia",
    heroTitle: "Entrená en Punto Bahia GYM",
    heroSubtitle: "Musculación, Entrenamiento Funcional y Fuerza • Bahía Blanca",
    footerTagline:
      "Centro de entrenamiento, musculación y fuerza en Bahía Blanca con dos sedes equipadas para tu progreso diario.",
    city: "Bahía Blanca",
    subdivision: "Bahía Blanca",
  },
  contact: {
    defaultWhatsapp: "",
    address: "Mitre 1134 y Holdich 350, Bahía Blanca",
    googleMapsUrl:
      "https://www.google.com/maps/place/punto+bahia+gym/@-38.7061776,-62.2791033,17z/data=!3m1!4b1!4m6!3m5!1s0x95edbb584b2dd427:0xd4a928099719c7a0!8m2!3d-38.7061818!4d-62.2765337!16s%2Fg%2F1hf0kmmwz?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
    googleMapsUrlSecondary:
      "https://www.google.com/maps/place/Holdich+350,+B8000+Bah%C3%ADa+Blanca,+Provincia+de+Buenos+Aires/@-38.7163693,-62.2790857,19z/data=!4m6!3m5!1s0x95edbca418f9662b:0x1d5c46f2cea17cb5!8m2!3d-38.7163688!4d-62.2789442!16s%2Fg%2F11h89tgf_n?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
    instagramUrl: "https://www.instagram.com/punto_bahia_gym/?hl=es",
    instagramHandle: "@punto_bahia_gym",
    schedule: [
      { days: "Lunes a Viernes", hours: "06:30 a 22:00 hs" },
      { days: "Sábados", hours: "16:00 a 19:00 hs" },
      { days: "Domingos y Feriados", hours: "Cerrado" },
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
        src: "/brand/gallery/instalacion-1.png",
        alt: "Entrenamiento en suspensión con TRX en Punto Bahia GYM",
        title: "Entrenamiento en Suspensión",
        category: "Funcional",
        description: "Trabajo de fuerza, control corporal y estabilidad con bandas de suspensión.",
      },
      {
        src: "/brand/gallery/instalacion-2.png",
        alt: "Socios entrenando en musculación y fuerza en Punto Bahia GYM",
        title: "Comunidad en Acción",
        category: "Comunidad",
        description: "Entrenamiento diario para todos los niveles con acompañamiento cercano en sala.",
      },
      {
        src: "/brand/gallery/instalacion-3.png",
        alt: "Zona de fuerza y peso libre con barra olímpica en Punto Bahia GYM",
        title: "Fuerza y Peso Libre",
        category: "Musculación",
        description: "Racks, barras y discos calibrados para progresar de forma segura en ejercicios básicos.",
      },
      {
        src: "/brand/gallery/instalacion-4.png",
        alt: "Equipamiento de maquinaria biomecánica en Punto Bahia GYM",
        title: "Maquinaria Biomecánica",
        category: "Musculación",
        description: "Equipos articulados a discos y poleas para estimular cada grupo muscular.",
      },
    ],
  },
  theme: {
    bgCanvas: "#0D0F12",
    surface: "#181B20",
    border: "#383F47",
    primary: "#2563EB",
    primaryHover: "#F97316",
    alert: "#DC2626",
    warning: "#FACC15",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
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
