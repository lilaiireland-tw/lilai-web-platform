import type { Metadata } from "next";
import { ireland25Plus8Schema } from "@/content/ireland-25-plus-8-copy";
import { Ireland25Plus8Campaign } from "@/components/ireland-25-plus-8/Ireland25Plus8Campaign";

export const dynamic = "force-static";

const title = ireland25Plus8Schema[1].name!;
const url = ireland25Plus8Schema[1].url!;
export const metadata: Metadata = {
  title: { absolute: `${title}｜哩來愛爾蘭` },
  description: "愛爾蘭25+8打工遊學完整指南！了解25週英文課程、學費三大級距、工作規定、續簽條件及語校選擇。哩來提供客製選校、開局大禮包與在地經驗，陪你規劃愛爾蘭生活。",
  alternates: { canonical: url },
  // Required booking URL and share image are still missing from the handoff.
  robots: { index: false, follow: false },
  openGraph: {
    type: "article", locale: "zh_TW", siteName: "哩來愛爾蘭 Lilai Ireland", title, url,
    description: "25 週英文課程、三大學費級距、Stamp 2 打工規定與選校方法，一頁看懂愛爾蘭 25+8。",
    images: [],
  },
  twitter: { card: "summary", title, images: [] },
};

export default function Ireland25Plus8Page() {
  return <>
    {ireland25Plus8Schema.map((schema, index) => <script key={index} type="application/ld+json">{JSON.stringify(schema).replace(/</g, "\\u003c")}</script>)}
    <Ireland25Plus8Campaign />
  </>;
}
