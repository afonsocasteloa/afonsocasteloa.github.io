import { PLAYER, SOCIALS } from "@/lib/config";
import { grouped } from "@/lib/format";
import type { ActRow, AgentRow, MapRow, MatchCard, TrackerSnapshot, WeaponRow } from "@/lib/types";

export type IdentityKit = {
  agent: AgentRow;
  weapon: WeaponRow;
  map: MapRow;
  role: string;
};

export type Identity = {
  handle: string;
  hours: number;
  days: number;
  origin: ActRow | undefined;
  currentAct: ActRow | undefined;
  kit: IdentityKit | null;
  bio: string;
  facts: { label: string; value: string }[];
  highlights: MatchCard[];
};

function hoursFrom(playtime: string) {
  const n = Number(String(playtime).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function bestMap(maps: MapRow[]) {
  const solid = maps.filter((map) => map.wins + map.losses >= 80);
  const pool = solid.length ? solid : maps;
  return [...pool].sort((a, b) => b.winRate - a.winRate)[0];
}

function allMatches(data: TrackerSnapshot): MatchCard[] {
  const seen = new Set<string>();
  const out: MatchCard[] = [];
  const push = (match: MatchCard) => {
    if (!match?.id || seen.has(match.id)) return;
    seen.add(match.id);
    out.push(match);
  };
  for (const list of Object.values(data.matchesByAct || {})) {
    for (const match of list) push(match);
  }
  for (const match of data.recent) push(match);
  return out;
}

function scoreHighlight(match: MatchCard) {
  let score = match.acs / 20;
  if (match.won) score += 4;
  if (match.placement === "MVP") score += 55;
  const badges = match.badges.join(" ");
  if (/ace/i.test(badges)) score += 110;
  if (/1v5/i.test(badges)) score += 90;
  if (/1v4/i.test(badges)) score += 70;
  if (/1v3/i.test(badges)) score += 45;
  if (/1v2/i.test(badges)) score += 20;
  if (/clutch/i.test(badges)) score += 12;
  return score;
}

export function highlightMatches(data: TrackerSnapshot, limit = 8): MatchCard[] {
  return allMatches(data)
    .map((match) => ({ match, score: scoreHighlight(match) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.match);
}

export function personJsonLd(data: TrackerSnapshot) {
  const identity = buildIdentity(data);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PLAYER.displayName,
    alternateName: identity.handle,
    nationality: "PT",
    url: "https://afonsocasteloa.github.io/",
    image: data.avatar,
    description: identity.bio,
    sameAs: [PLAYER.trackerOverview, ...SOCIALS.flatMap((row) => (row.href ? [row.href] : []))],
  };
}

export function buildIdentity(data: TrackerSnapshot): Identity {
  const handle = `${data.name}#${data.tag}`;
  const hours = hoursFrom(data.playtime);
  const days = hours ? Math.round(hours / 24) : 0;
  const origin = data.acts[data.acts.length - 1];
  const currentAct = data.acts.find((act) => act.current) ?? data.acts[0];
  const agent = data.agents[0];
  const weapon = data.weapons[0];
  const map = bestMap(data.maps);
  const role = data.roles[0]?.name || "Duelist";
  const kit = agent && weapon && map ? { agent, weapon, map, role } : null;
  const peakRr = data.peak.rr ? ` (${data.peak.rr} RR)` : "";
  const bio = [
    `Sou o ${PLAYER.displayName} — ${handle} no Valorant, PC, Portugal.`,
    origin && currentAct
      ? `Comecei em ${origin.rank} no ${origin.episode} ${origin.act} e agora jogo ${data.current.name}, com peak ${data.peak.name}${peakRr}${data.peak.season ? ` em ${data.peak.season}` : ""}.`
      : `Jogo competitive em ${data.current.name}.`,
    hours
      ? `São ${grouped(hours)} horas e ${grouped(data.matches)} partidas ranked (${data.winRate}% WR).`
      : "",
    kit
      ? `Main ${kit.agent.name} · ${kit.weapon.name} · ${kit.map.name} · ${kit.role}. Premier: ${data.premier.name}#${data.premier.tag} · ${data.premier.league}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const clutch = data.extras.find((row) => row.label.toLowerCase().includes("clutch"));
  const flawless = data.extras.find((row) => row.label.toLowerCase().includes("flawless"));
  const kad = data.extras.find((row) => row.label === "KAD");

  const facts = [
    { label: "Riot ID", value: handle },
    { label: "País", value: data.country === "PT" ? "Portugal" : data.country },
    { label: "Plataforma", value: "PC · Competitive" },
    { label: "Nível", value: String(data.level) },
    { label: "Tempo de jogo", value: days ? `${data.playtime} · ~${grouped(days)} dias` : data.playtime },
    { label: "Partidas", value: grouped(data.matches) },
    { label: "Rank", value: data.current.name },
    { label: "Peak", value: `${data.peak.name}${data.peak.rr ? ` · ${data.peak.rr} RR` : ""}` },
    { label: "Atos", value: String(data.acts.length) },
    { label: "Tracker views", value: grouped(data.views) },
  ];
  if (kad) facts.push({ label: "KAD", value: kad.value });
  if (clutch) facts.push({ label: clutch.label, value: clutch.value });
  if (flawless) facts.push({ label: "Flawless", value: flawless.value });

  return {
    handle,
    hours,
    days,
    origin,
    currentAct,
    kit,
    bio,
    facts,
    highlights: highlightMatches(data),
  };
}
