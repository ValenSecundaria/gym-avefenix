"use client";

import React, { useId } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Estilos de Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface CarouselImage {
  src: string;
  alt?: string;
  title?: string;
  description?: string;
}

export interface CardCarouselProps {
  /** Lista de imágenes opcional para compatibilidad con demo de 21st.dev */
  images?: CarouselImage[];
  /** Contenido hijo o tarjetas personalizadas (p. ej. PlanCard) */
  children?: React.ReactNode;
  /** Retardo de autoplay en milisegundos (por defecto 3000ms) */
  autoplayDelay?: number;
  /** Si debe mostrar los indicadores de paginación */
  showPagination?: boolean;
  /** Si debe mostrar los botones de navegación anterior/siguiente */
  showNavigation?: boolean;
  /** Clases adicionales para el contenedor principal */
  className?: string;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({
  images,
  children,
  autoplayDelay = 3000,
  showPagination = true,
  showNavigation = true,
  className = "",
}) => {
  const rawId = useId();
  const instanceId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const prevBtnClass = `btn-prev-${instanceId}`;
  const nextBtnClass = `btn-next-${instanceId}`;
  const paginationClass = `pagination-${instanceId}`;

  const hasChildren = Boolean(children && React.Children.count(children) > 0);
  const hasImages = Boolean(images && images.length > 0);

  if (!hasChildren && !hasImages) {
    return null;
  }

  return (
    <div className={`relative w-full group/carousel ${className}`}>
      {/* Botones de navegación superiores/flotantes */}
      {showNavigation && (
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            type="button"
            className={`${prevBtnClass} inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#17171C] border border-[#2C2D35] text-[#F4F5F7] hover:border-[#F95716] hover:text-[#F95716] hover:bg-[#1f1f26] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#2C2D35] disabled:hover:text-[#F4F5F7]`}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            className={`${nextBtnClass} inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#17171C] border border-[#2C2D35] text-[#F4F5F7] hover:border-[#F95716] hover:text-[#F95716] hover:bg-[#1f1f26] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#2C2D35] disabled:hover:text-[#F4F5F7]`}
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        loop={true}
        autoHeight={false}
        autoplay={
          autoplayDelay > 0
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        navigation={
          showNavigation
            ? {
                prevEl: `.${prevBtnClass}`,
                nextEl: `.${nextBtnClass}`,
              }
            : false
        }
        pagination={
          showPagination
            ? {
                el: `.${paginationClass}`,
                clickable: true,
                bulletClass: "inline-block w-2.5 h-2.5 rounded-full bg-[#2C2D35] transition-all duration-300 cursor-pointer mx-1",
                bulletActiveClass: "!w-7 !bg-[#F95716] !rounded-full shadow-[0_0_10px_rgba(249,87,22,0.5)]",
              }
            : false
        }
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 24,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 32,
          },
        }}
        className="w-full !pb-2 items-stretch"
      >
        {hasChildren
          ? React.Children.map(children, (child, idx) => (
              <SwiperSlide key={idx} className="!h-auto flex">
                <div className="w-full h-full flex flex-col">{child}</div>
              </SwiperSlide>
            ))
          : images?.map((image, idx) => (
              <SwiperSlide key={idx} className="!h-auto flex">
                <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#17171C] border border-[#2C2D35] flex flex-col justify-between">
                  <div className="aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-[#0B0B0C]">
                    <img
                      src={image.src}
                      alt={image.alt || `Imagen ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  {(image.title || image.description) && (
                    <div className="p-5 flex flex-col gap-1">
                      {image.title && (
                        <h4 className="font-extrabold text-[#F4F5F7] text-lg">
                          {image.title}
                        </h4>
                      )}
                      {image.description && (
                        <p className="text-sm text-[#8A909A]">
                          {image.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
      </Swiper>

      {/* Paginación */}
      {showPagination && (
        <div
          className={`${paginationClass} flex items-center justify-center gap-1.5 mt-6`}
        />
      )}
    </div>
  );
};

