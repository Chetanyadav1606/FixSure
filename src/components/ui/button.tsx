import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "bg-navy-900 text-white hover:bg-navy-800",
        gold: "bg-gold-500 text-navy-950 hover:bg-gold-400",
        outline: "border border-navy-900/25 bg-white text-navy-900 hover:border-navy-900 hover:bg-navy-50",
        ghost: "text-navy-900 hover:bg-navy-50",
        onDark: "border border-white/40 text-white hover:bg-white/10",
      },
      size: { sm: "h-9 px-3 text-sm", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-base" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = VariantProps<typeof buttonStyles> & { className?: string };

export function Button({ variant, size, className, ...rest }: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...rest} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  href,
  ...rest
}: Props & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const external = /^(https?:|tel:|mailto:)/.test(href);
  const cls = cn(buttonStyles({ variant, size }), className);
  return external ? <a href={href} className={cls} {...rest} /> : <Link href={href} className={cls} {...rest} />;
}
