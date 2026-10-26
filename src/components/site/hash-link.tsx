"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * A link to "/#section". On the home page it is a plain same-page anchor, so the shell's smooth,
 * nav-aware scroll (and its focus handoff) takes it: next/link would do its own instant jump that
 * leaves the section's top under the fixed nav. From any other page it stays a client-side link.
 */
export function HashLink({ href, children, ...rest }: { href: string } & Omit<ComponentProps<"a">, "href">) {
  const pathname = usePathname();
  if (pathname === "/" && href.startsWith("/#")) {
    return (
      <a href={href.slice(1)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
