export function rankWithRr(rank: { name: string; rr: number | null }) {
  return rank.rr != null ? `${rank.name} · ${rank.rr} RR` : rank.name;
}

export function grouped(n: number | string) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function signed(n: number) {
  return `${n > 0 ? "+" : ""}${n}`;
}

export function tabHref(id: string) {
  if (id === "overview") return "/";
  if (id === "about") return "/eu/";
  if (id === "acts") return "/atos/";
  if (id === "matches") return "/partidas/";
  if (id === "agents") return "/agentes/";
  if (id === "maps") return "/mapas/";
  return "/armas/";
}

export function hintTone(hint: string | null) {
  if (!hint) return "text-[#9aa3b2]";
  if (hint.startsWith("Top 1") || hint.startsWith("Top 2")) return "text-[#f5d76e]";
  if (hint.startsWith("Top")) return "text-[#1be285]";
  if (hint.startsWith("Bottom")) return "text-[#ff8a7a]";
  return "text-[#9aa3b2]";
}

export function wrClass(n: number) {
  return n >= 50 ? "text-[#1be285]" : "text-[#ff8a7a]";
}

export function relativePt(iso: string, now = Date.now()) {
  const delta = now - new Date(iso).getTime();
  if (Number.isNaN(delta)) return "agora";
  const min = Math.max(0, Math.round(delta / 60_000));
  if (min < 1) return "agora";
  if (min === 1) return "há 1 min";
  if (min < 60) return `há ${min} min`;
  const hours = Math.round(min / 60);
  if (hours === 1) return "há 1h";
  if (hours < 24) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "há 1 dia" : `há ${days} dias`;
}

export function isSnapshot(value: unknown): value is import("@/lib/types").TrackerSnapshot {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  if (typeof row.name !== "string" || !Array.isArray(row.acts) || !Array.isArray(row.recent)) return false;
  if (!row.matchesByAct || typeof row.matchesByAct !== "object") row.matchesByAct = {};
  return true;
}
