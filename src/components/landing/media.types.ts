import { Camera, Video, Layers, Dumbbell, Flame } from "lucide-react";

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

export const FILTER_TABS = [
  { id: "all", label: "Todo", icon: Layers },
  { id: "photos", label: "Fotos", icon: Camera },
  { id: "videos", label: "Videos", icon: Video },
  { id: "musculacion", label: "Musculación", icon: Dumbbell },
  { id: "funcional", label: "Funcional", icon: Flame },
] as const;
