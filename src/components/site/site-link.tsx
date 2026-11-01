"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useSitePrefetch } from "@/lib/site/prefetch";

/** A next/link that does not prefetch on the 404 document (see lib/site/prefetch.ts). An explicit
 * `prefetch` prop still wins. */
export function SiteLink({ prefetch, ...rest }: ComponentProps<typeof Link>) {
  const site = useSitePrefetch();
  return <Link prefetch={prefetch ?? site} {...rest} />;
}
