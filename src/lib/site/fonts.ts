import { Mona_Sans, JetBrains_Mono } from "next/font/google";

// Mona Sans is a variable family with a width axis (wdth 75–125). Headlines
// lean on that axis; JetBrains Mono is reserved for real code and traces.
// Shared by the marketing layout and the root-level not-found page.
export const mona = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona",
  axes: ["wdth"],
  display: "swap",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
  display: "swap",
});
