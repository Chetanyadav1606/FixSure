/**
 * SAMPLE DATA ONLY — placeholder catalogue used until the owner loads real inventory
 * (admin CSV import, or supabase/seed.sql). Every SKU is prefixed "DEMO-". Prices, stock
 * and compatibility rows below are illustrative and MUST be replaced/verified before launch.
 * Device model names are real public product lines; compatibility links are NOT verified.
 */
import type { CompatRecord, DeviceModel } from "../compat";
import type { Brand, Category, Product } from "./types";

const cat = (slug: string, name: string, deviceType: Category["deviceType"], description: string): Category => ({
  id: `cat-${slug}`, slug, name, deviceType, description,
});

export const categories: Category[] = [
  cat("laptop-screens", "Laptop Screens", "laptop", "Replacement display panels and display cables."),
  cat("laptop-keyboards", "Laptop Keyboards", "laptop", "Replacement keyboards by model and layout."),
  cat("laptop-batteries", "Laptop Batteries", "laptop", "Replacement batteries by voltage and capacity."),
  cat("laptop-chargers", "Laptop Chargers", "laptop", "Adapters and DC jacks."),
  cat("laptop-memory-storage", "Laptop RAM & SSDs", "laptop", "Memory and storage upgrades."),
  cat("laptop-cooling", "Cooling Fans & Heatsinks", "laptop", "Fans and thermal parts."),
  cat("desktop-processors", "Processors", "desktop", "Desktop CPUs."),
  cat("desktop-memory", "Desktop RAM", "desktop", "Desktop memory modules."),
  cat("desktop-storage", "SSDs & HDDs", "desktop", "Internal storage drives."),
  cat("desktop-power", "Power Supplies", "desktop", "PSUs for desktop builds."),
  cat("mobile-displays", "Mobile Displays", "mobile", "Replacement mobile screens."),
  cat("mobile-batteries", "Mobile Batteries", "mobile", "Replacement mobile batteries."),
  cat("accessories-peripherals", "Keyboards, Mice & Hubs", "accessory", "Everyday computer accessories."),
  cat("accessories-tools", "Repair Tools & Cleaning", "accessory", "Toolkits and cleaning kits."),
];

export const brands: Brand[] = [
  { id: "b-hp", slug: "hp", name: "HP" },
  { id: "b-dell", slug: "dell", name: "Dell" },
  { id: "b-lenovo", slug: "lenovo", name: "Lenovo" },
  { id: "b-asus", slug: "asus", name: "ASUS" },
  { id: "b-acer", slug: "acer", name: "Acer" },
  { id: "b-apple", slug: "apple", name: "Apple" },
  { id: "b-samsung", slug: "samsung", name: "Samsung" },
  { id: "b-generic", slug: "generic", name: "Compatible / Generic" },
];

type P = Omit<Product, "id" | "mrpPaise" | "oemNumbers" | "specs" | "featured" | "popular"> &
  Partial<Pick<Product, "mrpPaise" | "oemNumbers" | "specs" | "featured" | "popular">>;
const p = (x: P): Product => ({
  mrpPaise: null, oemNumbers: [], specs: [], featured: false, popular: false, ...x, id: `p-${x.slug}`,
});

export const products: Product[] = [
  p({ slug: "demo-laptop-screen-156-fhd", sku: "DEMO-LCD-156-FHD", name: "15.6\" Full HD Laptop Display (30-pin eDP)", brandId: "b-generic", categoryId: "cat-laptop-screens", description: "Sample listing. Matte IPS 1920×1080 replacement panel with a 30-pin eDP connector.", condition: "compatible_aftermarket", pricePaise: 349900, warrantyMonths: 6, inStock: true, featured: true, popular: true, oemNumbers: ["DEMO-OEM-LCD-1"], specs: [{ key: "Screen size", value: "15.6 in" }, { key: "Resolution", value: "1920 × 1080" }, { key: "Connector", value: "30-pin eDP" }, { key: "Panel type", value: "IPS, matte" }] }),
  p({ slug: "demo-laptop-keyboard-us", sku: "DEMO-KB-US-01", name: "Laptop Keyboard, US Layout (with frame)", brandId: "b-generic", categoryId: "cat-laptop-keyboards", description: "Sample listing. Replacement keyboard, US layout.", condition: "compatible_aftermarket", pricePaise: 129900, warrantyMonths: 3, inStock: true, featured: true, oemNumbers: ["DEMO-OEM-KB-1"], specs: [{ key: "Layout", value: "US English" }, { key: "Backlight", value: "No" }] }),
  p({ slug: "demo-laptop-battery-3cell", sku: "DEMO-BAT-3C-1", name: "3-Cell Laptop Battery, 11.4 V", brandId: "b-generic", categoryId: "cat-laptop-batteries", description: "Sample listing. Replacement lithium-ion battery.", condition: "compatible_aftermarket", pricePaise: 289900, warrantyMonths: 6, inStock: true, featured: true, popular: true, oemNumbers: ["DEMO-OEM-BAT-1"], specs: [{ key: "Voltage", value: "11.4 V" }, { key: "Capacity", value: "41 Wh" }, { key: "Cells", value: "3" }] }),
  p({ slug: "demo-laptop-battery-4cell", sku: "DEMO-BAT-4C-1", name: "4-Cell Laptop Battery, 14.8 V", brandId: "b-generic", categoryId: "cat-laptop-batteries", description: "Sample listing. Replacement lithium-ion battery.", condition: "compatible_aftermarket", pricePaise: 349900, warrantyMonths: 6, inStock: false, specs: [{ key: "Voltage", value: "14.8 V" }, { key: "Capacity", value: "41 Wh" }] }),
  p({ slug: "demo-laptop-charger-65w", sku: "DEMO-CHG-65-1", name: "65 W Laptop Charger, 19.5 V (4.5 mm barrel)", brandId: "b-generic", categoryId: "cat-laptop-chargers", description: "Sample listing. Replacement AC adapter.", condition: "compatible_aftermarket", pricePaise: 119900, warrantyMonths: 6, inStock: true, popular: true, specs: [{ key: "Output", value: "19.5 V / 3.33 A" }, { key: "Connector", value: "4.5 × 3.0 mm" }] }),
  p({ slug: "demo-ddr4-sodimm-8gb", sku: "DEMO-RAM-D4-8", name: "8 GB DDR4 SO-DIMM Laptop RAM", brandId: "b-generic", categoryId: "cat-laptop-memory-storage", description: "Sample listing. DDR4 laptop memory module.", condition: "new", pricePaise: 189900, warrantyMonths: 12, inStock: true, popular: true, specs: [{ key: "Generation", value: "DDR4" }, { key: "Capacity", value: "8 GB" }, { key: "Form factor", value: "SO-DIMM" }] }),
  p({ slug: "demo-nvme-ssd-512", sku: "DEMO-SSD-NV-512", name: "512 GB NVMe M.2 SSD", brandId: "b-generic", categoryId: "cat-laptop-memory-storage", description: "Sample listing. M.2 2280 NVMe solid-state drive.", condition: "new", pricePaise: 349900, warrantyMonths: 36, inStock: true, featured: true, specs: [{ key: "Interface", value: "NVMe PCIe" }, { key: "Form factor", value: "M.2 2280" }, { key: "Capacity", value: "512 GB" }] }),
  p({ slug: "demo-laptop-fan", sku: "DEMO-FAN-01", name: "Laptop CPU Cooling Fan", brandId: "b-generic", categoryId: "cat-laptop-cooling", description: "Sample listing. Replacement CPU fan, 5 V.", condition: "compatible_aftermarket", pricePaise: 89900, warrantyMonths: 3, inStock: true, specs: [{ key: "Voltage", value: "5 V" }, { key: "Pins", value: "4" }] }),
  p({ slug: "demo-desktop-ddr4-16", sku: "DEMO-RAM-DD4-16", name: "16 GB DDR4 Desktop RAM", brandId: "b-generic", categoryId: "cat-desktop-memory", description: "Sample listing. DDR4 desktop memory.", condition: "new", pricePaise: 349900, warrantyMonths: 36, inStock: true, specs: [{ key: "Generation", value: "DDR4" }, { key: "Form factor", value: "DIMM" }] }),
  p({ slug: "demo-sata-ssd-480", sku: "DEMO-SSD-SATA-480", name: "480 GB 2.5\" SATA SSD", brandId: "b-generic", categoryId: "cat-desktop-storage", description: "Sample listing. SATA III solid-state drive.", condition: "new", pricePaise: 299900, warrantyMonths: 36, inStock: true, popular: true, specs: [{ key: "Interface", value: "SATA III" }, { key: "Form factor", value: "2.5 in" }] }),
  p({ slug: "demo-psu-550", sku: "DEMO-PSU-550", name: "550 W ATX Power Supply", brandId: "b-generic", categoryId: "cat-desktop-power", description: "Sample listing. ATX PSU for desktop builds.", condition: "new", pricePaise: 349900, warrantyMonths: 12, inStock: true, specs: [{ key: "Wattage", value: "550 W" }, { key: "Form factor", value: "ATX" }] }),
  p({ slug: "demo-mobile-display", sku: "DEMO-MOB-LCD-1", name: "Mobile Replacement Display Assembly", brandId: "b-generic", categoryId: "cat-mobile-displays", description: "Sample listing. Display with touch digitiser.", condition: "compatible_aftermarket", pricePaise: 249900, warrantyMonths: 3, inStock: true, specs: [{ key: "Type", value: "LCD + touch" }] }),
  p({ slug: "demo-mobile-battery", sku: "DEMO-MOB-BAT-1", name: "Mobile Replacement Battery", brandId: "b-generic", categoryId: "cat-mobile-batteries", description: "Sample listing. Lithium-polymer replacement battery.", condition: "compatible_aftermarket", pricePaise: 89900, warrantyMonths: 6, inStock: true, specs: [{ key: "Capacity", value: "4000 mAh" }] }),
  p({ slug: "demo-usb-hub", sku: "DEMO-HUB-4", name: "4-Port USB 3.0 Hub", brandId: "b-generic", categoryId: "cat-accessories-peripherals", description: "Sample listing. Bus-powered USB 3.0 hub.", condition: "new", pricePaise: 69900, warrantyMonths: 6, inStock: true, specs: [{ key: "Ports", value: "4 × USB 3.0" }] }),
  p({ slug: "demo-precision-toolkit", sku: "DEMO-TOOL-SET", name: "Precision Screwdriver & Opening Toolkit", brandId: "b-generic", categoryId: "cat-accessories-tools", description: "Sample listing. Precision bits, spudgers and picks for electronics repair.", condition: "new", pricePaise: 79900, warrantyMonths: null, inStock: true, featured: true, popular: true, specs: [{ key: "Contents", value: "Bits, spudgers, picks, suction cup" }] }),
];

export const deviceModels: DeviceModel[] = [
  { id: "dm-hp-pav15", deviceType: "laptop", manufacturer: "HP", series: "Pavilion", model: "15", identifiers: [] },
  { id: "dm-dell-insp15", deviceType: "laptop", manufacturer: "Dell", series: "Inspiron", model: "15 3000", identifiers: [] },
  { id: "dm-lenovo-ip3", deviceType: "laptop", manufacturer: "Lenovo", series: "IdeaPad", model: "3 15", identifiers: [] },
  { id: "dm-asus-vivo", deviceType: "laptop", manufacturer: "ASUS", series: "VivoBook", model: "15", identifiers: [] },
  { id: "dm-acer-aspire5", deviceType: "laptop", manufacturer: "Acer", series: "Aspire", model: "5", identifiers: [] },
  { id: "dm-apple-mba", deviceType: "laptop", manufacturer: "Apple", series: "MacBook Air", model: "13-inch", identifiers: [] },
  { id: "dm-samsung-galaxy-a", deviceType: "mobile", manufacturer: "Samsung", series: "Galaxy A", model: "Series", identifiers: [] },
  { id: "dm-generic-atx", deviceType: "desktop", manufacturer: "Generic", series: "ATX", model: "Mid-tower build", identifiers: [] },
];

/** Illustrative links only — status is deliberately conservative. */
export const compatibility: CompatRecord[] = [
  { modelId: "dm-hp-pav15", productId: "p-demo-laptop-screen-156-fhd", status: "potential", note: "Sample record. Confirm the connector and resolution against your panel before ordering." },
  { modelId: "dm-dell-insp15", productId: "p-demo-laptop-screen-156-fhd", status: "potential", note: "Sample record. Panel variants differ by sub-model." },
  { modelId: "dm-asus-vivo", productId: "p-demo-laptop-screen-156-fhd", status: "incompatible", note: "Sample record showing how incompatibility is displayed." },
  { modelId: "dm-hp-pav15", productId: "p-demo-laptop-battery-3cell", status: "potential", note: "Sample record. Match the part number printed on your battery." },
  { modelId: "dm-lenovo-ip3", productId: "p-demo-laptop-battery-3cell", status: "potential", note: "Sample record." },
  { modelId: "dm-hp-pav15", productId: "p-demo-laptop-keyboard-us", status: "potential", note: "Sample record. Layout and frame vary by sub-model." },
  { modelId: "dm-lenovo-ip3", productId: "p-demo-ddr4-sodimm-8gb", status: "potential", note: "Sample record. Check the generation your laptop supports." },
  { modelId: "dm-acer-aspire5", productId: "p-demo-nvme-ssd-512", status: "potential", note: "Sample record. Confirm an M.2 NVMe slot is present." },
  { modelId: "dm-dell-insp15", productId: "p-demo-laptop-charger-65w", status: "potential", note: "Sample record. Confirm connector size and wattage." },
  { modelId: "dm-samsung-galaxy-a", productId: "p-demo-mobile-display", status: "unverified", note: "Sample record. Variants differ by model number." },
  { modelId: "dm-generic-atx", productId: "p-demo-psu-550", status: "potential", note: "Sample record." },
];
