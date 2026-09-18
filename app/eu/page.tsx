import { SitePage } from "@/components/site-page";
import { PLAYER } from "@/lib/config";

export const metadata = {
  title: "Sobre mim",
  description: PLAYER.about,
};

export default function EuPage() {
  return <SitePage tab="about" />;
}
