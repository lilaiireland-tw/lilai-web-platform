import type { Metadata } from "next";
import { ConsultationPage } from "@/components/consult/ConsultationPage";
import { isProductionDeployment } from "@/lib/deployment";
import { absoluteUrl } from "@/lib/site";

const title = "哩來出發計畫｜免費語校評估 - 哩來愛爾蘭｜愛爾蘭留遊學代辦，在地學長姐陪你規劃語校與生活";
const description = "填寫免費出發評估，了解你目前的規劃階段、愛爾蘭語校與 25+8 初步方向，以及適合你的下一步。";
const canonical = absoluteUrl("/consult/");

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical },
  robots: { index: isProductionDeployment(), follow: isProductionDeployment() },
  openGraph: {
    type: "website",
    title,
    description,
    url: canonical,
    images: [{
      url: "https://lilaiireland.com/wp-content/uploads/2026/07/lilai-consultation-hero-1-1.jpg",
      alt: "哩來出發計畫",
    }],
  },
};

export default function ConsultPage() {
  return <ConsultationPage googleAdsEnabled={isProductionDeployment()} />;
}
