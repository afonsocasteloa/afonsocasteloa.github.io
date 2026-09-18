import { FazedSite } from "@/components/fazed-site";
import { getTrackerSnapshot } from "@/lib/tracker";
import type { TabId } from "@/lib/types";

export function SitePage({ tab, actId }: { tab: TabId; actId?: string }) {
  return <FazedSite data={getTrackerSnapshot()} tab={tab} actId={actId} />;
}
