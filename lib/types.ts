export type TabId = "overview" | "about" | "acts" | "matches" | "agents" | "maps" | "weapons";

export type ActRow = {
  id: string;
  episode: string;
  act: string;
  short: string;
  current: boolean;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  playtime: string;
  kd: string;
  hs: string;
  acs: string;
  adr: string;
  rank: string;
  rankIcon: string;
  score: number;
};

export type RankBlock = {
  name: string;
  rr: number | null;
  season?: string;
  icon: string;
};

export type Percentile = {
  label: string;
  value: string;
  hint: string | null;
};

export type MatchCard = {
  id: string;
  agent: string;
  agentIcon: string;
  map: string;
  mapImage: string;
  when: string;
  timestamp?: string;
  won: boolean;
  placement: string;
  roundsWon: number;
  roundsLost: number;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  acs: number;
  hs: number;
  dd: number;
  trs: number;
  badges: string[];
  seasonId?: string;
};

export type AgentRow = {
  name: string;
  icon: string;
  hours: string;
  matches: number;
  winRate: number;
  kd: number;
  adr: number;
  acs: number;
  dd: number;
  bestMap: string;
  bestMapWr: string;
};

export type MapRow = {
  name: string;
  image: string;
  winRate: number;
  wins: number;
  losses: number;
};

export type WeaponRow = {
  name: string;
  type: string;
  icon: string;
  kills: number;
  head: number;
  body: number;
  legs: number;
};

export type RoleRow = {
  name: string;
  icon: string;
  winRate: number;
  record: string;
  kda: number;
  kdaLine: string;
};

export type TrackerSnapshot = {
  fetchedAt: string;
  name: string;
  tag: string;
  country: string;
  views: number;
  level: number;
  avatar: string;
  banner: string;
  cardWide: string;
  badges: { name: string; icon: string }[];
  current: RankBlock;
  peak: RankBlock;
  premier: {
    name: string;
    tag: string;
    league: string;
    icon: string;
    members: string[];
  };
  playtime: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  trackerScore: number;
  overview: Percentile[];
  extras: { label: string; value: string }[];
  accuracy: { head: number; body: number; legs: number; headHits: number; bodyHits: number; legHits: number };
  last20: { record: string; kd: number; adr: number };
  roles: RoleRow[];
  weapons: WeaponRow[];
  maps: MapRow[];
  agents: AgentRow[];
  acts: ActRow[];
  recent: MatchCard[];
  matchesByAct: Record<string, MatchCard[]>;
};
