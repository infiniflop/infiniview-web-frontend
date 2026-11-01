import { Mona_Sans } from "next/font/google";

// Mona Sans is a variable family with a width axis (wdth 75–125). Headlines
// lean on that axis. Shared by the marketing layout and the root-level
// not-found page. (The mono face is in fonts-mono.ts: importing this module
// must not make a page preload a font it never uses.)
export const mona = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona",
  axes: ["wdth"],
  display: "swap",
});
