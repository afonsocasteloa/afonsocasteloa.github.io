import { FazedSite } from "@/components/fazed-site";
import { getTrackerSnapshot } from "@/lib/tracker";
import type { TabId } from "@/lib/types";

export function SitePage({ tab }: { tab: TabId }) {
  return <FazedSite data={getTrackerSnapshot()} tab={tab} />;
}
