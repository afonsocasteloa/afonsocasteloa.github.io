import { PLAYER } from "@/lib/config";
import { TRACKER_SEED } from "@/lib/seed";
import type { MatchCard, TrackerSnapshot } from "@/lib/types";

const AGENT_IDS: Record<string, string> = {
  Sova: "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
  Fade: "dade69b4-4f5a-8528-247b-219e5a1facd6",
  Jett: "add6443a-41bd-e414-f6ad-e58d267f4e95",
  Phoenix: "eb93336a-449b-9c1b-0a54-a891f7921d69",
  Waylay: "df1cb487-4902-002e-5c17-d28e83e78588",
  Skye: "6f2a04ca-43e0-be17-7f36-b3908627744d",
  Killjoy: "1e58de9c-4950-5125-93e9-a0aee9f98746",
  Clove: "1dbf2edd-4729-0984-3115-daa5eed44993",
  Sage: "569fdd95-4d10-43ab-ca70-79becc718b46",
  Omen: "8e253910-4c05-31dd-1b6c-3b9c5a5d8e3f",
};

function agentIcon(name: string) {
  const id = AGENT_IDS[name];
  if (!id) return `https://media.valorant-api.com/agents/${AGENT_IDS.Sova}/displayicon.png`;
  return `https://media.valorant-api.com/agents/${id}/displayicon.png`;
}

const MAP_IDS: Record<string, string> = {
  Ascent: "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
  Split: "d960549e-485c-e861-8d71-aa9d1aed12a2",
  Abyss: "224b0a95-48b9-f703-1bd8-67aca101a61f",
  Lotus: "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
  Sunset: "92584fbe-486a-b1b2-9faa-39b0f486b498",
  Summit: "756da597-416b-c0f2-f47b-afbdf28670bc",
  Haven: "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
};

function mapImage(name: string) {
  const key = Object.keys(MAP_IDS).find((item) => item.toLowerCase() === name.toLowerCase()) ?? "Ascent";
  return `https://media.valorant-api.com/maps/${MAP_IDS[key]}/splash.png`;
}

function parseMatchBlock(block: string, agent: string, index: number): MatchCard | null {
  const mapMatch = block.match(/Competitive\s+\|\s+([A-Za-z]+)/);
  const score = block.match(/Score\s+\|\s+(\d+)\s+\|\s+:\s+\|\s+(\d+)/);
  const kda = block.match(/K\/D\/A\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)/);
  const acs = block.match(/ACS\s+\|\s+(\d+)/);
  const hs = block.match(/HS%\s+\|\s+(\d+)/);
  const dd = block.match(/DDΔ\s+\|\s+(-?\d+)/);
  const trs = block.match(/TRS\s+\|\s+(\d+)/);
  const when = block.match(/^([^|]+?)Competitive/)?.[1]?.trim() ?? "";
  const placement = block.match(/\|\s+(MVP|\d+(?:st|nd|rd|th))\s+\|/)?.[1] ?? "";
  if (!mapMatch || !score || !kda) return null;
  const roundsWon = Number(score[1]);
  const roundsLost = Number(score[2]);
  const kills = Number(kda[1]);
  const deaths = Number(kda[2]);
  const assists = Number(kda[3]);
  return {
    id: `live-${index}`,
    agent,
    agentIcon: agentIcon(agent),
    map: mapMatch[1],
    mapImage: mapImage(mapMatch[1]),
    when: when.replace("ago", "atrás").replace("h ", "h ").trim() || "agora",
    won: roundsWon > roundsLost,
    placement,
    roundsWon,
    roundsLost,
    kills,
    deaths,
    assists,
    kd: Number((kills / Math.max(1, deaths)).toFixed(1)),
    acs: Number(acs?.[1] ?? 0),
    hs: Number(hs?.[1] ?? 0),
    dd: Number(dd?.[1] ?? 0),
    trs: Number(trs?.[1] ?? 0),
    badges: [],
  };
}

export async function scrapeTrackerProfile(): Promise<TrackerSnapshot | null> {
  let chromium: typeof import("playwright").chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    return null;
  }

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      viewport: { width: 1440, height: 2200 },
    });
    await page.goto(PLAYER.trackerOverview, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForFunction(
      () => document.body.innerText.includes("Current Rating") || document.body.innerText.includes("CURRENT RATING"),
      { timeout: 45_000 },
    );
    await page.waitForTimeout(2500);

    const extracted = (await page.evaluate(() => {
      const text = document.body.innerText;
      const cards: { agent: string; text: string }[] = [];
      const nodes = [...document.querySelectorAll("div, article, a, li")];
      for (const el of nodes) {
        const t = (el as HTMLElement).innerText?.trim() ?? "";
        if (t.includes("Competitive") && t.includes("ACS") && t.includes("HS%") && t.length > 40 && t.length < 420) {
          const img = el.querySelector("img");
          cards.push({
            agent: img?.getAttribute("alt") || "Sova",
            text: t.replace(/\n+/g, " | "),
          });
        }
      }
      const uniq: { agent: string; text: string }[] = [];
      const seen = new Set<string>();
      for (const card of cards) {
        const key = card.text.slice(0, 90);
        if (seen.has(key)) continue;
        seen.add(key);
        uniq.push(card);
      }
      return { text, cards: uniq.slice(0, 24) };
    })) as { text: string; cards: { agent: string; text: string }[] };

    const recent = extracted.cards
      .map((card: { agent: string; text: string }, index: number) => parseMatchBlock(card.text, card.agent, index))
      .filter((row: MatchCard | null): row is MatchCard => row !== null)
      .filter((row: MatchCard, index: number, arr: MatchCard[]) => arr.findIndex((item) => item.map === row.map && item.kills === row.kills && item.acs === row.acs) === index)
      .slice(0, 20);

    const next: TrackerSnapshot = {
      ...TRACKER_SEED,
      fetchedAt: new Date().toISOString(),
      recent: recent.length >= 8 ? recent : TRACKER_SEED.recent,
    };

    const rating = extracted.text.match(/CURRENT RATING[\s\S]{0,80}Rating\s+([A-Za-z]+ \d)/i);
    if (rating?.[1]) next.current = { ...next.current, name: rating[1] };

    return next;
  } finally {
    await browser.close();
  }
}
