export interface NavigationLink {
  readonly label: string;
  readonly href: string;
  readonly children?: readonly NavigationLink[];
}

// Keep the public shell aligned with the current WordPress navigation while
// route ownership is split between Next.js and WordPress. Use same-origin
// public URLs so Cloudflare can route each path to its current owner.
export const primaryCta = {
  label: "免費出發評估",
  href: "/consult/"
} as const satisfies NavigationLink;

export const schoolSignupLink = {
  label: "我要報名語校",
  href: "/language-school-signup/"
} as const satisfies NavigationLink;

export const aboutNavigation = [
  { label: "哩來品牌故事", href: "/about/" },
  { label: "規劃出發流程", href: "/ireland-study-planning/" },
  { label: "出發方案選擇", href: "/ireland-study-consultation/" }
] as const satisfies readonly NavigationLink[];

export const informationHubLink = {
  label: "哩來遊學情報站",
  href: "/category/ireland-study-abroad-info/"
} as const satisfies NavigationLink;

export const primaryNavigation = [
  primaryCta,
  schoolSignupLink,
  {
    label: "關於哩來",
    href: "/about/",
    children: aboutNavigation
  },
  informationHubLink
] as const satisfies readonly NavigationLink[];

export const serviceNavigation = [
  primaryCta,
  schoolSignupLink
] as const satisfies readonly NavigationLink[];

export const footerNavigation = [
  ...aboutNavigation,
  informationHubLink
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
