import { FazedSite } from "@/components/fazed-site";
import { personJsonLd } from "@/lib/identity";
import { getTrackerSnapshot } from "@/lib/tracker";
import type { TabId } from "@/lib/types";

export function SitePage({ tab, actId }: { tab: TabId; actId?: string }) {
  const data = getTrackerSnapshot();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(data)) }} />
      <FazedSite data={data} tab={tab} actId={actId} />
    </>
  );
}
