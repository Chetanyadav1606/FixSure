import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-50 cursor-pointer whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "btn-gold font-bold hover:brightness-110",
        gold: "btn-gold font-bold hover:brightness-110",
        outline: "btn-blue",
        ghost: "text-ink hover:bg-surface-2",
        onDark: "btn-blue",
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
