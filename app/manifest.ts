import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MacroBudget",
    short_name: "MacroBudget",
    description: "Plan meals, track macros, and manage household groceries.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff7fb",
    theme_color: "#ec4899",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
