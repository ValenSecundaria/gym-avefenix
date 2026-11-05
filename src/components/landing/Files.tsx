"use client";

import React, { useState, useId } from "react";
import {
    Camera,
    Video,
    X,
    Maximize2,
    Sparkles,
    Layers,
    Dumbbell,
    Flame,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// Estilos de Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type MediaItemType = "image" | "video";

export interface MediaItem {
    id: string;
    type: MediaItemType;
    title: string;
    category: "Musculación" | "Funcional" | "Cardio" | "Comunidad";
    src: string;
    poster?: string;
    description: string;
    featured?: boolean;
}

// Lista estática de fotos y videos de Ave Fénix
const STATIC_MEDIA: MediaItem[] = [
    {
        id: "media-2",
        type: "image",
        title: "Sector Musculación y Peso Libre",
        category: "Musculación",
        src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
        description: "Racks olímpicos, barras calibradas y mancuernas de alto gramaje para fuerza pura.",
    },
    {
        id: "media-profes",
        type: "image",
        title: "Equipo de Profesores Ave Fénix",
        category: "Comunidad",
        src: "/Profes.jpeg",
        description: "Profesores capacitados para orientar, acompañar y corregir cada una de tus rutinas.",
    },
    {
        id: "media-3",
        type: "image",
        title: "Máquinas Biomecánicas Guiadas",
        category: "Musculación",
        src: "/Creemos en la Fuerza.jpg",
        description: "Equipamiento biomecánico regulable para aislamiento muscular con máxima seguridad.",
    },
    {
        id: "media-5",
        type: "image",
        title: "Parte del Staff técnico",
        category: "Cardio",
        src: "/Staff.jpeg",
        description: "Cintas de correr y bicicletas para resistencia cardiovascular y quema calórica.",
    },
    {
        id: "media-6",
        type: "image",
        title: "Un símbolo que refleja la historia y personalidad del gimnasio",
        category: "Comunidad",
        src: "/Logo avefenix.jpg",
        description: "Compañerismo, superación constante y asesoramiento continuo de los profes.",
    },
];

const FILTER_TABS = [
    { id: "all", label: "Todo", icon: Layers },
    { id: "photos", label: "Fotos", icon: Camera },
    { id: "videos", label: "Videos", icon: Video },
    { id: "musculacion", label: "Musculación", icon: Dumbbell },
    { id: "funcional", label: "Funcional", icon: Flame },
] as const;

export function Files() {
    const [activeTab, setActiveTab] = useState<string>("all");
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

    const rawId = useId();
    const instanceId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
    const prevBtnClass = `files-prev-${instanceId}`;
    const nextBtnClass = `files-next-${instanceId}`;
    const paginationClass = `files-pagination-${instanceId}`;

    const filteredMedia = STATIC_MEDIA.filter((item) => {
        if (activeTab === "all") return true;
        if (activeTab === "photos") return item.type === "image";
        if (activeTab === "videos") return item.type === "video";
        if (activeTab === "musculacion") return item.category === "Musculación";
        if (activeTab === "funcional") return item.category === "Funcional";
        return true;
    });

    const renderCard = (item: MediaItem) => {
        if (item.type === "video") {
            return (
                <div className="group relative rounded-2xl bg-[#17171C] border border-[#2C2D35] hover:border-[#F95716]/60 overflow-hidden shadow-lg transition-all flex flex-col h-full">
                    {/* Contenedor del video */}
                    <div className="relative w-full aspect-video bg-black overflow-hidden">
                        <video
                            src={item.src}
                            poster={item.poster}
                            playsInline
                            muted
                            loop
                            autoPlay={false}
                            controls
                            className="w-full h-full object-cover"
                        />

                        {/* Badge tipo video */}
                        <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B0B0C]/80 backdrop-blur-md border border-[#2C2D35] text-[#FFB300] text-xs font-bold uppercase tracking-wider">
                            <Video className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Video</span>
                        </div>

                        {/* Botón flotante para ver en grande */}
                        <button
                            type="button"
                            onClick={() => setSelectedMedia(item)}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-[#0B0B0C]/80 hover:bg-[#F95716] text-[#F4F5F7] border border-[#2C2D35] transition-colors"
                            title="Ampliar video"
                        >
                            <Maximize2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Info del video */}
                    <div className="p-5 flex flex-col justify-between flex-1 gap-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#F95716]">
                                {item.category}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#F4F5F7] group-hover:text-[#F95716] transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#8A909A] leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                </div>
            );
        }

        // Item tipo Imagen
        return (
            <div
                onClick={() => setSelectedMedia(item)}
                className="group relative rounded-2xl bg-[#17171C] border border-[#2C2D35] hover:border-[#F95716]/60 overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col h-full"
            >
                {/* Contenedor de la Imagen */}
                <div className="relative w-full aspect-video overflow-hidden bg-[#0B0B0C]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={item.src}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                    {/* Badge tipo foto */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B0B0C]/80 backdrop-blur-md border border-[#2C2D35] text-[#F4F5F7] text-xs font-bold uppercase tracking-wider">
                        <Camera className="w-3.5 h-3.5 text-[#F95716]" aria-hidden="true" />
                        <span>Foto</span>
                    </div>

                    {/* Hover icon para ampliar */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B0B0C]/85 border border-[#F95716] text-[#F4F5F7] text-xs font-bold uppercase tracking-wider shadow-xl">
                            <Maximize2 className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
                            <span>Ver Foto</span>
                        </span>
                    </div>
                </div>

                {/* Info de la Foto */}
                <div className="p-5 flex flex-col justify-between flex-1 gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300]">
                        {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-[#F4F5F7] group-hover:text-[#F95716] transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8A909A] leading-relaxed">
                        {item.description}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <section
            id="instalaciones"
            className="w-full bg-[#0B0B0C] px-4 sm:px-6 lg:px-10 py-20 lg:py-24 border-t border-[#2C2D35]/60 scroll-mt-20"
        >
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
                {/* Encabezado de la sección */}
                <div className="flex flex-col items-center text-center gap-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17171C] border border-[#2C2D35]">
                        <Sparkles className="w-4 h-4 text-[#FFB300]" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#FFB300]">
                            Instalaciones y Comunidad
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F5F7] tracking-tight uppercase">
                        Conocé Ave Fénix en Acción
                    </h2>
                    <p className="text-base sm:text-lg text-[#8A909A] leading-relaxed">
                        Explorá nuestras salas de musculación, sectores de cardio, peso libre y el ambiente de
                        entrenamiento en Ingeniero White.
                    </p>
                </div>

                {/* Filtros de Categoría */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#17171C] border border-[#2C2D35] max-w-full overflow-x-auto">
                    {FILTER_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${isActive
                                    ? "bg-[#F95716] text-[#F4F5F7] shadow-[0_0_20px_-4px_rgba(249,87,22,0.5)]"
                                    : "text-[#8A909A] hover:text-[#F4F5F7] hover:bg-[#23232A]"
                                    }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Vista Móvil / Tablet: Grilla vertical tradicional */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
                    {filteredMedia.map((item) => (
                        <div key={item.id} className="w-full">
                            {renderCard(item)}
                        </div>
                    ))}
                </div>

                {/* Vista PC / Escritorio (lg en adelante): Carrusel Horizontal Animado con Navegación y Autoplay */}
                <div className="w-full hidden lg:block relative group/carousel">
                    {/* Botones de navegación en desktop */}
                    <div className="flex items-center justify-end gap-2 mb-4">
                        <button
                            type="button"
                            className={`${prevBtnClass} inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#17171C] border border-[#2C2D35] text-[#F4F5F7] hover:border-[#F95716] hover:text-[#F95716] hover:bg-[#1f1f26] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                            aria-label="Anterior elemento"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            className={`${nextBtnClass} inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#17171C] border border-[#2C2D35] text-[#F4F5F7] hover:border-[#F95716] hover:text-[#F95716] hover:bg-[#1f1f26] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                            aria-label="Siguiente elemento"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <Swiper
                        key={activeTab}
                        modules={[Autoplay, Navigation, Pagination]}
                        spaceBetween={24}
                        slidesPerView={3}
                        loop={filteredMedia.length >= 3}
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        navigation={{
                            prevEl: `.${prevBtnClass}`,
                            nextEl: `.${nextBtnClass}`,
                        }}
                        pagination={{
                            el: `.${paginationClass}`,
                            clickable: true,
                            bulletClass: "inline-block w-2.5 h-2.5 rounded-full bg-[#2C2D35] transition-all duration-300 cursor-pointer mx-1.5",
                            bulletActiveClass: "!w-8 !bg-[#F95716] !rounded-full shadow-[0_0_10px_rgba(249,87,22,0.5)]",
                        }}
                        className="w-full !pb-12"
                    >
                        {filteredMedia.map((item) => (
                            <SwiperSlide key={item.id} className="!h-auto flex">
                                <div className="w-full h-full flex flex-col">
                                    {renderCard(item)}
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Indicadores / Paginación de Swiper en PC */}
                    <div className={`${paginationClass} flex items-center justify-center mt-2`} />
                </div>

                {/* Modal / Lightbox de visualización a pantalla completa */}
                {selectedMedia && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <div
                            className="relative max-w-4xl w-full bg-[#17171C] border border-[#2C2D35] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Barra superior del modal */}
                            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2C2D35] bg-[#0B0B0C]">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#23232A] text-[#F95716]">
                                        {selectedMedia.category}
                                    </span>
                                    <h4 className="text-base sm:text-lg font-extrabold text-[#F4F5F7]">
                                        {selectedMedia.title}
                                    </h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMedia(null)}
                                    className="p-2 rounded-xl bg-[#17171C] hover:bg-[#23232A] text-[#F4F5F7] border border-[#2C2D35] transition-colors cursor-pointer"
                                    aria-label="Cerrar vista previa"
                                >
                                    <X className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </div>

                            {/* Contenido multimedia del modal */}
                            <div className="relative w-full max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                                {selectedMedia.type === "video" ? (
                                    <video
                                        src={selectedMedia.src}
                                        poster={selectedMedia.poster}
                                        controls
                                        autoPlay
                                        playsInline
                                        className="max-h-[70vh] w-full object-contain"
                                    />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={selectedMedia.src}
                                        alt={selectedMedia.title}
                                        className="max-h-[70vh] w-full object-contain"
                                    />
                                )}
                            </div>

                            {/* Pie del modal */}
                            <div className="p-4 sm:p-5 bg-[#0B0B0C] border-t border-[#2C2D35] flex items-center justify-between">
                                <p className="text-sm text-[#8A909A] leading-relaxed">
                                    {selectedMedia.description}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMedia(null)}
                                    className="px-4 py-2 rounded-xl bg-[#23232A] hover:bg-[#2C2D35] text-[#F4F5F7] text-xs font-bold uppercase tracking-wider transition-colors shrink-0 ml-4 cursor-pointer"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
