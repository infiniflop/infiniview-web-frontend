import { Mona_Sans } from "next/font/google";

// The 404 document's own copy of the text face. It is not preloaded: a preload declared by the 404
// is attached to every page of the app, and /preview (which has its own fonts) would then report a
// font it never uses. The face is requested as soon as the 404's CSS applies it, which is immediate.
export const mona404 = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona",
  axes: ["wdth"],
  display: "swap",
  preload: false,
});
