"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, Upload, VideoOff, CheckCircle2 } from "lucide-react";

interface WebcamCaptureProps {
  photoDataUrl?: string | null;
  onPhotoCapture: (base64DataUrl: string | null) => void;
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraError("Sin acceso a cámara. Podés subir una foto desde tu PC.");
      setCameraActive(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!photoDataUrl) startCamera();
    return () => stopCamera();
  }, [photoDataUrl, startCamera, stopCamera]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCapturedUrl(reader.result);
        onPhotoCapture(reader.result);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-xs sm:text-sm text-[#F4F5F7] font-bold flex items-center gap-2">
        <Camera className="w-4 h-4 text-[#F95716]" />
        <span>Foto de Identificación Biométrica</span>
      </label>

      <div className="relative w-full aspect-4/3 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] overflow-hidden flex items-center justify-center">
        {capturedUrl ? (
          <img src={capturedUrl} alt="Vista previa del socio" className="w-full h-full object-cover" />
        ) : cameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
        ) : (
          <div className="p-6 text-center flex flex-col items-center gap-2 text-[#8A909A]">
            <VideoOff className="w-9 h-9 text-[#F95716]" />
            <p className="text-xs">{cameraError || "Cámara en espera"}</p>
          </div>
        )}
        <div className="absolute inset-3 rounded-xl border-2 border-dashed border-[#F95716]/60 pointer-events-none flex items-end justify-center pb-2">
          <span className="text-[11px] bg-[#0B0B0C]/80 border border-[#F95716]/40 text-[#F4F5F7] px-3 py-0.5 rounded-full font-semibold">
            {capturedUrl ? "✓ Foto Capturada" : "Encuadrar Rostro"}
          </span>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {capturedUrl ? (
        <button type="button" onClick={handleRetake} className="min-h-[48px] w-full rounded-xl bg-[#23232A] hover:bg-[#2C2D35] border border-[#2C2D35] text-sm font-bold text-[#F4F5F7] inline-flex items-center justify-center gap-2 cursor-pointer">
          <RefreshCw className="w-4 h-4 text-[#F95716]" />
          <span>Volver a sacar foto</span>
        </button>
      ) : (
        <button type="button" onClick={handleCapture} disabled={!cameraActive} className="min-h-[48px] w-full rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(249,87,22,0.35)] disabled:opacity-40 cursor-pointer">
          <Camera className="w-4 h-4" />
          <span>📷 Tomar Foto del Socio</span>
        </button>
      )}

      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-[#10B981] font-bold inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {cameraActive ? "Cámara Frontal HD Activa" : "Modo Archivo / Captura"}
        </span>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[#8A909A] hover:text-[#F95716] underline inline-flex items-center gap-1 cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          <span>Subir foto local</span>
        </button>
      </div>
    </div>
  );
}
