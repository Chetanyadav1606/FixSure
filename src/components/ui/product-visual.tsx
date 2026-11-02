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
    <div role="img" aria-label={`${label} (illustration — product photo coming soon)`} className={cn("flex items-center justify-center bg-gradient-to-br from-navy-50 to-white", className)}>
      <Icon className="h-1/3 w-1/3 text-navy-800/70" strokeWidth={1.25} aria-hidden="true" />
    </div>
  );
}
