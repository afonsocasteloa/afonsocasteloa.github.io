import { CAREER_ACTS } from "@/lib/acts";

const TIER = "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiersv2";
const HERO = "https://trackercdn.com/cdn/tracker.gg/valorant/images/heroes/hero-sova.jpg";
const AGENT = "https://media.valorant-api.com/agents";
const CARD = "7fb96942-4e17-f92d-7bdb-f6ab40170df0";

const agents: Record<string, string> = {
  Sova: "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
  Fade: "dade69b4-4f5a-8528-247b-219e5a1facd6",
  Jett: "add6443a-41bd-e414-f6ad-e58d267f4e95",
  Phoenix: "eb93336a-449b-9c1b-0a54-a891f7921d69",
  Waylay: "df1cb487-4902-002e-5c17-d28e83e78588",
  Skye: "6f2a04ca-43e0-be17-7f36-b3908627744d",
  Killjoy: "1e58de9c-4950-5125-93e9-a0aee9f98746",
  Clove: "1dbf2edd-4729-0984-3115-daa5eed44993",
  Chamber: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
};

const maps: Record<string, string> = {
  Ascent: "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
  Split: "d960549e-485c-e861-8d71-aa9d1aed12a2",
  Fracture: "b529448b-4d60-346e-e89e-00a4c527a405",
  Bind: "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
  Breeze: "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
  Abyss: "224b0a95-48b9-f703-1bd8-67aca101a61f",
  Lotus: "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
  Sunset: "92584fbe-486a-b1b2-9faa-39b0f486b498",
  Pearl: "fd267378-4d1d-484f-ff52-77821ed10dc2",
  Summit: "756da597-416b-c0f2-f47b-afbdf28670bc",
  Icebox: "e2ad5c54-4114-a870-9641-8ea21279579a",
  Corrode: "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
  Haven: "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
};

function agentIcon(name: string) {
  const id = agents[name] ?? agents.Sova;
  return `${AGENT}/${id}/displayicon.png`;
}

function mapImage(name: string) {
  const key = Object.keys(maps).find((item) => item.toLowerCase() === name.toLowerCase()) ?? "Ascent";
  return `https://media.valorant-api.com/maps/${maps[key]}/splash.png`;
}

function weaponIcon(id: string) {
  return `https://media.valorant-api.com/weapons/${id}/displayicon.png`;
}

function match(
  partial: Omit<import("@/lib/types").MatchCard, "agentIcon" | "mapImage" | "kd"> & { kd?: number },
) {
  const kd = partial.kd ?? Number((partial.kills / Math.max(1, partial.deaths)).toFixed(1));
  return {
    ...partial,
    kd,
    agentIcon: agentIcon(partial.agent),
    mapImage: mapImage(partial.map),
  };
}

export const TRACKER_SEED: import("@/lib/types").TrackerSnapshot = {
  fetchedAt: "2026-09-17T23:05:14.537Z",
  name: "Fazed",
  tag: "any",
  country: "PT",
  views: 5804,
  level: 843,
  avatar: `https://media.valorant-api.com/playercards/${CARD}/displayicon.png`,
  banner: HERO,
  cardWide: `https://media.valorant-api.com/playercards/${CARD}/wideart.png`,
  badges: [
    {
      name: "One Trick Pony",
      icon: "https://trackercdn.com/cdn/awards/badges/badge_one-trick-pony-II.png",
    },
    {
      name: "Streak IV",
      icon: "https://trackercdn.com/cdn/awards/badges/badge_xp-streak-prismatic.png",
    },
    {
      name: "Mythic",
      icon: "https://trackercdn.com/cdn/awards/badges/badge_xp-tier1.png",
    },
  ],
  current: {
    name: "Ascendant 3",
    rr: null,
    icon: `${TIER}/23.png`,
  },
  peak: {
    name: "Immortal 3",
    rr: 210,
    season: "V25: ACT II",
    icon: `${TIER}/26.png`,
  },
  premier: {
    name: "Krypto Gaming",
    tag: "KRYP",
    league: "IBIT · Contender · #27",
    icon: "https://trackercdn.com/cdn/tracker.gg/valorant/premier/team-icons/99d009eb-4075-71c8-6785-b8b4af9aed69.png",
    members: ["wxlf#1410", "Chxse Atlantic#nez", "Fazed#any", "S1ckoo#999", "MAZZ#MAZZ", "Minx#bubu"],
  },
  playtime: "3 478h",
  matches: 6073,
  wins: 3014,
  losses: 2972,
  winRate: 49.6,
  trackerScore: 503,
  overview: [
    { label: "Damage / Ronda", value: "142.1", hint: "Carreira" },
    { label: "K/D", value: "1.05", hint: "Carreira" },
    { label: "Headshot %", value: "31.4%", hint: "Carreira" },
    { label: "Win %", value: "49.6%", hint: "3 014W 2 972L" },
    { label: "Wins", value: "3 014", hint: "6 073 partidas" },
    { label: "KAST", value: "69.7%", hint: "Carreira" },
    { label: "DDΔ / Ronda", value: "+4", hint: "Carreira" },
    { label: "ACS", value: "215.4", hint: "Carreira" },
  ],
  extras: [
    { label: "Kills", value: "98 651" },
    { label: "Deaths", value: "93 919" },
    { label: "Assists", value: "24 630" },
    { label: "KAD", value: "1.31" },
    { label: "Kills / Ronda", value: "0.8" },
    { label: "Clutches 1v1", value: "1 459" },
    { label: "Flawless", value: "4 715" },
    { label: "Atos jogados", value: "26" },
    { label: "Do Iron ao Immortal", value: "EP 5 → V25" },
  ],
  accuracy: { head: 44.5, body: 53.6, legs: 1.9, headHits: 326, bodyHits: 392, legHits: 14 },
  last20: { record: "13W – 7L (65%)", kd: 1.2, adr: 149 },
  roles: [
    {
      name: "Duelist",
      icon: "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
      winRate: 50.8,
      record: "1 190W – 1 123L",
      kda: 1.27,
      kdaLine: "39.9K / 37.3K / 7.46K",
    },
    {
      name: "Initiator",
      icon: "https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png",
      winRate: 50.1,
      record: "694W – 675L",
      kda: 1.37,
      kdaLine: "21.5K / 21K / 7.23K",
    },
    {
      name: "Sentinel",
      icon: "https://media.valorant-api.com/agents/roles/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png",
      winRate: 47.9,
      record: "618W – 646L",
      kda: 1.27,
      kdaLine: "20.1K / 19K / 4.02K",
    },
    {
      name: "Controller",
      icon: "https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png",
      winRate: 48.5,
      record: "512W – 528L",
      kda: 1.39,
      kdaLine: "17.1K / 16.6K / 5.93K",
    },
  ],
  weapons: [
    {
      name: "Vandal",
      type: "Rifle",
      icon: weaponIcon("9c82e19d-4575-0200-1a81-3eacf00cf872"),
      kills: 48287,
      head: 43,
      body: 53,
      legs: 3,
    },
    {
      name: "Phantom",
      type: "Rifle",
      icon: weaponIcon("ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a"),
      kills: 13908,
      head: 40,
      body: 56,
      legs: 4,
    },
    {
      name: "Sheriff",
      type: "Sidearm",
      icon: weaponIcon("e336c6b8-418d-9340-d77f-7a9e4cfe0702"),
      kills: 9235,
      head: 54,
      body: 45,
      legs: 1,
    },
  ],
  maps: [
    { name: "Abyss", image: mapImage("abyss"), winRate: 57.3, wins: 145, losses: 107 },
    { name: "Summit", image: mapImage("summit"), winRate: 56.2, wins: 27, losses: 21 },
    { name: "Icebox", image: mapImage("icebox"), winRate: 52.4, wins: 216, losses: 188 },
    { name: "Haven", image: mapImage("haven"), winRate: 52.0, wins: 410, losses: 372 },
    { name: "Corrode", image: mapImage("corrode"), winRate: 51.5, wins: 88, losses: 82 },
    { name: "Bind", image: mapImage("bind"), winRate: 51.3, wins: 339, losses: 311 },
    { name: "Sunset", image: mapImage("sunset"), winRate: 50.6, wins: 218, losses: 209 },
    { name: "Pearl", image: mapImage("pearl"), winRate: 49.4, wins: 259, losses: 258 },
    { name: "Lotus", image: mapImage("lotus"), winRate: 49.2, wins: 322, losses: 315 },
    { name: "Split", image: mapImage("split"), winRate: 47.9, wins: 313, losses: 333 },
    { name: "Breeze", image: mapImage("breeze"), winRate: 47.7, wins: 163, losses: 171 },
    { name: "Ascent", image: mapImage("ascent"), winRate: 45.7, wins: 340, losses: 395 },
    { name: "Fracture", image: mapImage("fracture"), winRate: 44.6, wins: 174, losses: 210 },
  ],
  agents: [
    {
      name: "Jett",
      icon: agentIcon("Jett"),
      hours: "682h",
      matches: 1175,
      winRate: 50.4,
      kd: 1.06,
      adr: 147.4,
      acs: 224.8,
      dd: 5,
      bestMap: "Pearl",
      bestMapWr: "55% WR",
    },
    {
      name: "Sova",
      icon: agentIcon("Sova"),
      hours: "317h",
      matches: 562,
      winRate: 52.8,
      kd: 1.05,
      adr: 140.0,
      acs: 208.5,
      dd: 8,
      bestMap: "Haven",
      bestMapWr: "58% WR",
    },
    {
      name: "Chamber",
      icon: agentIcon("Chamber"),
      hours: "307h",
      matches: 533,
      winRate: 47.8,
      kd: 1.03,
      adr: 133.6,
      acs: 199.7,
      dd: 0,
      bestMap: "Pearl",
      bestMapWr: "56% WR",
    },
  ],
  acts: CAREER_ACTS,
  recent: [
    match({ id: "1", agent: "Skye", map: "Summit", when: "há 11h", won: true, placement: "3rd", roundsWon: 15, roundsLost: 13, kills: 33, deaths: 17, assists: 7, acs: 321, hs: 47, dd: 72, trs: 829, badges: ["4k x2", "3k x4"] }),
    match({ id: "2", agent: "Phoenix", map: "Ascent", when: "há 11h", won: true, placement: "4th", roundsWon: 14, roundsLost: 12, kills: 20, deaths: 17, assists: 6, acs: 222, hs: 54, dd: 14, trs: 606, badges: ["1v2 Clutch"] }),
    match({ id: "3", agent: "Fade", map: "Lotus", when: "há 14h", won: false, placement: "4th", roundsWon: 13, roundsLost: 15, kills: 23, deaths: 17, assists: 5, acs: 232, hs: 36, dd: 40, trs: 660, badges: ["1v2 Clutch", "4k"] }),
    match({ id: "4", agent: "Waylay", map: "Split", when: "há 15h", won: true, placement: "MVP", roundsWon: 13, roundsLost: 8, kills: 28, deaths: 15, assists: 4, acs: 368, hs: 47, dd: 94, trs: 978, badges: ["High KAST", "1v2 Clutch"] }),
    match({ id: "5", agent: "Sova", map: "Summit", when: "há 15h", won: true, placement: "2nd", roundsWon: 13, roundsLost: 6, kills: 22, deaths: 7, assists: 2, acs: 292, hs: 66, dd: 125, trs: 971, badges: ["High KAST", "1v1 Clutch"] }),
    match({ id: "6", agent: "Sova", map: "Sunset", when: "há 16h", won: true, placement: "6th", roundsWon: 13, roundsLost: 5, kills: 12, deaths: 12, assists: 5, acs: 184, hs: 52, dd: 6, trs: 676, badges: ["1v3 Clutch"] }),
    match({ id: "7", agent: "Sova", map: "Ascent", when: "há 1 dia", won: false, placement: "5th", roundsWon: 6, roundsLost: 13, kills: 13, deaths: 14, assists: 4, acs: 188, hs: 34, dd: 14, trs: 444, badges: ["3k"] }),
    match({ id: "8", agent: "Fade", map: "Lotus", when: "há 1 dia", won: false, placement: "5th", roundsWon: 7, roundsLost: 13, kills: 15, deaths: 15, assists: 4, acs: 206, hs: 47, dd: -2, trs: 471, badges: ["1v1 Clutch"] }),
    match({ id: "9", agent: "Sova", map: "Haven", when: "há 1 dia", won: false, placement: "9th", roundsWon: 13, roundsLost: 15, kills: 21, deaths: 22, assists: 2, acs: 188, hs: 45, dd: -26, trs: 500, badges: ["1v2 Clutch"] }),
    match({ id: "10", agent: "Sova", map: "Abyss", when: "há 1 dia", won: true, placement: "2nd", roundsWon: 13, roundsLost: 1, kills: 16, deaths: 6, assists: 6, acs: 301, hs: 54, dd: 113, trs: 906, badges: ["3k x3"] }),
    match({ id: "11", agent: "Jett", map: "Haven", when: "há 1 dia", won: true, placement: "2nd", roundsWon: 13, roundsLost: 7, kills: 20, deaths: 12, assists: 3, acs: 274, hs: 50, dd: 48, trs: 859, badges: ["Ace"] }),
    match({ id: "12", agent: "Waylay", map: "Summit", when: "há 2 dias", won: false, placement: "7th", roundsWon: 12, roundsLost: 14, kills: 20, deaths: 22, assists: 3, acs: 215, hs: 45, dd: -29, trs: 475, badges: ["4k"] }),
    match({ id: "13", agent: "Fade", map: "Lotus", when: "há 2 dias", won: true, placement: "2nd", roundsWon: 13, roundsLost: 5, kills: 16, deaths: 13, assists: 4, acs: 245, hs: 36, dd: 25, trs: 719, badges: ["4k"] }),
    match({ id: "14", agent: "Fade", map: "Split", when: "há 2 dias", won: true, placement: "5th", roundsWon: 13, roundsLost: 10, kills: 17, deaths: 13, assists: 5, acs: 204, hs: 53, dd: 20, trs: 647, badges: ["1v2 Clutch"] }),
    match({ id: "15", agent: "Sova", map: "Abyss", when: "há 2 dias", won: true, placement: "8th", roundsWon: 13, roundsLost: 9, kills: 13, deaths: 17, assists: 3, acs: 159, hs: 42, dd: -20, trs: 383, badges: ["1v2 Clutch"] }),
    match({ id: "16", agent: "Killjoy", map: "Ascent", when: "há 2 dias", won: true, placement: "6th", roundsWon: 13, roundsLost: 11, kills: 18, deaths: 18, assists: 3, acs: 207, hs: 53, dd: 22, trs: 646, badges: ["1v1 Clutch"] }),
    match({ id: "17", agent: "Sova", map: "Sunset", when: "há 2 dias", won: true, placement: "8th", roundsWon: 13, roundsLost: 6, kills: 10, deaths: 12, assists: 4, acs: 150, hs: 24, dd: -40, trs: 506, badges: ["3k"] }),
    match({ id: "18", agent: "Sova", map: "Summit", when: "há 3 dias", won: true, placement: "10th", roundsWon: 13, roundsLost: 9, kills: 10, deaths: 14, assists: 4, acs: 126, hs: 39, dd: -23, trs: 365, badges: ["1v2 Clutch"] }),
    match({ id: "19", agent: "Fade", map: "Split", when: "há 3 dias", won: false, placement: "2nd", roundsWon: 11, roundsLost: 13, kills: 21, deaths: 18, assists: 6, acs: 249, hs: 36, dd: 60, trs: 773, badges: [] }),
    match({ id: "20", agent: "Clove", map: "Sunset", when: "há 4 dias", won: false, placement: "10th", roundsWon: 7, roundsLost: 13, kills: 9, deaths: 17, assists: 5, acs: 121, hs: 32, dd: -75, trs: 227, badges: [] }),
  ],
};
