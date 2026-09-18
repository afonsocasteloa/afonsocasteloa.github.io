import { SitePage } from "@/components/site-page";
import { CAREER_ACTS } from "@/lib/acts";
import { getTrackerSnapshot } from "@/lib/tracker";

export const dynamicParams = false;

export function generateStaticParams() {
  const ids = new Set(CAREER_ACTS.map((act) => act.id));
  for (const act of getTrackerSnapshot().acts) ids.add(act.id);
  return [...ids].map((actId) => ({ actId }));
}

export async function generateMetadata({ params }: { params: Promise<{ actId: string }> }) {
  const { actId } = await params;
  const data = getTrackerSnapshot();
  const act = data.acts.find((row) => row.id === actId) ?? CAREER_ACTS.find((row) => row.id === actId);
  return {
    title: act ? `${act.short} · partidas` : "Ato",
    description: act
      ? `Partidas competitivas de Fazed#any em ${act.short} — ${act.episode} ${act.act}.`
      : "Partidas competitivas de Fazed#any.",
  };
}

export default async function ActoPage({ params }: { params: Promise<{ actId: string }> }) {
  const { actId } = await params;
  return <SitePage tab="matches" actId={actId} />;
}
