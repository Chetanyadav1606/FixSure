import { BatteryCharging, Camera, Cpu, Droplets, Plug, RectangleVertical, Smartphone, Terminal, Volume2, Wrench, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  screen: Smartphone, battery: BatteryCharging, port: Plug, back: RectangleVertical, software: Terminal,
  camera: Camera, speaker: Volume2, water: Droplets, board: Cpu, wrench: Wrench,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Wrench;
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}
