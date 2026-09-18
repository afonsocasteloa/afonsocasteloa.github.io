import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TRACKER_SEED } from "@/lib/seed";
import { isSnapshot } from "@/lib/format";
import type { TrackerSnapshot } from "@/lib/types";

function loadLive(): TrackerSnapshot {
  try {
    const raw = readFileSync(join(process.cwd(), "public", "live.json"), "utf8");
    const data = JSON.parse(raw) as unknown;
    if (isSnapshot(data)) {
      return {
        ...data,
        matchesByAct: data.matchesByAct && typeof data.matchesByAct === "object" ? data.matchesByAct : {},
      };
    }
  } catch {
    /* seed */
  }
  return TRACKER_SEED;
}

export function getTrackerSnapshot(): TrackerSnapshot {
  return loadLive();
}
