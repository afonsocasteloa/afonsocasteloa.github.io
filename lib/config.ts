export const PLAYER = {
  displayName: "Afonso",
  riotName: "Fazed",
  riotTag: "any",
  age: 19,
  about:
    "Tenho 19 anos e o meu sonho é um dia ser jogador profissional de Valorant. Jogo ranked em PC, aqui em Portugal, e neste momento estou a focar-me no Iniciador — o papel em que quero evoluir.",
  platform: "pc",
  seasonId: "8102cd81-43a0-d0d7-bd59-47b8fe9bed1b",
  seasonLabel: "Todos os atos",
  seasonShort: "Carreira",
  seasonRange: "EP 5 → V26 ACT V",
  trackerMatches:
    "https://tracker.gg/valorant/profile/riot/Fazed%23any/matches?platform=pc&playlist=competitive",
  trackerOverview:
    "https://tracker.gg/valorant/profile/riot/Fazed%23any/overview?platform=pc&playlist=competitive",
  trackerCurrent:
    "https://tracker.gg/valorant/profile/riot/Fazed%23any/overview?platform=pc&playlist=competitive&season=8102cd81-43a0-d0d7-bd59-47b8fe9bed1b",
  trackerAgents:
    "https://tracker.gg/valorant/profile/riot/Fazed%23any/agents?platform=pc&playlist=competitive",
  trackerMaps:
    "https://tracker.gg/valorant/profile/riot/Fazed%23any/maps?platform=pc&playlist=competitive",
  trackerWeapons:
    "https://tracker.gg/valorant/profile/riot/Fazed%23any/weapons?platform=pc&playlist=competitive",
  trackerPerformance:
    "https://tracker.gg/valorant/profile/riot/Fazed%23any/performance?platform=pc&playlist=competitive",
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

export const REFRESH_MS = 90_000;
export const VAL_ASSETS = "https://media.valorant-api.com";
export const TRN_CDN = "https://trackercdn.com/cdn/tracker.gg";
