import type { MetadataRoute } from "next";
import { CAREER_ACTS } from "@/lib/acts";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://afonsocasteloa.github.io";
  const pages = ["", "/eu/", "/atos/", "/partidas/", "/agentes/", "/mapas/", "/armas/"];
  return [
    ...pages.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "hourly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...CAREER_ACTS.map((act) => ({
      url: `${base}/atos/${act.id}/`,
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
  ];
}
