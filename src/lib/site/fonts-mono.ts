import { JetBrains_Mono } from "next/font/google";

// Reserved for real code and traces (the scan card, the findings console); only the marketing
// layout imports this, so the 404 document does not preload it.
export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
  display: "swap",
});
