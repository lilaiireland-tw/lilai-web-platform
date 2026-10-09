import { PUBLIC_SITE_URL } from "./deployment";

export const SITE_URL = PUBLIC_SITE_URL;

export const SITE_NAME = "哩來愛爾蘭｜Lilai Ireland";

export const HOME_TITLE = "哩來愛爾蘭｜愛爾蘭留遊學代辦 在地學長姐陪你規劃語校與生活";

export const HOME_DESCRIPTION =
  "哩來愛爾蘭由在愛爾蘭生活的學長姐 Alex & Arsha 創立，陪台灣人規劃愛爾蘭留遊學、語校選擇、免費出發評估、行前準備與落地生活。從台灣出發，找到適合你的愛爾蘭生活航線。";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
