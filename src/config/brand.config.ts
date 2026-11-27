import type { GymBrandConfig } from "./brand.types";

export * from "./brand.types";

export const GYM_BRAND_CONFIG: GymBrandConfig = {
  identity: {
    name: "EJERCICIO SALUD GYM",
    shortName: "SALUD GYM",
    heroTitle: "Entrená tu fuerza. Potenciá tu salud cada día.",
    heroSubtitle:
      "Musculación, Entrenamiento Funcional & HIIT en Estomba 1364 • Lunes a Viernes de 08:00 a 22:00 hs",
    footerTagline: "© Valentin Gemetro - Todos los derechos reservados",
    city: "Bahía Blanca",
    subdivision: "Bahía Blanca",
  },
  contact: {
    defaultWhatsapp: "",
    address: "Estomba 1364",
    googleMapsUrl:
      "https://www.google.com/maps/place/EJERCICIO+SALUD+GYM/@-38.7069358,-62.2818978,18z/data=!4m6!3m5!1s0x95edbb5c23178399:0x234f633dc0755590!8m2!3d-38.706492!4d-62.2819539!16s%2Fg%2F11x95j5nth?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D",
    instagramUrl: "",
    instagramHandle: "",
    schedule: [
      { days: "Lunes a Viernes", hours: "08:00 a 22:00 hs" },
      { days: "Sábados", hours: "Cerrado" },
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
        src: "/brand/gallery/musculacion-fuerza.png",
        alt: "EJERCICIO SALUD GYM - Sala de Musculación y Peso Libre",
        title: "Sala de Musculación y Fuerza",
        category: "Musculación",
        description:
          "Equipamiento guiado, bancos y peso libre preparados para ganar fuerza de forma progresiva y segura.",
      },
      {
        src: "/brand/gallery/funcional-hiit.png",
        alt: "EJERCICIO SALUD GYM - Sector Funcional y HIIT",
        title: "Entrenamiento Funcional & HIIT",
        category: "Funcional",
        description:
          "Circuitos dinámicos de alta intensidad orientados a potencia, coordinación y gasto calórico.",
      },
      {
        src: "/brand/gallery/salud-movilidad.png",
        alt: "EJERCICIO SALUD GYM - Salud, Postura y Acondicionamiento",
        title: "Salud Activa y Readaptación",
        category: "Comunidad",
        description:
          "Acompañamiento docente continuo para mejorar movilidad, postura y calidad de vida diaria.",
      },
      {
        src: "/brand/gallery/cardio-resistencia.png",
        alt: "EJERCICIO SALUD GYM - Zona Cardio y Resistencia",
        title: "Zona Cardio y Resistencia",
        category: "Cardio",
        description:
          "Sector aeróbico para entrada en calor, salud cardiovascular y resistencia sostenida.",
      },
    ],
  },
  theme: {
    bgCanvas: "#0A0A0B",
    surface: "#161618",
    border: "#2A2A2E",
    primary: "#E52521",
    primaryHover: "#B91C1C",
    alert: "#DC2626",
    warning: "#F59E0B",
    textPrimary: "#F8FAFC",
    textSecondary: "#9CA3AF",
    success: "#10B981",
    whatsapp: "#25D366",
  },
  messages: {
    expiredPlan: ({ memberName, planName, validUntil }) =>
      `¡Hola ${memberName}! Te escribimos de ${GYM_BRAND_CONFIG.identity.name} (Estomba 1364) para recordarte que tu cuota${
        planName ? ` del plan ${planName}` : ""
      }${validUntil ? ` venció el ${validUntil}` : ""}. ¡Te esperamos de lunes a viernes de 08:00 a 22:00 hs para renovarla!`,
    absentMember: ({ memberName, daysAbsent }) =>
      `¡Hola ${memberName}! Te escribimos de ${GYM_BRAND_CONFIG.identity.name}. Hace ${daysAbsent} días que no te vemos entrenar por Estomba 1364 y queríamos saber cómo estás. ¡Te esperamos de lunes a viernes para retomar!`,
    generalInquiry: (params) => {
      if (params?.planName) {
        return `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por el plan ${params.planName}${
          params.price ? ` (${params.price})` : ""
        }.`;
      }
      if (params?.topic) {
        return `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por ${params.topic}.`;
      }
      return `Hola ${GYM_BRAND_CONFIG.identity.name}! Me gustaría recibir información sobre planes y horarios en Estomba 1364.`;
    },
  },
};
