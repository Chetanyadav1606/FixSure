import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";

/**
 * DRAFT policy text. Contains no invented numbers — items in [brackets] are owner decisions.
 * Have these reviewed by a qualified professional (Consumer Protection (E-Commerce) Rules, DPDP Act, GST) before launch.
 */
const policies: Record<string, { title: string; body: React.ReactNode }> = {
  shipping: { title: "Shipping Policy", body: (<>
    <h2>Where we deliver</h2><p>We deliver to serviceable pincodes. Availability is checked at checkout and orders to areas we do not serve cannot be placed.</p>
    <h2>Charges and timelines</h2><p>Shipping charges and estimated delivery times are shown at checkout before you pay. [Owner: confirm methods, charges and handling time.]</p>
    <h2>Tracking</h2><p>Once your order ships you will receive a courier name and tracking number.</p></>) },
  returns: { title: "Returns Policy", body: (<>
    <h2>Eligibility</h2><p>[Owner: set the return window.] Items must be unused, in original packaging and, for parts, uninstalled. Parts that have been fitted, or electrostatic-sensitive parts opened by the customer, may not be returnable unless faulty.</p>
    <h2>Wrong or faulty items</h2><p>If you receive the wrong or a defective item, contact us with your order number and photos and we will arrange a replacement or refund.</p>
    <h2>How to return</h2><p>Request a return from your order page or contact support.</p></>) },
  refunds: { title: "Refund Policy", body: (<>
    <h2>Refund method</h2><p>Approved refunds are returned to the original payment method. [Owner: confirm processing time.]</p>
    <h2>Cancelled orders</h2><p>Orders cancelled before dispatch are refunded in full.</p></>) },
  warranty: { title: "Warranty Policy", body: (<>
    <h2>Product warranty</h2><p>Each product page states its warranty period, if any. Warranty covers manufacturing defects and does not cover physical or liquid damage, or damage caused by incorrect installation.</p>
    <h2>Repair warranty</h2><p>Repairs may carry a warranty on the work and parts used; the period is stated on your repair quote and invoice. [Owner: confirm terms.]</p></>) },
  privacy: { title: "Privacy Policy", body: (<>
    <h2>What we collect</h2><p>Account details, delivery addresses, order and repair history, and contact details you give us. Payments are processed by Razorpay; we do not store card details.</p>
    <h2>How we use it</h2><p>To fulfil orders and repairs, provide support, and meet legal obligations. We do not sell personal data.</p>
    <h2>Your rights</h2><p>You may ask to access, correct or delete your data by contacting us. [Owner: add grievance officer name and contact as required by Indian law.]</p></>) },
  terms: { title: "Terms & Conditions", body: (<>
    <h2>Using this site</h2><p>By placing an order or booking a repair you agree to these terms. Prices are in INR and may change; the price at checkout applies.</p>
    <h2>Compatibility</h2><p>Compatibility information is provided in good faith from recorded data. Verify part numbers before ordering.</p>
    <h2>Repairs</h2><p>Repairs begin only after you approve a quote. Data on devices is your responsibility; back up before handing over a device.</p>
    <h2>Governing law</h2><p>[Owner: confirm entity name, registered address and jurisdiction.]</p></>) },
};

export function generateStaticParams() { return Object.keys(policies).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = policies[(await params).slug];
  return p ? { title: p.title, alternates: { canonical: `/policies/${(await params).slug}` } } : {};
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = policies[(await params).slug];
  if (!p) notFound();
  return (
    <PageShell title={p.title}>
      <p className="rounded-lg border border-gold-400/50 bg-gold-100 p-4 text-sm">Draft policy: pending final business and legal review.</p>
      {p.body}
    </PageShell>
  );
}
