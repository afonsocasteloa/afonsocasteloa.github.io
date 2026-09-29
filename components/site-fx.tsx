"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PLAYER } from "@/lib/config";
import { relativePt, wrClass } from "@/lib/format";
import { actMatchesHref, agentMatchesHref, trackerMatchHref } from "@/lib/hrefs";
import type { ActRow, AgentRow, MatchCard, TrackerSnapshot } from "@/lib/types";

export function usePointerParallax(strength = 18) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;
      node.style.setProperty("--px", `${x.toFixed(2)}px`);
      node.style.setProperty("--py", `${y.toFixed(2)}px`);
    };
    const onLeave = () => {
      node.style.setProperty("--px", "0px");
      node.style.setProperty("--py", "0px");
    };
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);
  return ref;
}

export function CountUp({ value, className }: { value: number; className?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const tick = (t: number) => {
          if (start == null) start = t;
          const p = Math.min(1, (t - start) / 900);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(value * eased));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span ref={ref} className={className}>
      {n}
    </span>
  );
}

export function CommandDock({
  riotId,
  onCopy,
}: {
  riotId: string;
  onCopy: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const items = useMemo(
    () => [
      { id: "home", label: "Tudo", hint: "Visão geral", href: "/", keys: "tudo overview" },
      { id: "eu", label: "Sobre mim", hint: "Perfil", href: "/eu/", keys: "eu sobre" },
      { id: "atos", label: "Atos", hint: "Carreira", href: "/atos/", keys: "atos temporada" },
      { id: "partidas", label: "Partidas", hint: "Últimas", href: "/partidas/", keys: "partidas matches" },
      { id: "agentes", label: "Agentes", hint: "Kit", href: "/agentes/", keys: "agentes" },
      { id: "mapas", label: "Mapas", hint: "WR", href: "/mapas/", keys: "mapas" },
      { id: "armas", label: "Armas", hint: "HS%", href: "/armas/", keys: "armas" },
      { id: "tracker", label: "Abrir Tracker", hint: "Externo", href: PLAYER.trackerOverview, keys: "tracker", external: true },
      { id: "copy", label: `Copiar ${riotId}`, hint: "Riot ID", action: "copy", keys: "copiar riot id" },
    ],
    [riotId],
  );

  const filtered = items.filter((item) => {
    const hay = `${item.label} ${item.hint} ${item.keys}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] tracking-[0.16em] text-[#9aa3b2] uppercase hover:border-[#ff4655] md:inline-flex"
        title="Abrir comando (Ctrl+K ou /)"
      >
        Comando
        <kbd className="border border-white/15 px-1.5 py-0.5 text-[10px] text-[#ece8e1]">/</kbd>
      </button>
    );
  }

  return (
    <div className="command-layer" role="dialog" aria-modal="true" aria-label="Comando rápido">
      <button type="button" className="command-scrim" aria-label="Fechar" onClick={() => setOpen(false)} />
      <div className="command-panel">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ir para… copiar Riot ID…"
          className="command-input"
        />
        <ul className="command-list">
          {filtered.map((item) => {
            const run = () => {
              if (item.action === "copy") {
                onCopy();
                setOpen(false);
                return;
              }
              if (item.external && item.href) {
                window.open(item.href, "_blank", "noreferrer");
                setOpen(false);
                return;
              }
              if (item.href) window.location.href = item.href;
            };
            return (
              <li key={item.id}>
                <button type="button" className="command-item" onClick={run}>
                  <span className="stat-num text-lg">{item.label}</span>
                  <span className="text-xs text-[#9aa3b2]">{item.hint}</span>
                </button>
              </li>
            );
          })}
          {!filtered.length ? <li className="px-4 py-6 text-sm text-[#9aa3b2]">Nada encontrado.</li> : null}
        </ul>
      </div>
    </div>
  );
}

export function FormTape({ matches, now }: { matches: MatchCard[]; now: number | null }) {
  const [active, setActive] = useState(0);
  const form = [...matches].reverse();
  const current = form[active] ?? form[form.length - 1];
  if (!current) return null;
  const when = current.timestamp && now ? relativePt(current.timestamp, now) : current.when;

  return (
    <section className="form-tape glass hud overflow-hidden">
      <div className="relative min-h-[180px] overflow-hidden border-b border-white/10">
        <img src={current.mapImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05060a] via-[#05060a]/85 to-[#05060a]/40" />
        <div className="relative flex flex-wrap items-end justify-between gap-4 p-5">
          <div>
            <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">Forma viva · últimas 20</p>
            <p className="stat-num mt-2 text-4xl">
              <span className={current.won ? "text-[#1be285]" : "text-[#ff4655]"}>
                {current.won ? "VITÓRIA" : "DERROTA"}
              </span>{" "}
              <span className="text-[#ece8e1]">
                {current.map} {current.roundsWon}:{current.roundsLost}
              </span>
            </p>
            <p className="mt-1 text-sm text-[#9aa3b2]">
              {current.agent} · {current.placement} · {when} · ACS {current.acs} · {current.kd.toFixed(1)} K/D
            </p>
          </div>
          <a
            href={trackerMatchHref(current.id)}
            target="_blank"
            rel="noreferrer"
            className="clip-btn border border-white/15 px-4 py-2 text-xs tracking-[0.16em] uppercase hover:border-[#ff4655]"
          >
            Abrir partida
          </a>
        </div>
      </div>
      <div className="flex items-end gap-1 overflow-x-auto p-4" role="list" aria-label="Últimas 20 partidas">
        {form.map((match, i) => (
          <button
            key={match.id}
            type="button"
            role="listitem"
            title={`${match.won ? "W" : "L"} · ${match.map} · ${match.agent}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`form-bar shrink-0 transition-all ${
              match.won ? "bg-[#1be285]" : "bg-[#ff4655]"
            } ${active === i ? "h-14 w-3 opacity-100" : "h-8 w-2.5 opacity-70 hover:opacity-100"}`}
            style={{ animationDelay: `${i * 24}ms` }}
          />
        ))}
      </div>
    </section>
  );
}

export function RankAscent({ acts }: { acts: ActRow[] }) {
  const journey = [...acts].reverse();
  const [active, setActive] = useState(() => Math.max(0, journey.findIndex((a) => a.current)));
  if (journey.length < 2) return null;

  const w = 960;
  const h = 280;
  const padX = 36;
  const padY = 52;
  const scores = journey.map((act) => act.score || 100);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = Math.max(1, max - min);
  const points = journey.map((act, i) => {
    const x = padX + (i * (w - padX * 2)) / Math.max(1, journey.length - 1);
    const y = h - padY - ((act.score - min) / span) * (h - padY * 2 - 8);
    return { x, y, act, i };
  });
  const focus = points[Math.min(active, points.length - 1)] ?? points[points.length - 1];
  const peakPoint = [...points].sort((a, b) => b.act.score - a.act.score)[0];
  const first = points[0];
  const last = points[points.length - 1];

  const lineD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx.toFixed(1)} ${prev.y.toFixed(1)}, ${cpx.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ");
  const areaD = `${lineD} L ${last.x.toFixed(1)} ${h - 12} L ${first.x.toFixed(1)} ${h - 12} Z`;

  return (
    <div className="rank-ascent rank-ascent--pro glass hud overflow-hidden">
      <div className="ascent-glow" aria-hidden />
      <div className="relative z-[1] flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] text-[#ff4655] uppercase">Ascensão · Tracker Score</p>
          <p className="stat-num mt-1 text-3xl md:text-4xl">Do Iron ao Immortal</p>
          <p className="mt-1 text-xs text-[#9aa3b2]">
            {journey.length} atos · linha pelo TRS · passa o rato num rank
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-right">
          <div>
            <p className="text-[10px] tracking-[0.18em] text-[#9aa3b2] uppercase">Início</p>
            <p className="stat-num text-lg">{first.act.rank}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.18em] text-[#9aa3b2] uppercase">Agora</p>
            <p className="stat-num text-lg text-[#ff4655]">{last.act.rank}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.18em] text-[#9aa3b2] uppercase">Pico TRS</p>
            <p className="stat-num text-lg gold-stat">{peakPoint.act.score}</p>
          </div>
        </div>
      </div>

      <div className="relative z-[1] overflow-x-auto px-2 pb-2 pt-3 md:px-4">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-[220px] w-full min-w-[720px] md:h-[280px]"
          role="img"
          aria-label="Caminho de Tracker Score por ato"
        >
          <defs>
            <linearGradient id="ascentStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#ff8a7a" />
              <stop offset="55%" stopColor="#ff4655" />
              <stop offset="100%" stopColor="#f5d76e" />
            </linearGradient>
            <linearGradient id="ascentFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,70,85,0.35)" />
              <stop offset="100%" stopColor="rgba(255,70,85,0)" />
            </linearGradient>
            <filter id="ascentBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {Array.from({ length: 5 }).map((_, i) => {
            const y = padY + ((h - padY * 2) * i) / 4;
            return (
              <line
                key={i}
                x1={padX}
                x2={w - padX}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 8"
              />
            );
          })}

          <path d={areaD} fill="url(#ascentFill)" className="ascent-area" />
          <path
            d={lineD}
            fill="none"
            stroke="url(#ascentStroke)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ascentBloom)"
            className="ascent-line"
          />

          {points.map((p) => {
            const on = p.i === focus.i;
            return (
              <g key={p.act.id} className={`ascent-node ${on ? "is-on" : ""}`}>
                <a
                  href={actMatchesHref(p.act.id)}
                  onMouseEnter={() => setActive(p.i)}
                  onFocus={() => setActive(p.i)}
                >
                  <title>{`${p.act.short} · ${p.act.rank} · TRS ${p.act.score}`}</title>
                  <circle cx={p.x} cy={p.y} r={on ? 18 : 14} className="ascent-hit" fill="transparent" />
                  {on ? (
                    <circle cx={p.x} cy={p.y} r="10" className="ascent-ring" fill="none" stroke="#ff4655" strokeWidth="1.5" />
                  ) : null}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={on || p.act.current ? 5.5 : 3.5}
                    fill={on || p.act.current ? "#ff4655" : "#ece8e1"}
                    className={p.act.current ? "ascent-pulse" : undefined}
                  />
                  <image
                    href={p.act.rankIcon}
                    x={p.x - (on ? 16 : 12)}
                    y={p.y - (on ? 44 : 34)}
                    width={on ? 32 : 24}
                    height={on ? 32 : 24}
                    className={on || p.act.current ? "rank-glow" : "opacity-85"}
                  />
                </a>
              </g>
            );
          })}

          <text x={first.x} y={h - 8} textAnchor="middle" className="ascent-label fill-[#9aa3b2]" fontSize="11">
            {first.act.short}
          </text>
          <text x={last.x} y={h - 8} textAnchor="middle" className="ascent-label fill-[#ff4655]" fontSize="11">
            {last.act.short}
          </text>
        </svg>
      </div>

      <a
        href={actMatchesHref(focus.act.id)}
        className="ascent-panel relative z-[1] mx-4 mb-4 grid gap-3 border border-white/10 bg-black/35 p-4 no-underline transition hover:border-[#ff4655]/50 sm:grid-cols-[auto_1fr_auto]"
      >
        <img src={focus.act.rankIcon} alt="" className="rank-glow h-16 w-16 object-contain" />
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">
            {focus.act.current ? "Acto atual" : focus.act.episode} · {focus.act.act}
          </p>
          <p className="stat-num mt-1 text-3xl text-[#ece8e1]">
            {focus.act.short} <span className="text-[#ff4655]">· {focus.act.rank}</span>
          </p>
          <p className="mt-1 text-xs text-[#9aa3b2]">
            {focus.act.wins}W – {focus.act.losses}L · {focus.act.matches} partidas · {focus.act.playtime}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-[200px]">
          {[
            ["TRS", String(focus.act.score)],
            ["WR", `${focus.act.winRate}%`],
            ["K/D", focus.act.kd],
            ["HS%", focus.act.hs],
          ].map(([label, value]) => (
            <div key={label} className="border border-white/10 bg-black/25 px-2 py-1.5 text-center">
              <p className="text-[9px] tracking-[0.16em] text-[#9aa3b2] uppercase">{label}</p>
              <p className="stat-num text-lg text-[#ece8e1]">{value}</p>
            </div>
          ))}
        </div>
      </a>
    </div>
  );
}

export function AccuracyCrosshair({
  head,
  body,
  legs,
  headHits,
  bodyHits,
  legHits,
}: {
  head: number;
  body: number;
  legs: number;
  headHits: number;
  bodyHits: number;
  legHits: number;
}) {
  return (
    <div className="accuracy-board glass hud p-5">
      <h2 className="stat-num text-3xl">Mira · últimas 20</h2>
      <div className="mt-5 grid items-center gap-6 sm:grid-cols-[140px_1fr]">
        <div className="crosshair-stage mx-auto" aria-hidden>
          <div className="crosshair-ring" style={{ ["--hs" as string]: `${Math.min(100, head)}%` }} />
          <div className="crosshair-dot" />
          <div className="crosshair-h" />
          <div className="crosshair-v" />
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
            <span className="text-[#9aa3b2]">Cabeça</span>
            <span className="stat-num text-xl text-[#ff4655]">{head}%</span>
            <span className="text-xs text-[#9aa3b2]">{headHits.toLocaleString("pt-PT")} hits</span>
          </li>
          <li className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
            <span className="text-[#9aa3b2]">Corpo</span>
            <span className="stat-num text-xl">{body}%</span>
            <span className="text-xs text-[#9aa3b2]">{bodyHits.toLocaleString("pt-PT")} hits</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-[#9aa3b2]">Pernas</span>
            <span className="stat-num text-xl">{legs}%</span>
            <span className="text-xs text-[#9aa3b2]">{legHits.toLocaleString("pt-PT")} hits</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function MatchCinema({ matches, now }: { matches: MatchCard[]; now: number | null }) {
  const rows = matches.slice(0, 8);
  if (!rows.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="section-mark" />
        <div>
          <h2 className="stat-num text-3xl">Cinema de partidas</h2>
          <p className="text-sm text-[#9aa3b2]">Desliza · cada frame é uma competitiva real</p>
        </div>
      </div>
      <div className="cinema-track">
        {rows.map((match) => {
          const when = match.timestamp && now ? relativePt(match.timestamp, now) : match.when;
          return (
            <a
              key={match.id}
              href={trackerMatchHref(match.id)}
              target="_blank"
              rel="noreferrer"
              className="cinema-card"
            >
              <img src={match.mapImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-[#05060a]/55 to-transparent" />
              <div className={`absolute left-0 top-0 h-full w-1 ${match.won ? "bg-[#1be285]" : "bg-[#ff4655]"}`} />
              <div className="relative mt-auto p-4">
                <img src={match.agentIcon} alt="" className="mb-2 h-10 w-10 object-contain" />
                <p className="stat-num text-2xl">{match.map}</p>
                <p className="text-xs text-[#9aa3b2]">
                  {match.roundsWon}:{match.roundsLost} · {match.agent} · {when}
                </p>
                <p className={`mt-1 text-xs font-semibold ${match.won ? "text-[#1be285]" : "text-[#ff4655]"}`}>
                  {match.won ? "VITÓRIA" : "DERROTA"} · ACS {match.acs}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function AgentOrbit({ agents }: { agents: AgentRow[] }) {
  const [focus, setFocus] = useState(0);
  const top = agents.slice(0, 5);
  const current = top[focus] ?? top[0];
  if (!current) return null;

  return (
    <section className="agent-orbit glass hud overflow-hidden p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-[#9aa3b2] uppercase">Órbita de agentes</p>
          <p className="stat-num text-3xl">O teu kit em destaque</p>
        </div>
        <p className="text-xs text-[#9aa3b2]">Clica num agente para focar</p>
      </div>
      <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="orbit-stage">
          {top.map((agent, i) => {
            const angle = (i / top.length) * Math.PI * 2 - Math.PI / 2;
            const r = 88;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            return (
              <button
                key={agent.name}
                type="button"
                className={`orbit-agent ${focus === i ? "is-focus" : ""}`}
                style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                onClick={() => setFocus(i)}
                aria-label={agent.name}
              >
                <img src={agent.icon} alt="" />
              </button>
            );
          })}
          <div className="orbit-core">
            <img src={current.icon} alt="" className="h-20 w-20 object-contain" />
          </div>
        </div>
        <a href={agentMatchesHref(current.name)} className="tap">
          <p className="stat-num text-5xl">{current.name}</p>
          <p className={`stat-num mt-2 text-4xl ${wrClass(current.winRate)}`}>{current.winRate}% WR</p>
          <p className="mt-2 text-sm text-[#9aa3b2]">
            {current.hours} · {current.matches} partidas · K/D {current.kd.toFixed(2)} · ACS {current.acs}
          </p>
          <p className="mt-1 text-sm text-[#9aa3b2]">
            Melhor mapa · {current.bestMap} {current.bestMapWr}
          </p>
          <p className="mt-4 text-[10px] tracking-[0.18em] uppercase text-[#ff4655]">Ver partidas →</p>
        </a>
      </div>
    </section>
  );
}

export function OpsTicker({ match, now }: { match: MatchCard | undefined; now: number | null }) {
  if (!match) return null;
  const when = match.timestamp && now ? relativePt(match.timestamp, now) : match.when;
  return (
    <a
      href={trackerMatchHref(match.id)}
      target="_blank"
      rel="noreferrer"
      className="ops-ticker hidden items-center gap-2 border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] lg:inline-flex"
    >
      <span className={match.won ? "text-[#1be285]" : "text-[#ff4655]"}>{match.won ? "W" : "L"}</span>
      <span className="text-[#ece8e1]">
        {match.map} · {match.agent}
      </span>
      <span className="text-[#9aa3b2]">{when}</span>
    </a>
  );
}
