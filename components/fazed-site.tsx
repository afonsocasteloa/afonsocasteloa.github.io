"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PLAYER, REFRESH_MS } from "@/lib/config";
import { grouped, hintTone, isSnapshot, relativePt, signed, tabHref, wrClass } from "@/lib/format";
import { buildIdentity } from "@/lib/identity";
import {
  actMatchesHref,
  agentMatchesHref,
  mapMatchesHref,
  trackerActMatchesHref,
  trackerMatchHref,
  trackerPlayerHref,
} from "@/lib/hrefs";
import type { ActRow, MatchCard, TabId, TrackerSnapshot } from "@/lib/types";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Tudo" },
  { id: "about", label: "Eu" },
  { id: "acts", label: "Atos" },
  { id: "matches", label: "Partidas" },
  { id: "agents", label: "Agentes" },
  { id: "maps", label: "Mapas" },
  { id: "weapons", label: "Armas" },
];

function useNow(ms = 30_000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

function useQueryFilters() {
  const [q, setQ] = useState({ agente: "", mapa: "" });
  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      setQ({ agente: p.get("agente") || "", mapa: p.get("mapa") || "" });
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  return q;
}

function streakOf(matches: MatchCard[]) {
  if (!matches.length) return { n: 0, won: false };
  const won = matches[0].won;
  let n = 0;
  for (const match of matches) {
    if (match.won !== won) break;
    n += 1;
  }
  return { n, won };
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="clip-btn border border-white/10 px-4 py-2 text-sm tracking-wide text-[#ece8e1] hover:border-[#ff4655]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? "Copiado" : label}
    </button>
  );
}

function ShareBtn() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="clip-btn border border-white/10 px-4 py-2 text-sm tracking-wide text-[#ece8e1] hover:border-[#ff4655]"
      onClick={async () => {
        const url = "https://afonsocasteloa.github.io/";
        try {
          if (navigator.share) {
            await navigator.share({ title: "Afonso · Fazed#any", url });
            return;
          }
          await navigator.clipboard.writeText(url);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? "Link copiado" : "Partilhar site"}
    </button>
  );
}

function MeBody({ data, compact = false, now = null }: { data: TrackerSnapshot; compact?: boolean; now?: number | null }) {
  const me = buildIdentity(data);
  const kit = me.kit;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 bg-[#ff4655]" />
          <div>
            <h2 className="stat-num text-3xl">{compact ? "Quem sou" : "Afonso · Fazed#any"}</h2>
            <p className="text-sm text-[#9aa3b2]">Portugal · PC · competitive · {data.current.name}</p>
          </div>
        </div>
        {compact ? (
          <a href="/eu/" className="text-xs text-[#ff4655] underline">
            Ver o perfil
          </a>
        ) : null}
      </div>

      <div className="glass hud p-5">
        <p className="max-w-3xl text-sm leading-7 text-[#d5dbe6]">{me.bio}</p>
        {!compact ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyBtn text={me.handle} label="Copiar Riot ID" />
            <ShareBtn />
            <a
              href={PLAYER.trackerOverview}
              target="_blank"
              rel="noreferrer"
              className="clip-btn border border-white/10 px-4 py-2 text-sm text-[#ece8e1] hover:border-[#ff4655]"
            >
              Tracker
            </a>
          </div>
        ) : null}
      </div>

      {kit ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a href={agentMatchesHref(kit.agent.name)} className="tap glass hud lift p-4">
            <p className="text-[10px] tracking-[0.2em] text-[#9aa3b2] uppercase">Main</p>
            <div className="mt-2 flex items-center gap-3">
              <img src={kit.agent.icon} alt="" className="h-12 w-12 object-contain" />
              <div>
                <p className="stat-num text-2xl">{kit.agent.name}</p>
                <p className="text-xs text-[#9aa3b2]">
                  {grouped(kit.agent.matches)} partidas · {kit.agent.hours}
                </p>
              </div>
            </div>
          </a>
          <a href={PLAYER.trackerWeapons} target="_blank" rel="noreferrer" className="tap glass hud lift p-4">
            <p className="text-[10px] tracking-[0.2em] text-[#9aa3b2] uppercase">Arma</p>
            <p className="stat-num mt-2 text-2xl">{kit.weapon.name}</p>
            <p className="text-xs text-[#9aa3b2]">
              {grouped(kit.weapon.kills)} kills · {kit.weapon.head}% HS
            </p>
          </a>
          <a href={mapMatchesHref(kit.map.name)} className="tap glass hud lift p-4">
            <p className="text-[10px] tracking-[0.2em] text-[#9aa3b2] uppercase">Melhor mapa</p>
            <p className="stat-num mt-2 text-2xl">{kit.map.name}</p>
            <p className="text-xs text-[#9aa3b2]">
              {kit.map.winRate}% WR · {kit.map.wins}W – {kit.map.losses}L
            </p>
          </a>
          <a href="/agentes/" className="tap glass hud lift p-4">
            <p className="text-[10px] tracking-[0.2em] text-[#9aa3b2] uppercase">Role</p>
            <p className="stat-num mt-2 text-2xl">{kit.role}</p>
            <p className="text-xs text-[#9aa3b2]">{data.roles[0]?.record}</p>
          </a>
        </div>
      ) : null}

      {me.origin && me.currentAct ? (
        <div className="grid gap-3 md:grid-cols-2">
          <a href={actMatchesHref(me.origin.id)} className="tap glass hud lift p-4">
            <p className="text-[10px] tracking-[0.2em] text-[#9aa3b2] uppercase">Onde comecei</p>
            <div className="mt-2 flex items-center gap-3">
              <img src={me.origin.rankIcon} alt="" className="h-12 w-12 object-contain" />
              <div>
                <p className="stat-num text-2xl">{me.origin.rank}</p>
                <p className="text-xs text-[#9aa3b2]">
                  {me.origin.short} · {me.origin.matches} partidas
                </p>
              </div>
            </div>
          </a>
          <a href={actMatchesHref(me.currentAct.id)} className="tap glass hud lift p-4">
            <p className="text-[10px] tracking-[0.2em] text-[#9aa3b2] uppercase">Onde estou</p>
            <div className="mt-2 flex items-center gap-3">
              <img src={data.current.icon} alt="" className="h-12 w-12 object-contain" />
              <div>
                <p className="stat-num text-2xl">{data.current.name}</p>
                <p className="text-xs text-[#9aa3b2]">
                  Peak {data.peak.name}
                  {data.peak.rr ? ` · ${data.peak.rr} RR` : ""} · {data.peak.season}
                </p>
              </div>
            </div>
          </a>
        </div>
      ) : null}

      {!compact ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {me.facts.map((fact) => (
              <div key={fact.label} className="border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] tracking-[0.18em] text-[#9aa3b2] uppercase">{fact.label}</p>
                <p className="stat-num mt-1 text-lg">{fact.value}</p>
              </div>
            ))}
          </div>

          <div className="glass hud p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="stat-num text-2xl">Premier</h3>
                <p className="text-xs text-[#9aa3b2]">{data.premier.league}</p>
              </div>
              <p className="stat-num text-xl">
                {data.premier.name}
                <span className="text-[#ff4655]">#{data.premier.tag}</span>
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.premier.members.map((member) => (
                <a
                  key={member}
                  href={trackerPlayerHref(member)}
                  target="_blank"
                  rel="noreferrer"
                  className={`border px-2 py-1 text-xs hover:border-[#ff4655] ${
                    member === me.handle ? "border-[#ff4655] text-[#ece8e1]" : "border-white/10"
                  }`}
                >
                  {member}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="stat-num text-2xl">Highlights</h3>
            <p className="text-sm text-[#9aa3b2]">Aces, MVPs e clutches nas partidas guardadas do Tracker — não é uma lista inventada.</p>
            {me.highlights.map((match) => (
              <MatchRow key={match.id} match={match} now={now} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

function uniqueActs(rows: (ActRow | undefined)[]) {
  const seen = new Set<string>();
  const out: ActRow[] = [];
  for (const row of rows) {
    if (!row || seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

function collectMatches(data: TrackerSnapshot): MatchCard[] {
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
  out.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
  return out;
}

function matchesForAct(data: TrackerSnapshot, actId: string): MatchCard[] {
  const fromAct = data.matchesByAct?.[actId];
  if (fromAct?.length) return fromAct;
  const tagged = collectMatches(data).filter((match) => match.seasonId === actId);
  if (tagged.length) return tagged;
  const act = data.acts.find((row) => row.id === actId);
  if (act?.current) return data.recent;
  return [];
}

function peakAct(data: TrackerSnapshot) {
  const season = (data.peak.season || "").toLowerCase();
  if (!season) return data.acts.find((act) => act.current);
  return data.acts.find((act) => {
    const short = act.short.toLowerCase();
    const compact = `${act.episode} ${act.act}`.toLowerCase();
    return season.includes(short) || short.includes(season) || season.includes(compact) || compact.includes(season);
  });
}

function tabIsActive(item: TabId, tab: TabId, actId?: string) {
  if (item === "acts") return tab === "acts" || Boolean(actId);
  if (item === "matches") return tab === "matches" && !actId;
  return tab === item;
}

function StatTile({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string | null;
  href?: string;
}) {
  const gold = hint?.startsWith("Top 1") || hint?.startsWith("Top 2");
  const inner = (
    <>
      <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">{label}</p>
      <p className={`stat-num mt-2 text-3xl ${gold ? "gold-stat" : "text-[#ece8e1]"}`}>{value}</p>
      {hint ? <p className={`mt-1 text-xs ${hintTone(hint)}`}>{hint}</p> : null}
    </>
  );
  if (href) {
    return (
      <a href={href} className="tap glass hud lift p-4">
        {inner}
      </a>
    );
  }
  return <div className="clip-card glass hud lift p-4">{inner}</div>;
}

function StatChip({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <p className="text-center text-sm">
      <span className="block text-[10px] tracking-widest text-[#9aa3b2]">{label}</span>
      <span className={tone}>{value}</span>
    </p>
  );
}

function MatchRow({ match, now }: { match: MatchCard; now: number | null }) {
  const when = match.timestamp && now ? relativePt(match.timestamp, now) : match.when;
  return (
    <a
      href={trackerMatchHref(match.id)}
      target="_blank"
      rel="noreferrer"
      className="tap lift relative overflow-hidden border border-white/10 bg-[#0c1018]"
    >
      <img src={match.mapImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05060a] via-[#05060a]/88 to-[#05060a]/55" />
      <div className={`absolute inset-y-0 left-0 w-1.5 ${match.won ? "bg-[#1be285]" : "bg-[#ff4655]"}`} />
      <div className="relative grid items-center gap-3 px-4 py-3 sm:grid-cols-[76px_44px_minmax(0,1fr)] lg:grid-cols-[76px_44px_minmax(0,1.4fr)_repeat(6,minmax(0,1fr))]">
        <span
          className={`clip-btn px-2 py-1 text-center text-[11px] font-semibold tracking-wider ${
            match.won ? "bg-[#1be285]/15 text-[#1be285]" : "bg-[#ff4655]/15 text-[#ff4655]"
          }`}
        >
          {match.won ? "VITÓRIA" : "DERROTA"}
        </span>
        <img src={match.agentIcon} alt={match.agent} className="h-11 w-11 justify-self-center object-contain" />
        <div className="min-w-0">
          <p className="stat-num text-xl leading-none">
            {match.map}{" "}
            <span className="text-sm text-[#9aa3b2]">
              {match.roundsWon}:{match.roundsLost}
            </span>
          </p>
          <p className="mt-1 truncate text-xs text-[#9aa3b2]">
            {match.agent} · {match.placement} · {when}
            {match.badges.length > 0 ? ` · ${match.badges.join(" · ")}` : ""}
          </p>
        </div>
        <StatChip label="K/D/A" value={`${match.kills}/${match.deaths}/${match.assists}`} />
        <StatChip label="ACS" value={String(match.acs)} />
        <StatChip label="HS%" value={`${match.hs}%`} />
        <StatChip label="DDΔ" value={signed(match.dd)} tone={match.dd >= 0 ? "text-[#1be285]" : "text-[#ff4655]"} />
        <StatChip label="TRS" value={String(match.trs)} />
        <p className="stat-num text-right text-2xl text-[#ece8e1]">{match.kd.toFixed(1)}</p>
      </div>
    </a>
  );
}

function ActCard({ act }: { act: ActRow }) {
  return (
    <a
      href={actMatchesHref(act.id)}
      className={`tap glass hud lift p-4 ${act.current ? "border-[#ff4655]/50" : ""}`}
      aria-label={`${act.short} · ver partidas`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={act.rankIcon} alt="" className="h-12 w-12 object-contain" />
          <div>
            <p className="stat-num text-2xl">{act.short}</p>
            <p className="text-xs text-[#9aa3b2]">
              {act.episode} · {act.act}
              {act.current ? " · acto atual" : ""}
            </p>
          </div>
        </div>
        <p className="stat-num text-lg text-[#ece8e1]">{act.rank}</p>
      </div>
      <p className={`stat-num mt-4 text-3xl ${wrClass(act.winRate)}`}>{act.winRate}%</p>
      <p className="text-xs text-[#9aa3b2]">
        {act.wins}W – {act.losses}L · {act.matches} partidas · {act.playtime}
      </p>
      <div className="mt-2 h-1.5 bg-white/10">
        <div className="h-full bg-[#1be285]" style={{ width: `${Math.min(100, act.winRate)}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
        {[
          ["K/D", act.kd],
          ["HS%", act.hs],
          ["ACS", act.acs],
          ["TRS", String(act.score)],
        ].map(([label, value]) => (
          <div key={label} className="border border-white/10 bg-black/20 p-2">
            <p className="text-[10px] tracking-widest text-[#9aa3b2]">{label}</p>
            <p className="stat-num">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] tracking-[0.18em] uppercase text-[#ff4655]">Ver partidas →</p>
    </a>
  );
}

function RankJourney({ acts }: { acts: ActRow[] }) {
  const journey = [...acts].reverse();
  return (
    <div className="clip-card glass hud p-4">
      <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">Caminho de rank</p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        {journey.map((act) => (
          <a
            key={act.id}
            href={actMatchesHref(act.id)}
            className="flex w-11 flex-col items-center gap-1"
            title={`${act.short} · ${act.rank}`}
            aria-label={`${act.short} · ver partidas`}
          >
            <img
              src={act.rankIcon}
              alt={act.rank}
              className={`h-8 w-8 object-contain ${act.current ? "rank-glow" : "opacity-80"}`}
            />
            <span className={`text-[8px] leading-tight ${act.current ? "text-[#ff4655]" : "text-[#9aa3b2]"}`}>
              {act.short}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function ActsBody({ data, compact = false }: { data: TrackerSnapshot; compact?: boolean }) {
  const [episode, setEpisode] = useState("Todos");
  const groups: { episode: string; acts: ActRow[] }[] = [];
  for (const act of data.acts) {
    const last = groups[groups.length - 1];
    if (!last || last.episode !== act.episode) groups.push({ episode: act.episode, acts: [act] });
    else last.acts.push(act);
  }
  const episodes = ["Todos", ...groups.map((group) => group.episode)];
  const visible = episode === "Todos" ? groups : groups.filter((group) => group.episode === episode);
  const current = data.acts.find((act) => act.current);
  const bestWr = [...data.acts].sort((a, b) => b.winRate - a.winRate)[0];
  const bestTrs = [...data.acts].sort((a, b) => b.score - a.score)[0];
  const first = data.acts[data.acts.length - 1];
  const highlights = uniqueActs([current, bestWr, bestTrs, first]);
  const highlightLabel = (act: ActRow) => {
    if (act.current) return "Acto atual";
    if (act.id === bestWr?.id) return "Melhor WR";
    if (act.id === bestTrs?.id) return "Maior TRS";
    return "Onde começou";
  };

  if (compact) {
    return (
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 bg-[#ff4655]" />
            <div>
              <h2 className="stat-num text-3xl">Carreira em atos</h2>
              <p className="text-sm text-[#9aa3b2]">
                {data.acts.length} atos · {data.playtime} · {grouped(data.matches)} partidas
              </p>
            </div>
          </div>
          <a href="/atos/" className="text-xs text-[#ff4655] underline">
            Ver todos os atos
          </a>
        </div>
        <RankJourney acts={data.acts} />
        <div className="grid gap-3 md:grid-cols-2">
          {highlights.map((act) => (
            <div key={act.id}>
              <p className="mb-2 text-[10px] tracking-[0.2em] text-[#ff4655] uppercase">{highlightLabel(act)}</p>
              <ActCard act={act} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 bg-[#ff4655]" />
          <div>
            <h2 className="stat-num text-3xl">Todos os atos</h2>
            <p className="text-sm text-[#9aa3b2]">
              {data.acts.length} atos competitivos · EP 5 até V26 · {data.playtime} · {grouped(data.matches)} partidas
            </p>
          </div>
        </div>
        <a href={PLAYER.trackerOverview} className="text-xs text-[#ff4655] underline" target="_blank" rel="noreferrer">
          Ver no Tracker
        </a>
      </div>

      <RankJourney acts={data.acts} />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar episódio">
        {episodes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setEpisode(item)}
            className={`clip-btn px-3 py-1.5 text-xs tracking-[0.16em] uppercase ${
              episode === item ? "bg-[#ff4655] text-[#05060a]" : "border border-white/10 text-[#d5dbe6]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {visible.map((group) => (
        <div key={group.episode} className="space-y-3">
          <p className="stat-num text-xl text-[#ff4655]">{group.episode}</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {group.acts.map((act) => (
              <ActCard key={act.id} act={act} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function OverviewBody({ data }: { data: TrackerSnapshot }) {
  const acc = data.accuracy;
  const pie = `conic-gradient(#ff4655 0 ${acc.head}%, #ece8e1 ${acc.head}% ${acc.head + acc.body}%, #6b7280 ${acc.head + acc.body}% 100%)`;
  const form = [...data.recent].reverse();

  return (
    <div className="space-y-6">
      <section className="clip-card glass hud p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">Forma · últimas 20</p>
            <p className="stat-num mt-1 text-2xl">
              {data.last20.record} · {data.last20.kd} K/D · {data.last20.adr} ADR
            </p>
          </div>
          <div className="flex items-end gap-[3px]" aria-hidden>
            {form.map((match) => (
              <a
                key={match.id}
                href={trackerMatchHref(match.id)}
                target="_blank"
                rel="noreferrer"
                title={`${match.won ? "W" : "L"} · ${match.map} · ${match.agent}`}
                className={`h-8 w-2.5 ${match.won ? "bg-[#1be285]" : "bg-[#ff4655]"}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.overview.map((stat) => (
          <StatTile
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            href={stat.label === "Win %" || stat.label === "Wins" ? "/atos/" : "/partidas/"}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <a href="/partidas/" className="tap glass hud p-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="stat-num text-3xl">Tracker Score</h2>
            <p className="stat-num text-4xl text-[#ff4655]">
              {data.trackerScore}
              <span className="text-lg text-[#9aa3b2]">/1000</span>
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden bg-white/10">
            <div className="bar-fill h-full" style={{ width: `${Math.min(100, data.trackerScore / 10)}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.extras.map((row) => (
              <div key={row.label} className="border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] tracking-[0.18em] text-[#9aa3b2] uppercase">{row.label}</p>
                <p className="stat-num mt-1 text-xl">{row.value}</p>
              </div>
            ))}
          </div>
        </a>

        <a href="/partidas/" className="tap glass hud p-5">
          <h2 className="stat-num text-3xl">Accuracy · last 20</h2>
          <div className="mt-5 flex items-center gap-6">
            <div className="h-32 w-32 shrink-0 rounded-full" style={{ background: pie }} />
            <ul className="space-y-2 text-sm">
              <li>
                Head <b>{acc.head}%</b> · {grouped(acc.headHits)} hits
              </li>
              <li>
                Body <b>{acc.body}%</b> · {grouped(acc.bodyHits)} hits
              </li>
              <li>
                Legs <b>{acc.legs}%</b> · {grouped(acc.legHits)} hits
              </li>
              <li className="text-[#9aa3b2]">
                {data.last20.record} · {data.last20.kd} K/D · {data.last20.adr} ADR
              </li>
            </ul>
          </div>
        </a>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.roles.map((role) => (
          <a key={role.name} href="/agentes/" className="tap glass hud lift p-4">
            <div className="flex items-center gap-3">
              <img src={role.icon} alt="" className="h-8 w-8 object-contain" />
              <h3 className="stat-num text-2xl">{role.name}</h3>
            </div>
            <p className="mt-3 text-2xl font-semibold">
              {role.winRate}% <span className="text-sm text-[#9aa3b2]">WR</span>
            </p>
            <p className="text-xs text-[#9aa3b2]">
              {role.record} · KDA {role.kda}
            </p>
            <p className="mt-1 text-xs text-[#9aa3b2]">{role.kdaLine}</p>
          </a>
        ))}
      </section>

      <section className="clip-card glass hud p-5">
        <h2 className="stat-num text-3xl">Premier</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <img src={data.premier.icon} alt="" className="h-12 w-12 object-contain" />
          <div>
            <p className="stat-num text-2xl">
              {data.premier.name} <span className="text-[#ff4655]">#{data.premier.tag}</span>
            </p>
            <p className="text-xs text-[#9aa3b2]">{data.premier.league}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.premier.members.map((member) => (
            <a
              key={member}
              href={trackerPlayerHref(member)}
              target="_blank"
              rel="noreferrer"
              className="border border-white/10 px-2 py-1 text-xs hover:border-[#ff4655]"
            >
              {member}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function MatchesBody({
  data,
  now,
  preview,
  actId,
  agente,
  mapa,
}: {
  data: TrackerSnapshot;
  now: number | null;
  preview?: boolean;
  actId?: string;
  agente?: string;
  mapa?: string;
}) {
  const [filter, setFilter] = useState<"all" | "win" | "loss">("all");
  const act = actId ? data.acts.find((row) => row.id === actId) : undefined;
  const pool = useMemo(() => {
    if (preview) return data.recent.slice(0, 6);
    if (actId) return matchesForAct(data, actId);
    return collectMatches(data).slice(0, 40);
  }, [actId, data, preview]);

  const filtered = pool.filter((match) => {
    if (!preview && filter === "win" && !match.won) return false;
    if (!preview && filter === "loss" && match.won) return false;
    if (agente && match.agent.toLowerCase() !== agente.toLowerCase()) return false;
    if (mapa && match.map.toLowerCase() !== mapa.toLowerCase()) return false;
    return true;
  });

  const wins = filtered.filter((match) => match.won).length;
  const title = act
    ? `Partidas · ${act.short}`
    : agente
      ? `Partidas · ${agente}`
      : mapa
        ? `Partidas · ${mapa}`
        : preview
          ? "Últimas partidas"
          : "Últimas competitivas";
  const subtitle = act
    ? `${act.wins}W – ${act.losses}L · ${act.winRate}% WR · ${act.matches} partidas no ato`
    : agente || mapa
      ? `${filtered.length} no snapshot · ${wins}W – ${filtered.length - wins}L`
      : `${data.last20.record} · ${data.last20.kd} K/D · ${data.last20.adr} ADR`;
  const trackerHref = act ? trackerActMatchesHref(act.id) : PLAYER.trackerMatches;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 bg-[#ff4655]" />
          <div>
            <h2 className="stat-num text-3xl">{title}</h2>
            <p className="text-sm text-[#9aa3b2]">{subtitle}</p>
          </div>
        </div>
        {preview ? (
          <a href="/partidas/" className="text-xs text-[#ff4655] underline">
            Ver as 20
          </a>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {act ? (
              <a href="/atos/" className="text-xs text-[#ff4655] underline">
                Todos os atos
              </a>
            ) : null}
            {agente || mapa ? (
              <a href="/partidas/" className="text-xs text-[#ff4655] underline">
                Limpar filtro
              </a>
            ) : null}
            {(["all", "win", "loss"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`clip-btn px-3 py-1.5 text-xs uppercase tracking-widest ${
                  filter === item ? "bg-[#ff4655] text-[#05060a]" : "border border-white/10 text-[#d5dbe6]"
                }`}
              >
                {item === "all" ? "Todas" : item === "win" ? "Vitórias" : "Derrotas"}
              </button>
            ))}
            <a href={trackerHref} className="text-xs text-[#ff4655] underline" target="_blank" rel="noreferrer">
              Tracker
            </a>
          </div>
        )}
      </div>
      {filtered.map((match) => (
        <MatchRow key={match.id} match={match} now={now} />
      ))}
      {!preview && filtered.length === 0 ? (
        <div className="glass hud p-6 text-sm text-[#9aa3b2]">
          <p>Ainda não há estas partidas neste snapshot.</p>
          <a href={trackerHref} className="mt-2 inline-block text-[#ff4655] underline" target="_blank" rel="noreferrer">
            Abrir no Tracker
          </a>
        </div>
      ) : null}
    </section>
  );
}

function AgentsBody({ data, preview }: { data: TrackerSnapshot; preview?: boolean }) {
  const [sort, setSort] = useState<"matches" | "wr" | "kd">("matches");
  const sorted = [...data.agents].sort((a, b) => {
    if (sort === "wr") return b.winRate - a.winRate;
    if (sort === "kd") return b.kd - a.kd;
    return b.matches - a.matches;
  });
  const rows = preview ? sorted.slice(0, 6) : sorted;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 bg-[#ff4655]" />
          <h2 className="stat-num text-3xl">Agentes</h2>
        </div>
        {preview ? (
          <a href="/agentes/" className="text-xs text-[#ff4655] underline">
            Ver todos
          </a>
        ) : (
          <div className="flex gap-2">
            {(["matches", "wr", "kd"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSort(item)}
                className={`clip-btn px-3 py-1.5 text-xs uppercase tracking-widest ${
                  sort === item ? "bg-[#ff4655] text-[#05060a]" : "border border-white/10 text-[#d5dbe6]"
                }`}
              >
                {item === "matches" ? "Partidas" : item === "wr" ? "WR" : "K/D"}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {rows.map((agent) => (
          <a key={agent.name} href={agentMatchesHref(agent.name)} className="tap glass hud lift p-5">
            <div className="flex items-center gap-3">
              <img src={agent.icon} alt="" className="h-14 w-14 object-contain" />
              <div>
                <p className="stat-num text-3xl">{agent.name}</p>
                <p className="text-xs text-[#9aa3b2]">
                  {agent.hours} · {grouped(agent.matches)} partidas
                </p>
              </div>
            </div>
            <p className={`stat-num mt-4 text-4xl ${wrClass(agent.winRate)}`}>{agent.winRate}%</p>
            <p className="text-xs text-[#9aa3b2]">win rate</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="border border-white/10 bg-black/20 p-2">
                <p className="text-[10px] tracking-widest text-[#9aa3b2]">K/D</p>
                <p className="stat-num">{agent.kd.toFixed(2)}</p>
              </div>
              <div className="border border-white/10 bg-black/20 p-2">
                <p className="text-[10px] tracking-widest text-[#9aa3b2]">ACS</p>
                <p className="stat-num">{agent.acs}</p>
              </div>
              <div className="border border-white/10 bg-black/20 p-2">
                <p className="text-[10px] tracking-widest text-[#9aa3b2]">DDΔ</p>
                <p className={`stat-num ${agent.dd >= 0 ? "text-[#1be285]" : "text-[#ff4655]"}`}>{signed(agent.dd)}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#9aa3b2]">
              Melhor mapa · {agent.bestMap} {agent.bestMapWr}
            </p>
            <p className="mt-3 text-[10px] tracking-[0.18em] uppercase text-[#ff4655]">Ver partidas →</p>
          </a>
        ))}
      </div>
      {!preview ? (
        <a href={PLAYER.trackerAgents} className="mt-4 inline-block text-xs text-[#ff4655] underline" target="_blank" rel="noreferrer">
          Todos os agentes no Tracker
        </a>
      ) : null}
    </section>
  );
}

function MapsBody({ data, preview }: { data: TrackerSnapshot; preview?: boolean }) {
  const rows = preview ? data.maps.slice(0, 6) : data.maps;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 bg-[#ff4655]" />
          <h2 className="stat-num text-3xl">Mapas</h2>
        </div>
        {preview ? (
          <a href="/mapas/" className="text-xs text-[#ff4655] underline">
            Ver todos
          </a>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((map) => (
          <a key={map.name} href={mapMatchesHref(map.name)} className="tap lift relative overflow-hidden border border-white/10">
            <img src={map.image} alt="" className="h-52 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-end justify-between">
                <p className="stat-num text-3xl">{map.name}</p>
                <p className={`stat-num text-2xl ${wrClass(map.winRate)}`}>{map.winRate}%</p>
              </div>
              <p className="text-xs text-[#d5dbe6]">
                {map.wins}W – {map.losses}L
              </p>
              <div className="mt-2 h-1.5 bg-white/15">
                <div className="h-full bg-[#1be285]" style={{ width: `${map.winRate}%` }} />
              </div>
              <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-[#ff4655]">Ver partidas →</p>
            </div>
          </a>
        ))}
      </div>
      {!preview ? (
        <a href={PLAYER.trackerMaps} className="mt-4 inline-block text-xs text-[#ff4655] underline" target="_blank" rel="noreferrer">
          Todos os mapas no Tracker
        </a>
      ) : null}
    </section>
  );
}

function WeaponsBody({ data, preview }: { data: TrackerSnapshot; preview?: boolean }) {
  const list = preview ? data.weapons.slice(0, 3) : data.weapons.slice(0, 12);
  const maxKills = Math.max(...list.map((weapon) => weapon.kills), 1);
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 bg-[#ff4655]" />
          <h2 className="stat-num text-3xl">Armas</h2>
        </div>
        {preview ? (
          <a href="/armas/" className="text-xs text-[#ff4655] underline">
            Ver todas
          </a>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {list.map((weapon) => (
          <a
            key={weapon.name}
            href={PLAYER.trackerWeapons}
            target="_blank"
            rel="noreferrer"
            className="tap glass hud lift p-5"
          >
            <p className="text-[10px] tracking-[0.2em] text-[#9aa3b2] uppercase">{weapon.type}</p>
            <img src={weapon.icon} alt="" className="mx-auto my-4 h-16 object-contain" />
            <p className="stat-num text-3xl">{weapon.name}</p>
            <p className="text-sm text-[#9aa3b2]">{grouped(weapon.kills)} kills</p>
            <div className="mt-3 h-1.5 overflow-hidden bg-white/10">
              <div className="h-full bg-[#ff4655]" style={{ width: `${(weapon.kills / maxKills) * 100}%` }} />
            </div>
            <div className="mt-4 h-2 overflow-hidden bg-white/10">
              <div className="flex h-full">
                <div className="bg-[#ff4655]" style={{ width: `${weapon.head}%` }} />
                <div className="bg-[#ece8e1]" style={{ width: `${weapon.body}%` }} />
                <div className="bg-[#6b7280]" style={{ width: `${weapon.legs}%` }} />
              </div>
            </div>
            <p className="mt-2 text-xs text-[#9aa3b2]">
              HS {weapon.head}% · Body {weapon.body}% · Legs {weapon.legs}%
            </p>
            <p className="mt-3 text-[10px] tracking-[0.18em] uppercase text-[#ff4655]">Ver no Tracker →</p>
          </a>
        ))}
      </div>
      {!preview ? (
        <a href={PLAYER.trackerWeapons} className="mt-4 inline-block text-xs text-[#ff4655] underline" target="_blank" rel="noreferrer">
          Todas as armas no Tracker
        </a>
      ) : null}
    </section>
  );
}

export function FazedSite({ data: initial, tab, actId }: { data: TrackerSnapshot; tab: TabId; actId?: string }) {
  const [data, setData] = useState(initial);
  const [live, setLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const now = useNow();
  const query = useQueryFilters();
  const currentAct = data.acts.find((act) => act.current);
  const peak = peakAct(data);
  const streak = useMemo(() => streakOf(data.recent), [data.recent]);
  const updated = now ? relativePt(data.fetchedAt, now) : null;

  const pull = useCallback(async (signal?: AbortSignal) => {
    setRefreshing(true);
    try {
      const res = await fetch(`/live.json?t=${Date.now()}`, { cache: "no-store", signal });
      if (!res.ok) throw new Error("live");
      const next: unknown = await res.json();
      if (!isSnapshot(next)) throw new Error("shape");
      setData(next);
      setLive(true);
    } catch (error) {
      if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
      setLive(false);
    } finally {
      if (!signal?.aborted) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    void pull(ctrl.signal);
    const id = window.setInterval(() => void pull(), REFRESH_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void pull();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      ctrl.abort();
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pull]);

  const liveTone = live ? "bg-[#1be285]" : "bg-[#ff8a7a]";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo
      </a>
      <div className="atmosphere" />
      <div className="scanline" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-50">
        <img
          src={data.banner}
          alt=""
          className="h-full w-full object-cover object-top"
          style={{ maskImage: "linear-gradient(to bottom, black, transparent)" }}
        />
      </div>
      <p className="watermark pointer-events-none absolute right-[-4%] top-24 select-none stat-num">VALORANT</p>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5">
        <a href="/" className="stat-num text-sm tracking-[0.5em] text-[#ff4655]">
          FAZED
        </a>
        <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-[#9aa3b2]">
          <span className={`h-2 w-2 rounded-full ${liveTone} ${live ? "live-dot" : ""}`} />
          <span>
            {live ? "Ao vivo" : "Snapshot"}
            {updated ? ` · atualizado ${updated}` : ""}
            {refreshing ? " · a ler…" : ""}
          </span>
          <span className="hidden sm:inline">· {grouped(data.views)} views</span>
        </div>
      </header>

      <main id="conteudo" className="relative z-10 mx-auto max-w-6xl px-5 pb-16">
        <section className="clip-card glass hud overflow-hidden">
          <div className="frame-line h-px w-full" />
          <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_280px] md:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.28em] text-[#ff4655] uppercase">
                <img src="https://trackercdn.com/cdn/flags/4x3/pt.svg" alt="" className="h-4 w-6 object-cover" />
                Site pessoal · Competitive PC · atualização contínua
              </div>
              <div className="mt-4 flex items-end gap-4">
                <img src={data.avatar} alt="" className="h-20 w-20 border border-white/20 object-cover" />
                <div>
                  <h1 className="stat-num text-6xl leading-none md:text-7xl">{PLAYER.displayName}</h1>
                  <p className="mt-1 text-xl">
                    {data.name}
                    <span className="text-[#ff4655]">#{data.tag}</span>
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#b7c0cc]">{buildIdentity(data).bio}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {data.badges.map((badge) => (
                  <span key={badge.name} className="flex items-center gap-2 border border-white/10 bg-black/30 px-2 py-1 text-xs">
                    <img src={badge.icon} alt="" className="h-5 w-5 object-contain" />
                    {badge.name}
                  </span>
                ))}
                <span className="border border-white/10 bg-black/30 px-2 py-1 text-xs">NV. {data.level}</span>
                <span className="border border-white/10 bg-black/30 px-2 py-1 text-xs">Portugal · PC</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={PLAYER.trackerOverview}
                  target="_blank"
                  rel="noreferrer"
                  className="clip-btn bg-[#ff4655] px-5 py-2 text-sm font-semibold tracking-wide text-[#05060a]"
                >
                  ABRIR TRACKER
                </a>
                <CopyBtn text={`${data.name}#${data.tag}`} label="Copiar Riot ID" />
                <ShareBtn />
                <p className="self-center text-xs tracking-[0.18em] text-[#9aa3b2] uppercase">
                  {data.playtime} · {grouped(data.matches)} partidas · {grouped(data.wins)}W {grouped(data.losses)}L
                </p>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center overflow-hidden border border-white/10 bg-black/35 p-5 text-center">
              <img src={data.cardWide} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-[#05060a]/70 to-transparent" />
              <a href={currentAct ? actMatchesHref(currentAct.id) : "/atos/"} className="relative z-10 flex flex-col items-center">
                <img src={data.current.icon} alt={data.current.name} className="rank-glow h-28 w-28 object-contain" />
                <p className="stat-num mt-3 text-3xl">{data.current.name}</p>
                <p className="text-sm text-[#9aa3b2]">Rating atual</p>
              </a>
              <a
                href={peak ? actMatchesHref(peak.id) : "/atos/"}
                className="relative z-10 mt-4 flex items-center gap-3 border-t border-white/10 pt-4"
              >
                <img src={data.peak.icon} alt="" className="h-10 w-10 object-contain" />
                <div className="text-left">
                  <p className="text-[10px] tracking-[0.2em] text-[#9aa3b2] uppercase">Peak</p>
                  <p className="stat-num text-lg">
                    {data.peak.name} {data.peak.rr ? `· ${data.peak.rr} RR` : ""}
                  </p>
                  <p className="text-xs text-[#9aa3b2]">{data.peak.season}</p>
                </div>
              </a>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {currentAct ? (
            <a href={actMatchesHref(currentAct.id)} className="tap glass hud p-4">
              <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">Assinatura · acto atual</p>
              <p className="stat-num gold-stat mt-1 text-4xl">{currentAct.hs}</p>
              <p className="text-xs text-[#f5d76e]">{currentAct.short} HS%</p>
            </a>
          ) : null}
          <a href="/atos/" className="tap glass hud p-4">
            <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">Carreira</p>
            <p className="stat-num mt-1 text-4xl">{data.winRate}%</p>
            <p className="text-xs text-[#9aa3b2]">
              {grouped(data.wins)}W {grouped(data.losses)}L · {data.playtime}
            </p>
          </a>
          <a href={currentAct ? actMatchesHref(currentAct.id) : "/partidas/"} className="tap glass hud p-4">
            <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">Tracker Score</p>
            <p className="stat-num mt-1 text-4xl text-[#ff4655]">{data.trackerScore}</p>
            <p className="text-xs text-[#9aa3b2]">de 1000 · acto atual {currentAct?.short ?? "—"}</p>
          </a>
          <a href="/partidas/" className="tap glass hud p-4">
            <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">Sequência</p>
            <p className={`stat-num mt-1 text-4xl ${streak.won ? "text-[#1be285]" : "text-[#ff8a7a]"}`}>
              {streak.n}
              {streak.won ? "W" : "L"}
            </p>
            <p className="text-xs text-[#9aa3b2]">últimas competitivas</p>
          </a>
        </section>

        <nav className="sticky top-3 z-20 mt-8 flex flex-wrap gap-2 overflow-x-auto border border-white/10 bg-[#05060a]/85 p-2 backdrop-blur-md" aria-label="Secções">
          {TABS.map((item) => {
            const active = tabIsActive(item.id, tab, actId);
            return (
              <a
                key={item.id}
                href={tabHref(item.id)}
                aria-current={active ? "page" : undefined}
                className={`clip-btn px-4 py-2 text-sm tracking-[0.16em] uppercase ${
                  active
                    ? "bg-[#ff4655] text-[#05060a]"
                    : "border border-white/10 text-[#d5dbe6] hover:border-[#ff4655]"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="mt-6 space-y-10">
          {tab === "overview" ? (
            <>
              <MeBody data={data} compact now={now} />
              <ActsBody data={data} compact />
              <OverviewBody data={data} />
              <MatchesBody data={data} now={now} preview />
              <AgentsBody data={data} preview />
              <MapsBody data={data} preview />
              <WeaponsBody data={data} preview />
            </>
          ) : null}
          {tab === "about" ? <MeBody data={data} now={now} /> : null}
          {tab === "acts" ? <ActsBody data={data} /> : null}
          {tab === "matches" ? (
            <MatchesBody data={data} now={now} actId={actId} agente={query.agente} mapa={query.mapa} />
          ) : null}
          {tab === "agents" ? <AgentsBody data={data} /> : null}
          {tab === "maps" ? <MapsBody data={data} /> : null}
          {tab === "weapons" ? <WeaponsBody data={data} /> : null}
        </div>
      </main>

      <footer className="relative z-10 mx-auto max-w-6xl px-5 pb-10 text-xs text-[#9aa3b2]">
        Site pessoal do Afonso — {data.name}#{data.tag}. Dados do perfil público{" "}
        <a className="text-[#ece8e1] underline" href={PLAYER.trackerOverview} target="_blank" rel="noreferrer">
          Fazed#any no Tracker.gg
        </a>
        . Competitive {PLAYER.seasonLabel} · {PLAYER.seasonRange}. O site atualiza sozinho a cada 90 segundos e o
        Tracker é relido em segundo plano.
      </footer>
    </div>
  );
}
