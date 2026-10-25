import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Infiniview",
    short_name: "Infiniview",
    description:
      "AI-powered code review, SAST, DAST, and penetration testing — fully automated in cloud sandboxes.",
    start_url: "/",
    display: "browser",
    background_color: "#03040a",
    theme_color: "#03040a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
