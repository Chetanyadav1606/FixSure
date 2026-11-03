import { z } from "zod";

export const INDIAN_MOBILE = /^(?:\+?91|0)?[6-9]\d{9}$/;
export const PHOTO_PATH = /^guest\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

const clean = (s: string) => s.replace(/[\s-]/g, "");

export const addressSchema = z.object({
  line1: z.string().trim().min(5, "Enter your full address").max(200),
  landmark: z.string().trim().max(100).optional().or(z.literal("")),
  pincode: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
  city: z.string().trim().min(2, "Enter your city").max(60),
});

export const bookingSchema = z
  .object({
    manufacturer: z.string().trim().min(1, "Choose or enter your phone brand").max(60),
    model: z.string().trim().min(1, "Choose or enter your phone model").max(80),
    serviceId: z.string().trim().max(64).optional().or(z.literal("")),
    issueSummary: z.string().trim().min(3, "Tell us what is wrong").max(120),
    issueDetails: z.string().trim().max(1000).optional().or(z.literal("")),
    photoPaths: z.array(z.string().regex(PHOTO_PATH)).max(3).default([]),
    fulfilment: z.enum(["doorstep", "pickup", "store_dropoff"]),
    placeType: z.enum(["home", "office", "other"]).optional(),
    address: addressSchema.optional(),
    slotId: z.string().uuid().optional().or(z.literal("")),
    contactName: z.string().trim().min(2, "Enter your name").max(80),
    contactPhone: z.string().transform(clean).refine((v) => INDIAN_MOBILE.test(v), "Enter a valid Indian mobile number"),
    contactEmail: z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")),
    consent: z.literal(true, { error: "Please confirm to continue" }),
  })
  .superRefine((v, ctx) => {
    if (v.fulfilment !== "store_dropoff" && !v.address) {
      ctx.addIssue({ code: "custom", path: ["address"], message: "Address is required for doorstep or pickup" });
    }
  });

export type BookingInput = z.input<typeof bookingSchema>;

export const trackSchema = z.object({
  ticket: z.string().trim().toUpperCase().regex(/^FSR-\d{3,}$/, "Ticket looks like FSR-1001"),
  secret: z.string().trim().min(6, "Enter the phone number on the booking, or your tracking key").max(64),
});
