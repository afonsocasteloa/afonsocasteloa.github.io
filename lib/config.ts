import player from "./player.json";

export const RIOT_ID = `${player.name}#${player.tag}`;
const trackerProfile = `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(RIOT_ID)}`;
const competitive = "platform=pc&playlist=competitive";
const seasonId = "8102cd81-43a0-d0d7-bd59-47b8fe9bed1b";

export const PLAYER = {
  displayName: "Afonso",
  riotName: player.name,
  riotTag: player.tag,
  age: 19,
  about:
    "Tenho 19 anos e o meu sonho é um dia ser jogador profissional de Valorant. Jogo ranked em PC, aqui em Portugal, e neste momento estou a focar-me no Iniciador — o papel em que quero evoluir.",
  platform: "pc",
  seasonId,
  seasonLabel: "Todos os atos",
  seasonShort: "Carreira",
  seasonRange: "EP 5 → V26 ACT V",
  trackerMatches:
    `${trackerProfile}/matches?${competitive}`,
  trackerOverview:
    `${trackerProfile}/overview?${competitive}`,
  trackerCurrent:
    `${trackerProfile}/overview?${competitive}&season=${seasonId}`,
  trackerAgents:
    `${trackerProfile}/agents?${competitive}`,
  trackerMaps:
    `${trackerProfile}/maps?${competitive}`,
  trackerWeapons:
    `${trackerProfile}/weapons?${competitive}`,
  trackerPerformance:
    `${trackerProfile}/performance?${competitive}`,
} as const;

export type SocialLink = {
  id: "discord" | "twitch" | "youtube" | "instagram" | "tiktok" | "twitter" | "github";
  label: string;
  href?: string;
  copy?: string;
};

export const SOCIALS: SocialLink[] = [
  { id: "discord", label: "Discord", copy: "afonso4343" },
  { id: "twitch", label: "Twitch", href: "https://www.twitch.tv/fazed_val", copy: "Fazed_val" },
  { id: "github", label: "GitHub", href: "https://github.com/afonsocasteloa" },
];

export const REFRESH_MS = 60_000;
export const LIVE_URLS = [
  "/live.json",
  "https://raw.githubusercontent.com/afonsocasteloa/afonsocasteloa.github.io/source/public/live.json",
] as const;
export const VAL_ASSETS = "https://media.valorant-api.com";
export const TRN_CDN = "https://trackercdn.com/cdn/tracker.gg";
