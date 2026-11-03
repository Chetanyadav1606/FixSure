import {
  Battery, Cpu, Fan, HardDrive, Keyboard, Laptop, MemoryStick, Monitor, Package, Plug, Smartphone, Usb, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAP: [RegExp, LucideIcon][] = [
  [/battery|batteries/, Battery],
  [/keyboard/, Keyboard],
  [/charger|power/, Plug],
  [/cool|fan/, Fan],
  [/memory|ram/, MemoryStick],
  [/storage|ssd|hdd/, HardDrive],
  [/processor/, Cpu],
  [/screen|display|monitor/, Monitor],
  [/mobile/, Smartphone],
  [/tool/, Wrench],
  [/peripheral|hub/, Usb],
  [/laptop/, Laptop],
];

/** Neutral stand-in until real product photography is uploaded (never passed off as a photo). */
export function ProductVisual({ categorySlug, label, className }: { categorySlug: string; label: string; className?: string }) {
  const Icon = MAP.find(([re]) => re.test(categorySlug))?.[1] ?? (categorySlug ? Package : Zap);
  return (
    <div role="img" aria-label={`${label} (illustration — product photo coming soon)`} className={cn("relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0b1a3d] to-[#05070d]", className)}>
      <svg viewBox="0 0 120 120" aria-hidden="true" className="absolute h-3/4 w-3/4 opacity-[0.07]"><path d="M60 5 104 21v37c0 26-19 46-44 56C35 104 16 84 16 58V21Z" fill="#c9d1de" /></svg>
      <Icon className="relative h-1/3 w-1/3 text-blue-400/80" strokeWidth={1.25} aria-hidden="true" />
    </div>
  );
}
