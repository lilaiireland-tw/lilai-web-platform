export interface NavigationLink {
  readonly label: string;
  readonly href: string;
}

// Keep unmigrated services on their confirmed production URLs.
// Homepage fragments also work when the shell renders on a WordPress route.
export const primaryNavigation = [
  { label: "關於哩來", href: "/#about" },
  { label: "留學遊學", href: "/#routes" },
  { label: "生活指南", href: "/#life" },
  { label: "學長姐故事", href: "/#stories" }
] as const satisfies readonly NavigationLink[];

export const primaryCta = {
  label: "免費出發評估",
  href: "https://lilaiireland.com/consult/"
} as const satisfies NavigationLink;

export const schoolSignupLink = {
  label: "語言學校報名",
  href: "https://lilaiireland.com/language-school-signup/"
} as const satisfies NavigationLink;

export const serviceNavigation = [
  primaryCta,
  schoolSignupLink
] as const satisfies readonly NavigationLink[];

// Confirmed in language-school-signup-page/app/lib/brand-links.ts and LandingFooter.
export const contactNavigation = [
  { label: "Instagram", href: "https://www.instagram.com/lilaiireland/" },
  { label: "Threads", href: "https://www.threads.com/@lilaiireland" },
  { label: "YouTube", href: "https://www.youtube.com/@%E5%93%A9%E4%BE%86%E6%84%9B%E7%88%BE%E8%98%AD" },
  { label: "Email", href: "mailto:lilaiireland@gmail.com" }
] as const satisfies readonly NavigationLink[];

export const policyNavigation = [
  { label: "隱私權政策", href: "https://lilaiireland.com/agreement/" }
] as const satisfies readonly NavigationLink[];
