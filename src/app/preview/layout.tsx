// Static demo UI. All data is mocked. No backend logic.

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard preview — Infiniview",
  description:
    "Static, sample-data preview of the Infiniview dashboard. All data shown is fictional and intended for demonstration only.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return <div className="dark">{children}</div>;
}
