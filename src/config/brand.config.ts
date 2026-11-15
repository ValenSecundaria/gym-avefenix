import type { GymBrandConfig } from "./brand.types";

export * from "./brand.types";

export const GYM_BRAND_CONFIG: GymBrandConfig = {
  identity: {
    name: "Palestra GYM - Bahia Blanca",
    shortName: "Palestra GYM",
    heroTitle: "Superá tus límites en Palestra GYM",
    heroSubtitle: "Entrenamientos personalizados para mejorar tu Rendimiento • Bahía Blanca",
    footerTagline:
      "Centro de entrenamiento de fuerza, musculación y acondicionamiento físico en Bahía Blanca. Técnica, constancia y acompañamiento profesional.",
    city: "Bahía Blanca",
    subdivision: "Bahía Blanca",
  },
  contact: {
    defaultWhatsapp: "5492914048504",
    address: "Bahía Blanca, Buenos Aires",
    googleMapsUrl:
      "https://www.google.com/maps/place/Palestra+Performance/@-38.7081794,-62.2895166,17z/data=!4m10!1m2!2m1!1sgimnasio!3m6!1s0x95edbb1f6c50842d:0xa9659b49040b74b6!8m2!3d-38.7081793!4d-62.2847527!15sCghnaW1uYXNpb1oKIghnaW1uYXNpb5IBA2d5bZoBJENoZERTVWhOTUc5blMwVkpRMEZuU1VSU2QxOUhMV2wzUlJBQuABAPoBBAgAEEY!16s%2Fg%2F11fm5vtr2w?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
    instagramUrl: "https://www.instagram.com/palestragymbb/",
    instagramHandle: "@palestragymbb",
    schedule: [
      { days: "Lun, Mié y Vie", hours: "07:00 a 21:00 hs" },
      { days: "Martes y Jueves", hours: "08:00 a 21:00 hs" },
      { days: "Sábados", hours: "10:00 a 13:00 hs" },
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
        alt: "Salón Principal de Musculación en Palestra GYM",
        title: "Salón de Musculación",
        category: "Musculación",
        description: "Sector amplio de máquinas guiadas, poleas y equipamiento de entrenamiento completo.",
      },
      {
        src: "/brand/gallery/instalacion-2.png",
        alt: "Zona de Peso Libre y Racks Olímpicos",
        title: "Peso Libre y Fuerza",
        category: "Musculación",
        description: "Barras olímpicas, discos y racks preparados para entrenamiento de fuerza progresiva.",
      },
      {
        src: "/brand/gallery/instalacion-3.png",
        alt: "Área de Entrenamiento Funcional y Movilidad",
        title: "Área Funcional",
        category: "Funcional",
        description: "Espacio dedicado a trabajos metabólicos, coordinación, potencia y acondicionamiento.",
      },
      {
        src: "/brand/gallery/instalacion-4.png",
        alt: "Equipamiento de Tren Superior y Mancuernas",
        title: "Zona de Mancuernas y Bancos",
        category: "Musculación",
        description: "Bancos regulables, mancuernas de distintos kilajes y estaciones para trabajo específico.",
      },
      {
        src: "/brand/gallery/instalacion-5.png",
        alt: "Vista General de Palestra GYM Bahía Blanca",
        title: "Ambiente de Entrenamiento",
        category: "Funcional",
        description: "Instalaciones ordenadas y luminosas para entrenar con comodidad en cada turno.",
      },
    ],
  },
  theme: {
    bgCanvas: "#0B0B0C",
    surface: "#17171C",
    border: "#2C2D35",
    primary: "#0057D9",
    primaryHover: "#0044AB",
    alert: "#DC2626",
    warning: "#FFB300",
    textPrimary: "#F4F5F7",
    textSecondary: "#8A909A",
    success: "#10B981",
    whatsapp: "#25D366",
  },
  messages: {
    expiredPlan: ({ memberName, planName, validUntil }) =>
      `¡Hola ${memberName}! Te escribimos de ${GYM_BRAND_CONFIG.identity.name} para recordarte que tu cuota${planName ? ` del plan ${planName}` : ""
      }${validUntil ? ` venció el ${validUntil}` : ""}. ¡Te esperamos en recepción para renovarla!`,
    absentMember: ({ memberName, daysAbsent }) =>
      `¡Hola ${memberName}! Te escribimos de ${GYM_BRAND_CONFIG.identity.name}. Hace ${daysAbsent} días que no te vemos entrenar y queríamos saber cómo estás. ¡Te esperamos esta semana para retomar con toda la energía!`,
    generalInquiry: (params) => {
      if (params?.planName) {
        return `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por el plan ${params.planName}${params.price ? ` (${params.price})` : ""
          }.`;
      }
      if (params?.topic) {
        return `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por ${params.topic}.`;
      }
      return `Hola ${GYM_BRAND_CONFIG.identity.name}! Me gustaría recibir más información acerca de los horarios y planes.`;
    },
  },
};
