import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const livePath = join(root, "public", "live.json");
const PLAYER = "Fazed#any";
const ENCODED = encodeURIComponent(PLAYER);
const TRACKER =
  "https://tracker.gg/valorant/profile/riot/Fazed%23any/overview?platform=pc&playlist=competitive";
const API = "https://api.tracker.gg/api/v2/valorant/standard";
const MAP_IDS = {
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

const ROLE_ICON = {
  Duelist: "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
  Initiator: "https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png",
  Sentinel: "https://media.valorant-api.com/agents/roles/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png",
  Controller: "https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png",
};

function loadFallback() {
  try {
    return JSON.parse(readFileSync(livePath, "utf8"));
  } catch {
    return null;
  }
}

function num(stats, key, fallback = 0) {
  const value = stats?.[key]?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function display(stats, key, fallback = "—") {
  const value = stats?.[key]?.displayValue;
  return typeof value === "string" && value.trim() ? ptNum(value) : fallback;
}

function signedStat(stats, key) {
  const raw = display(stats, key, "0");
  if (raw.startsWith("+") || raw.startsWith("-")) return raw;
  return num(stats, key) > 0 ? `+${raw}` : raw;
}

function ptNum(value) {
  return String(value).replace(/,/g, " ");
}

function round(value, digits = 1) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function titleMap(key) {
  if (!key) return "—";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function mapImage(name) {
  const key = Object.keys(MAP_IDS).find((item) => item.toLowerCase() === String(name).toLowerCase());
  if (!key) return `https://media.valorant-api.com/maps/${MAP_IDS.Ascent}/splash.png`;
  return `https://media.valorant-api.com/maps/${MAP_IDS[key]}/splash.png`;
}

function episodeLabel(season) {
  const name = season.episodeName || "";
  const match = name.match(/Season\s+(\d+)/i);
  if (match) {
    const n = Number(match[1]);
    return n >= 25 ? `V${n}` : `EP ${n}`;
  }
  const short = season.shortName || "";
  const ep = short.split(":")[0]?.trim();
  if (ep?.startsWith("E") && Number(ep.slice(1)) >= 25) return `V${ep.slice(1)}`;
  if (ep?.startsWith("E")) return `EP ${ep.slice(1)}`;
  return ep || name || "—";
}

function actLabel(season) {
  const act = season.actName || "";
  const match = act.match(/(\d+)/);
  const n = match ? romanish(Number(match[1])) : act.replace(/act/i, "").trim();
  return `ACT ${n}`;
}

function romanish(n) {
  return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"][n] || String(n);
}

function shortAct(episode, act) {
  const ep = episode.replace("EP ", "E").replace(" ", "");
  const a = act.replace("ACT ", "A");
  return `${ep}: ${a}`;
}

function placementLabel(n) {
  if (n === 1) return "MVP";
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

function relativePt(iso, now = Date.now()) {
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

function compactK(n) {
  if (n >= 1000) return `${ptNum((n / 1000).toFixed(n >= 10_000 ? 0 : 2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1"))}K`;
  return ptNum(Math.round(n));
}

function badgeLabel(tag) {
  const count = tag.count && tag.count > 1 ? ` x${tag.count}` : "";
  return `${tag.name}${count}`;
}

async function scrape() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    ({ chromium } = await import("playwright-core"));
  }

  const launch = process.env.CI
    ? { headless: true, args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"] }
    : {
        channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
        headless: true,
        args: ["--disable-blink-features=AutomationControlled"],
      };

  const browser = await chromium.launch(launch);
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
    viewport: { width: 1440, height: 1800 },
  });

  try {
    await page.goto(TRACKER, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(8000);
    page.setDefaultTimeout(180_000);

    const payload = await page.evaluate(
      async ({ api, encoded }) => {
        const grab = async (url) => {
          const res = await fetch(url, { credentials: "include" });
          const text = await res.text();
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            json = null;
          }
          return { ok: res.ok, status: res.status, json };
        };

        const profile = await grab(`${api}/profile/riot/${encoded}?`);
        const playlist = await grab(
          `${api}/profile/riot/${encoded}/segments/playlist?playlist=competitive&source=web`,
        );
        const matches = await grab(`${api}/matches/riot/${encoded}?platform=pc&type=competitive`);

        const seasons = profile.json?.data?.metadata?.seasons ?? [];
        const acts = [];
        for (const season of seasons) {
          const row = await grab(
            `${api}/profile/riot/${encoded}/segments/season?playlist=competitive&seasonId=${season.id}&source=web`,
          );
          acts.push({ id: season.id, meta: season, status: row.status, json: row.json });
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        const rosterId = profile.json?.data?.metadata?.premierRosterId;
        const premier = rosterId
          ? await grab(`https://api.tracker.gg/api/v1/valorant/premier/roster/${rosterId}/summary`)
          : { ok: false, status: 0, json: null };

        return { profile, playlist, matches, acts, premier };
      },
      { api: API, encoded: ENCODED },
    );

    return buildSnapshot(payload);
  } finally {
    await browser.close();
  }
}

function listFrom(payload) {
  const data = payload?.json?.data;
  if (Array.isArray(data)) return data;
  if (data) return [data];
  return [];
}

function buildSnapshot(payload) {
  const profile = payload.profile?.json?.data;
  const playlistSegs = listFrom(payload.playlist);
  const playlist = playlistSegs.find((row) => row.type === "playlist");
  if (!profile || !playlist) {
    throw new Error("Tracker não devolveu perfil ou playlist competitiva.");
  }

  const stats = playlist.stats ?? {};
  const platform = profile.platformInfo ?? {};
  const user = profile.userInfo ?? {};
  const currentSeasonId = profile.metadata?.defaultSeason;
  const handle = String(platform.platformUserHandle || PLAYER);
  const [name, tag] = handle.split("#");

  const peakMeta = stats.peakRank?.metadata ?? {};
  const rankMeta = stats.rank?.metadata ?? {};
  const avatar = platform.avatarUrl || "";
  const cardId = avatar.match(/playercards\/([^/]+)/)?.[1];

  const agentSegs = playlistSegs.filter((row) => row.type === "agent");
  const mapSegs = playlistSegs.filter((row) => row.type === "map");
  const weaponSegs = playlistSegs.filter((row) => row.type === "weapon");
  const topMaps = playlistSegs.filter((row) => row.type === "agent-top-map");

  const acts = [];
  for (const row of payload.acts ?? []) {
    const list = listFrom(row);
    const season = list.find((item) => item?.type === "season") ?? list[0];
    const s = season?.stats ?? {};
    const matchesPlayed = num(s, "matchesPlayed");
    if (!matchesPlayed) continue;
    const episode = episodeLabel(row.meta);
    const act = actLabel(row.meta);
    const rank = s.rank?.metadata ?? {};
    acts.push({
      id: row.id,
      episode,
      act,
      short: season?.metadata?.shortName?.replace(" Competitive", "") || shortAct(episode, act),
      current: row.id === currentSeasonId,
      matches: matchesPlayed,
      wins: num(s, "matchesWon"),
      losses: num(s, "matchesLost"),
      winRate: round(num(s, "matchesWinPct"), 1),
      playtime: display(s, "timePlayed", "0h"),
      kd: display(s, "kDRatio", "0.00"),
      hs: display(s, "headshotsPercentage", "0%"),
      acs: display(s, "scorePerRound", "0"),
      adr: display(s, "damagePerRound", "0"),
      rank: rank.tierName || display(s, "rank", "—"),
      rankIcon: rank.iconUrl || "",
      score: Math.round(num(s, "trnPerformanceScore")),
    });
  }

  const currentAct = acts.find((row) => row.current) ?? acts[0];
  const trackerScore = currentAct?.score ?? 0;

  const matchesJson = payload.matches?.json?.data?.matches ?? [];
  const recent = matchesJson.slice(0, 20).map((match) => {
    const overview = (match.segments || []).find((row) => row.type === "overview") ?? match.segments?.[0] ?? {};
    const ms = overview.stats ?? {};
    const meta = match.metadata ?? {};
    const om = overview.metadata ?? {};
    const kills = num(ms, "kills");
    const deaths = num(ms, "deaths");
    const timestamp = meta.timestamp;
    const tags = (om.tags || []).filter((tag) => tag.tone !== "Negative").slice(0, 3);
    return {
      id: match.attributes?.id || timestamp,
      agent: om.agentName || "—",
      agentIcon: om.agentImageUrl || "",
      map: meta.mapName || "—",
      mapImage: meta.mapImageUrl || mapImage(meta.mapName),
      when: timestamp ? relativePt(timestamp) : "",
      timestamp,
      won: Boolean(om.hasWon) || meta.result === "victory",
      placement: placementLabel(num(ms, "placement", 0)),
      roundsWon: num(ms, "roundsWon"),
      roundsLost: num(ms, "roundsLost"),
      kills,
      deaths,
      assists: num(ms, "assists"),
      kd: round(num(ms, "kdRatio", deaths ? kills / deaths : kills), 1),
      acs: Math.round(num(ms, "scorePerRound")),
      hs: Math.round(num(ms, "headshotsPercentage")),
      dd: Math.round(num(ms, "damageDeltaPerRound")),
      trs: Math.round(num(ms, "trnPerformanceScore")),
      badges: tags.map(badgeLabel),
    };
  });

  let headHits = 0;
  let bodyHits = 0;
  let legHits = 0;
  let lastKills = 0;
  let lastDeaths = 0;
  let lastAdr = 0;
  for (const match of matchesJson.slice(0, 20)) {
    const ms = (match.segments || [])[0]?.stats ?? {};
    headHits += num(ms, "dealtHeadshots");
    bodyHits += num(ms, "dealtBodyshots");
    legHits += num(ms, "dealtLegshots");
    lastKills += num(ms, "kills");
    lastDeaths += num(ms, "deaths");
    lastAdr += num(ms, "damagePerRound");
  }
  const shotTotal = headHits + bodyHits + legHits || 1;
  const lastWins = recent.filter((row) => row.won).length;
  const lastLen = recent.length || 1;

  const agents = agentSegs
    .map((row) => {
      const key = row.attributes?.key;
      const s = row.stats ?? {};
      const maps = topMaps
        .filter((item) => item.attributes?.key?.endsWith(key))
        .map((item) => ({
          name: titleMap(item.attributes?.mapKey),
          wr: num(item.stats, "matchesWinPct"),
          matches: num(item.stats, "matchesPlayed"),
        }))
        .filter((item) => item.matches >= 5)
        .sort((a, b) => b.wr - a.wr);
      const best = maps[0];
      return {
        name: row.metadata?.name || "—",
        icon: row.metadata?.imageUrl || "",
        role: row.metadata?.role || "Duelist",
        hours: display(s, "timePlayed", "0h"),
        matches: num(s, "matchesPlayed"),
        winRate: round(num(s, "matchesWinPct"), 1),
        kd: round(num(s, "kDRatio"), 2),
        adr: round(num(s, "damagePerRound"), 1),
        acs: round(num(s, "scorePerRound"), 1),
        dd: Math.round(num(s, "damageDeltaPerRound")),
        bestMap: best?.name || "—",
        bestMapWr: best ? `${Math.round(best.wr)}% WR` : "—",
        wins: num(s, "matchesWon"),
        losses: num(s, "matchesLost"),
        kills: num(s, "kills"),
        deaths: num(s, "deaths"),
        assists: num(s, "assists"),
      };
    })
    .sort((a, b) => b.matches - a.matches);

  const rolesMap = new Map();
  for (const agent of agents) {
    const current = rolesMap.get(agent.role) || {
      name: agent.role,
      icon: ROLE_ICON[agent.role] || ROLE_ICON.Duelist,
      wins: 0,
      losses: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
    };
    current.wins += agent.wins;
    current.losses += agent.losses;
    current.kills += agent.kills;
    current.deaths += agent.deaths;
    current.assists += agent.assists;
    rolesMap.set(agent.role, current);
  }
  const roles = ["Duelist", "Initiator", "Sentinel", "Controller"]
    .map((name) => rolesMap.get(name))
    .filter(Boolean)
    .map((role) => {
      const games = role.wins + role.losses || 1;
      return {
        name: role.name,
        icon: role.icon,
        winRate: round((role.wins / games) * 100, 1),
        record: `${ptNum(role.wins)}W – ${ptNum(role.losses)}L`,
        kda: round((role.kills + role.assists) / Math.max(1, role.deaths), 2),
        kdaLine: `${compactK(role.kills)} / ${compactK(role.deaths)} / ${compactK(role.assists)}`,
      };
    });

  const maps = mapSegs
    .map((row) => {
      const s = row.stats ?? {};
      return {
        name: row.metadata?.name || "—",
        image: mapImage(row.metadata?.name),
        winRate: round(num(s, "matchesWinPct"), 1),
        wins: num(s, "matchesWon"),
        losses: num(s, "matchesLost"),
      };
    })
    .sort((a, b) => b.winRate - a.winRate);

  const weapons = weaponSegs
    .map((row) => {
      const s = row.stats ?? {};
      const head = num(s, "dealtHeadshots");
      const body = num(s, "dealtBodyshots");
      const legs = num(s, "dealtLegshots");
      const total = head + body + legs || 1;
      return {
        name: row.metadata?.name || "—",
        type: row.metadata?.category || "Arma",
        icon: row.metadata?.imageUrl || "",
        kills: num(s, "kills"),
        head: Math.round((head / total) * 100),
        body: Math.round((body / total) * 100),
        legs: Math.round((legs / total) * 100),
      };
    })
    .sort((a, b) => b.kills - a.kills);

  const wins = num(stats, "matchesWon");
  const losses = num(stats, "matchesLost");
  const winRate = round(num(stats, "matchesWinPct"), 1);
  const matchesPlayed = num(stats, "matchesPlayed");
  const playtime = display(stats, "timePlayed");

  const premierRaw = payload.premier?.json?.data;
  const premierName = String(premierRaw?.name || "Krypto Gaming#KRYP");
  const [pName, pTag] = premierName.split("#");

  const badges = (user.badges || []).slice(0, 6).map((badge) => ({
    name: badge.name,
    icon: badge.badgeImageUrl,
  }));

  return {
    fetchedAt: new Date().toISOString(),
    name: name || "Fazed",
    tag: tag || "any",
    country: user.countryCode || "PT",
    views: user.pageviews || 0,
    level: profile.metadata?.accountLevel || 0,
    avatar,
    banner: agents[0]?.icon
      ? `https://trackercdn.com/cdn/tracker.gg/valorant/images/heroes/hero-${String(agents[0].name).toLowerCase()}.jpg`
      : "https://trackercdn.com/cdn/tracker.gg/valorant/images/heroes/hero-sova.jpg",
    cardWide: cardId
      ? `https://media.valorant-api.com/playercards/${cardId}/wideart.png`
      : avatar,
    badges,
    current: {
      name: rankMeta.tierName || currentAct?.rank || "—",
      rr: null,
      icon: rankMeta.iconUrl || currentAct?.rankIcon || "",
    },
    peak: {
      name: peakMeta.tierName || "—",
      rr: typeof stats.peakRank?.value === "number" ? stats.peakRank.value : null,
      season: peakMeta.actName || undefined,
      icon: peakMeta.iconUrl || "",
    },
    premier: {
      name: pName || premierName,
      tag: pTag || "",
      league: premierRaw
        ? `${premierRaw.zoneName} · ${premierRaw.divisionName} · #${premierRaw.rank}`
        : "—",
      icon: premierRaw?.icon?.imageUrl || premierRaw?.divisionImageUrl || "",
      members: (premierRaw?.players || []).map((row) => row.platformUserHandle).filter(Boolean),
    },
    playtime,
    matches: matchesPlayed,
    wins,
    losses,
    winRate,
    trackerScore,
    overview: [
      { label: "Damage / Ronda", value: display(stats, "damagePerRound"), hint: "Carreira" },
      { label: "K/D", value: display(stats, "kDRatio"), hint: "Carreira" },
      { label: "Headshot %", value: display(stats, "headshotsPercentage"), hint: "Carreira" },
      { label: "Win %", value: display(stats, "matchesWinPct"), hint: `${ptNum(wins)}W ${ptNum(losses)}L` },
      { label: "Wins", value: display(stats, "matchesWon"), hint: `${ptNum(matchesPlayed)} partidas` },
      { label: "KAST", value: display(stats, "kAST"), hint: "Carreira" },
      { label: "DDΔ / Ronda", value: signedStat(stats, "damageDeltaPerRound"), hint: "Carreira" },
      { label: "ACS", value: display(stats, "scorePerRound"), hint: "Carreira" },
    ],
    extras: [
      { label: "Kills", value: display(stats, "kills") },
      { label: "Deaths", value: display(stats, "deaths") },
      { label: "Assists", value: display(stats, "assists") },
      { label: "KAD", value: display(stats, "kADRatio") },
      { label: "Kills / Ronda", value: display(stats, "killsPerRound") },
      { label: "Clutches 1v1", value: display(stats, "clutches1v1") },
      { label: "Flawless", value: display(stats, "flawless") },
      { label: "Atos jogados", value: String(acts.length) },
      { label: "Do Iron ao Immortal", value: acts.length ? `${acts[acts.length - 1].episode} → ${acts.find((a) => a.id === peakMeta.actId)?.short || peakMeta.actName || "peak"}` : "—" },
    ],
    accuracy: {
      head: round((headHits / shotTotal) * 100, 1),
      body: round((bodyHits / shotTotal) * 100, 1),
      legs: round((legHits / shotTotal) * 100, 1),
      headHits,
      bodyHits,
      legHits,
    },
    last20: {
      record: `${lastWins}W – ${lastLen - lastWins}L (${Math.round((lastWins / lastLen) * 100)}%)`,
      kd: round(lastDeaths ? lastKills / lastDeaths : lastKills, 1),
      adr: Math.round(lastAdr / lastLen),
    },
    roles,
    weapons,
    maps,
    agents: agents.map(({ role, wins: _w, losses: _l, kills: _k, deaths: _d, assists: _a, ...rest }) => rest),
    acts,
    recent,
  };
}

function mergeFallback(next, prev) {
  if (!prev) return next;
  if (!next.acts?.length && prev.acts?.length) next.acts = prev.acts;
  if (!next.agents?.length && prev.agents?.length) next.agents = prev.agents;
  if (!next.maps?.length && prev.maps?.length) next.maps = prev.maps;
  if (!next.weapons?.length && prev.weapons?.length) next.weapons = prev.weapons;
  if (!next.recent?.length && prev.recent?.length) next.recent = prev.recent;
  if (!next.roles?.length && prev.roles?.length) next.roles = prev.roles;
  return next;
}

async function main() {
  mkdirSync(join(root, "public"), { recursive: true });
  const fallback = loadFallback();
  try {
    const snapshot = mergeFallback(await scrape(), fallback);
    writeFileSync(livePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    console.log(
      `live.json ${snapshot.fetchedAt} · ${snapshot.matches} partidas · ${snapshot.acts.length} atos · ${snapshot.recent.length} matches`,
    );
  } catch (error) {
    console.error(error);
    if (!fallback && !existsSync(livePath)) {
      process.exitCode = 1;
    } else {
      console.log("A manter o live.json anterior.");
    }
  }
}

await main();
