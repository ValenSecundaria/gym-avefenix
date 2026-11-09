"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, Upload, CheckCircle2, Check, Move, ZoomIn, ZoomOut } from "lucide-react";
import { listCameras, openNextCamera, openPreferredCamera } from "@/lib/camera";

interface WebcamCaptureProps {
  photoDataUrl?: string | null;
  onPhotoCapture: (base64DataUrl: string | null) => void;
}

interface CropBox {
  x: number; // Porcentaje (0 a 100) respecto a la imagen visible
  y: number; // Porcentaje (0 a 100) respecto a la imagen visible
  size: number; // Porcentaje (0 a 100) del lado menor de la imagen visible
}

async function getCameraPermission(): Promise<PermissionState | "unknown"> {
  try {
    const status = await navigator.permissions?.query({ name: "camera" as PermissionName });
    return status?.state ?? "unknown";
  } catch {
    return "unknown";
  }
}

export function WebcamCapture({ photoDataUrl = null, onPhotoCapture }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);

  // Estados
  const [capturedUrl, setCapturedUrl] = useState<string | null>(photoDataUrl);
  const [rawPhotoUrl, setRawPhotoUrl] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLabel, setCameraLabel] = useState("");
  const [cameraCount, setCameraCount] = useState(0);

  // Dimensiones renderizadas de la imagen para posicionar exactamente el recuadro sobre ella
  const [imgLayout, setImgLayout] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
  }>({ width: 0, height: 0, left: 0, top: 0 });

  // Recuadro: posición y tamaño en porcentajes (0 a 100) respecto al área visible de la imagen
  const [crop, setCrop] = useState<CropBox>({ x: 15, y: 15, size: 70 });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 0,
    startY: 0,
  });

  const attachStream = useCallback((stream: MediaStream) => {
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;
    setCameraLabel(stream.getVideoTracks()[0]?.label ?? "");
    setCameraActive(true);
    setCameraError(null);
    void listCameras().then((cams) => setCameraCount(cams.length));
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("El navegador no soporta cámara web.");
      return;
    }
    try {
      stopCamera();
      attachStream(await openPreferredCamera());
    } catch {
      setCameraError("Sin acceso a cámara. Podés subir una foto desde tu PC.");
      setCameraActive(false);
    }
  }, [stopCamera, attachStream]);

  const switchCamera = useCallback(async () => {
    const currentId = streamRef.current?.getVideoTracks()[0]?.getSettings().deviceId;
    try {
      stopCamera();
      const next = await openNextCamera(currentId);
      attachStream(next ?? (await openPreferredCamera()));
    } catch {
      setCameraError("No se pudo abrir esa cámara. Probá de nuevo o subí una foto.");
    }
  }, [stopCamera, attachStream]);

  useEffect(() => {
    let active = true;
    if (!photoDataUrl) {
      (async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
          if (active) setCameraError("El navegador no soporta cámara web.");
          return;
        }
        if ((await getCameraPermission()) === "denied") {
          if (active) setCameraError("La cámara está bloqueada en el navegador. Podés subir una foto desde tu PC.");
          return;
        }
        try {
          const stream = await openPreferredCamera();
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          attachStream(stream);
        } catch {
          if (!active) return;
          setCameraError("Sin acceso a cámara. Podés subir una foto desde tu PC.");
          setCameraActive(false);
        }
      })();
    }
    return () => {
      active = false;
      stopCamera();
    };
  }, [photoDataUrl, stopCamera, attachStream]);

  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) el.srcObject = streamRef.current;
  }, []);

  // Actualiza el tamaño y posición exactos que ocupa la imagen renderizada dentro del contenedor
  const updateImageLayout = useCallback(() => {
    const img = imageElementRef.current;
    if (!img) return;

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const clientWidth = img.clientWidth;
    const clientHeight = img.clientHeight;

    if (!naturalWidth || !naturalHeight || !clientWidth || !clientHeight) return;

    const imgAspect = naturalWidth / naturalHeight;
    const containerAspect = clientWidth / clientHeight;

    let renderedWidth = clientWidth;
    let renderedHeight = clientHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imgAspect > containerAspect) {
      // Imagen ancha: barras negras arriba y abajo
      renderedHeight = clientWidth / imgAspect;
      offsetY = (clientHeight - renderedHeight) / 2;
    } else {
      // Imagen alta: barras negras a los lados
      renderedWidth = clientHeight * imgAspect;
      offsetX = (clientWidth - renderedWidth) / 2;
    }

    setImgLayout({
      width: renderedWidth,
      height: renderedHeight,
      left: offsetX,
      top: offsetY,
    });
  }, []);

  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    const rawUrl = canvas.toDataURL("image/jpeg", 0.95);
    setRawPhotoUrl(rawUrl);
    stopCamera();
    setCrop({ x: 15, y: 15, size: 70 });
    setIsCropping(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setRawPhotoUrl(result);
          setCrop({ x: 15, y: 15, size: 70 });
          setIsCropping(true);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setCameraError("No se pudo leer la imagen. Probá con un archivo JPG o PNG.");
    }
  };

  // Recorte WYSIWYG (Exactamente lo que se ve dentro del recuadro es lo que se corta)
  const handleApplyCrop = () => {
    const img = imageElementRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || imgLayout.width === 0 || imgLayout.height === 0) return;

    const baseSide = Math.min(imgLayout.width, imgLayout.height);
    const boxPx = (crop.size / 100) * baseSide;
    const boxLeftPx = (crop.x / 100) * (imgLayout.width - boxPx);
    const boxTopPx = (crop.y / 100) * (imgLayout.height - boxPx);

    // Mapeo 1:1 a los píxeles reales de la imagen
    const scale = img.naturalWidth / imgLayout.width;
    const sx = Math.max(0, boxLeftPx * scale);
    const sy = Math.max(0, boxTopPx * scale);
    const sSide = Math.min(boxPx * scale, img.naturalWidth - sx, img.naturalHeight - sy);

    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, sx, sy, sSide, sSide, 0, 0, 400, 400);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedUrl(dataUrl);
    onPhotoCapture(dataUrl);
    setIsCropping(false);
  };

  const handleRetake = () => {
    setCapturedUrl(null);
    setRawPhotoUrl(null);
    setIsCropping(false);
    onPhotoCapture(null);
    startCamera();
  };

  // Drag & drop fluido del recuadro
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      clientX,
      clientY,
      startX: crop.x,
      startY: crop.y,
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || imgLayout.width === 0 || imgLayout.height === 0) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const baseSide = Math.min(imgLayout.width, imgLayout.height);
      const boxPx = (crop.size / 100) * baseSide;
      const maxDeltaXPx = Math.max(1, imgLayout.width - boxPx);
      const maxDeltaYPx = Math.max(1, imgLayout.height - boxPx);

      const deltaXPct = ((clientX - dragStartRef.current.clientX) / maxDeltaXPx) * 100;
      const deltaYPct = ((clientY - dragStartRef.current.clientY) / maxDeltaYPx) * 100;

      let newX = dragStartRef.current.startX + deltaXPct;
      let newY = dragStartRef.current.startY + deltaYPct;

      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));

      setCrop((prev) => ({ ...prev, x: newX, y: newY }));
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [crop.size, imgLayout]);

  const changeCropSize = (deltaPct: number) => {
    setCrop((prev) => {
      const newSize = Math.max(30, Math.min(100, prev.size + deltaPct));
      return { ...prev, size: newSize };
    });
  };

  // Cálculo de coordenadas en píxeles del recuadro dentro del contenedor
  const baseSide = Math.min(imgLayout.width, imgLayout.height) || 200;
  const boxPx = (crop.size / 100) * baseSide;
  const boxLeftPx = imgLayout.left + (crop.x / 100) * Math.max(0, imgLayout.width - boxPx);
  const boxTopPx = imgLayout.top + (crop.y / 100) * Math.max(0, imgLayout.height - boxPx);

  return (
    <div className="flex flex-col gap-3 w-full select-none">
      <label className="text-xs sm:text-sm text-fx-text font-bold flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-fx-orange" />
          <span>Foto de Identificación Biométrica</span>
        </span>
        <span className="text-[11px] font-normal text-fx-muted">(Opcional)</span>
      </label>

      {/* Visor de cámara / Recorte */}
      <div className="relative w-full aspect-4/3 rounded-xl bg-black border border-fx-border overflow-hidden flex items-center justify-center">
        {isCropping && rawPhotoUrl ? (
          <>
            <img
              ref={imageElementRef}
              src={rawPhotoUrl}
              alt="Foto para encuadrar"
              onLoad={updateImageLayout}
              className="w-full h-full object-contain pointer-events-none"
            />
            {/* Máscara global */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Recuadro de recorte exacto */}
            {imgLayout.width > 0 && (
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                style={{
                  left: `${boxLeftPx}px`,
                  top: `${boxTopPx}px`,
                  width: `${boxPx}px`,
                  height: `${boxPx}px`,
                }}
                className="absolute border-2 border-fx-orange bg-transparent cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-lg flex flex-col items-center justify-between p-2 z-20 hover:border-white transition-colors"
              >
                <div className="w-full flex justify-between items-center opacity-90 pointer-events-none">
                  <span className="text-[10px] font-bold text-white bg-black/75 px-1.5 py-0.5 rounded">1:1</span>
                  <Move className="w-4 h-4 text-white drop-shadow" />
                </div>
                <span className="text-[11px] font-bold text-white bg-fx-orange/95 px-2 py-0.5 rounded shadow pointer-events-none">
                  Arrastrar para encuadrar
                </span>
                <div className="w-full text-right opacity-80 pointer-events-none">
                  <span className="text-[9px] text-white">Ave Fénix</span>
                </div>
              </div>
            )}
          </>
        ) : capturedUrl ? (
          <img src={capturedUrl} alt="Vista previa del socio" className="w-full h-full object-cover" />
        ) : cameraActive ? (
          <>
            <video ref={attachVideo} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute inset-4 rounded-xl border-2 border-dashed border-fx-orange/60 pointer-events-none flex items-end justify-center pb-2">
              <span className="text-[11px] bg-fx-base/80 border border-fx-orange/40 text-fx-text px-3 py-0.5 rounded-full font-semibold">
                Centrar aproximadamente al socio
              </span>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-fx-base">
            <img src="/UserImage.png" alt="Silueta por defecto" className="w-28 h-28 object-contain opacity-50 mb-2" />
            <p className="text-xs text-fx-muted px-4 text-center">
              {cameraError || "Sin foto seleccionada (se usará la imagen por defecto)"}
            </p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controles */}
      {isCropping ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 py-2 bg-fx-surface rounded-xl border border-fx-border text-xs">
            <span className="text-fx-muted flex items-center gap-1.5 font-medium">
              <Move className="w-3.5 h-3.5 text-fx-orange" />
              <span>Tamaño del encuadre:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeCropSize(15)}
                disabled={crop.size >= 100}
                className="px-2.5 py-1.5 rounded-lg bg-fx-base hover:bg-fx-hover text-fx-text border border-fx-border flex items-center gap-1.5 disabled:opacity-30 cursor-pointer font-semibold"
                title="Abarcar más imagen"
              >
                <ZoomOut className="w-3.5 h-3.5 text-fx-orange" />
                <span>Más amplio</span>
              </button>
              <button
                type="button"
                onClick={() => changeCropSize(-15)}
                disabled={crop.size <= 35}
                className="px-2.5 py-1.5 rounded-lg bg-fx-base hover:bg-fx-hover text-fx-text border border-fx-border flex items-center gap-1.5 disabled:opacity-30 cursor-pointer font-semibold"
                title="Acercar rostro"
              >
                <ZoomIn className="w-3.5 h-3.5 text-fx-orange" />
                <span>Más de cerca</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleRetake}
              className="min-h-[46px] rounded-xl bg-fx-hover hover:bg-fx-border border border-fx-border text-xs sm:text-sm font-bold text-fx-text inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-fx-muted" />
              <span>Cancelar / Descartar</span>
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="min-h-[46px] rounded-xl bg-fx-green hover:bg-fx-green/90 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(22,163,74,0.3)] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Encuadre</span>
            </button>
          </div>
        </div>
      ) : capturedUrl ? (
        <button
          type="button"
          onClick={handleRetake}
          className="min-h-[46px] w-full rounded-xl bg-fx-hover hover:bg-fx-border border border-fx-border text-sm font-bold text-fx-text inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-fx-orange" />
          <span>Volver a sacar / Cambiar foto</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSnap}
          disabled={!cameraActive}
          className="min-h-[46px] w-full rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(249,87,22,0.35)] disabled:opacity-40 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>📷 Tomar Foto del Socio</span>
        </button>
      )}

      {!isCropping && (
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-fx-green font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="truncate max-w-[170px]" title={cameraLabel}>
              {cameraActive ? cameraLabel || "Cámara activa" : "Modo Archivo / Captura"}
            </span>
          </span>
          {cameraActive && cameraCount > 1 && (
            <button
              type="button"
              onClick={() => void switchCamera()}
              className="text-fx-muted hover:text-fx-orange underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Cambiar cámara</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-fx-muted hover:text-fx-orange underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir foto local</span>
          </button>
        </div>
      )}
    </div>
  );
}
