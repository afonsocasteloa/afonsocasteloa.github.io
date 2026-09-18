import { PLAYER } from "@/lib/config";

export function actMatchesHref(id: string) {
  return `/atos/${id}/`;
}

export function agentMatchesHref(name: string) {
  return `/partidas/?agente=${encodeURIComponent(name)}`;
}

export function mapMatchesHref(name: string) {
  return `/partidas/?mapa=${encodeURIComponent(name)}`;
}

export function trackerMatchHref(id: string) {
  return `https://tracker.gg/valorant/match/${id}`;
}

export function trackerActMatchesHref(id: string) {
  return `${PLAYER.trackerMatches}&season=${id}`;
}

export function trackerPlayerHref(handle: string) {
  return `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(handle)}/overview`;
}
