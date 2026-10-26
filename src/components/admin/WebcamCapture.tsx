"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, Upload, VideoOff, CheckCircle2 } from "lucide-react";

interface WebcamCaptureProps {
  photoDataUrl?: string | null;
  onPhotoCapture: (base64DataUrl: string | null) => void;
}

const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
  audio: false,
};

// "denied" = el permiso se rechazó antes: no se vuelve a pedir solo (no se puede saltear el cartel
// del navegador; con "granted" la cámara se enciende directo, sin preguntar).
async function getCameraPermission(): Promise<PermissionState | "unknown"> {
  try {
    const status = await navigator.permissions?.query({ name: "camera" as PermissionName });
    return status?.state ?? "unknown";
  } catch {
    return "unknown"; // Navegadores que no permiten consultar el permiso de cámara
  }
}

export function WebcamCapture({ photoDataUrl = null, onPhotoCapture }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedUrl, setCapturedUrl] = useState<string | null>(photoDataUrl);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

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
      const stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraError("Sin acceso a cámara. Podés subir una foto desde tu PC.");
      setCameraActive(false);
    }
  }, [stopCamera]);

  // Al abrir el alta la cámara se enciende sola. Si el permiso está rechazado o no hay cámara,
  // no pasa nada: queda la opción de subir una foto o seguir sin foto.
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
          const stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraError(null);
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
  }, [photoDataUrl, stopCamera]);

  // El <video> se monta recién cuando la cámara ya está activa: hay que conectarle el stream al montarse.
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) el.srcObject = streamRef.current;
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    const sx = ((video.videoWidth || size) - size) / 2;
    const sy = ((video.videoHeight || size) - size) / 2;
    canvas.width = 480;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 480, 480);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedUrl(dataUrl);
    onPhotoCapture(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedUrl(null);
    onPhotoCapture(null);
    startCamera();
  };

  // La foto subida se recorta y achica igual que la de la cámara (480x480 JPEG): una foto de celular
  // sin achicar supera el límite de 1 MB de las Server Actions y el alta falla.
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    const canvas = canvasRef.current;
    if (!file || !canvas) return;
    try {
      const bitmap = await createImageBitmap(file);
      const size = Math.min(bitmap.width, bitmap.height);
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 480, 480);
      bitmap.close();
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCameraError(null);
      setCapturedUrl(dataUrl);
      onPhotoCapture(dataUrl);
      stopCamera();
    } catch {
      setCameraError("No se pudo leer la imagen. Probá con un archivo JPG o PNG.");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-xs sm:text-sm text-fx-text font-bold flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-fx-orange" />
          <span>Foto de Identificación Biométrica</span>
        </span>
        <span className="text-[11px] font-normal text-fx-muted">(Opcional)</span>
      </label>

      <div className="relative w-full aspect-4/3 rounded-xl bg-fx-base border border-fx-border overflow-hidden flex items-center justify-center">
        {capturedUrl ? (
          <img src={capturedUrl} alt="Vista previa del socio" className="w-full h-full object-cover" />
        ) : cameraActive ? (
          <video ref={attachVideo} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-fx-base">
            <img
              src="/UserImage.png"
              alt="Silueta por defecto"
              className="w-28 h-28 object-contain opacity-50 mb-2"
            />
            <p className="text-xs text-fx-muted px-4 text-center">
              {cameraError || "Sin foto seleccionada (se usará la imagen por defecto)"}
            </p>
          </div>
        )}
        <div className="absolute inset-3 rounded-xl border-2 border-dashed border-fx-orange/60 pointer-events-none flex items-end justify-center pb-2">
          <span className="text-[11px] bg-fx-base/80 border border-fx-orange/40 text-fx-text px-3 py-0.5 rounded-full font-semibold">
            {capturedUrl ? "✓ Foto Capturada" : cameraActive ? "Encuadrar Rostro" : "Foto Opcional"}
          </span>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {capturedUrl ? (
        <button type="button" onClick={handleRetake} className="min-h-[48px] w-full rounded-xl bg-fx-hover hover:bg-fx-border border border-fx-border text-sm font-bold text-fx-text inline-flex items-center justify-center gap-2 cursor-pointer">
          <RefreshCw className="w-4 h-4 text-fx-orange" />
          <span>Volver a sacar foto</span>
        </button>
      ) : (
        <button type="button" onClick={handleCapture} disabled={!cameraActive} className="min-h-[48px] w-full rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(249,87,22,0.35)] disabled:opacity-40 cursor-pointer">
          <Camera className="w-4 h-4" />
          <span>📷 Tomar Foto del Socio</span>
        </button>
      )}

      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-fx-green font-bold inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {cameraActive ? "Cámara Frontal HD Activa" : "Modo Archivo / Captura"}
        </span>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-fx-muted hover:text-fx-orange underline inline-flex items-center gap-1 cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          <span>Subir foto local</span>
        </button>
      </div>
    </div>
  );
}
