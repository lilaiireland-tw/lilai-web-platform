import type { ComponentType } from "react";

export type EventStatus = "draft" | "active" | "archived";
export type EventImage = { src: string; alt: string; width: number; height: number };
export type Speaker = { name: string; role?: string; bio: string; image?: EventImage };
export type EventSection =
  | { id: string; type: "info"; title: string }
  | { id: string; type: "speakers"; title: string; speakers: readonly Speaker[] }
  | { id: string; type: "agenda"; title: string; items: readonly { title: string; description?: string; time?: string }[] }
  | { id: string; type: "faq"; title: string; items: readonly { question: string; answer: string }[] }
  | { id: string; type: "cta"; title: string; label: string; description?: string };

export interface EventContent {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  /** ISO 8601 with explicit timezone; display text preserves approved wording. */
  startAt: string;
  endAt?: string;
  dateLabel: string;
  venue: string;
  format: "in-person" | "online" | "hybrid";
  registrationUrl: string;
  registrationLabel: string;
  status: EventStatus;
  campaignName: string;
  heroImage?: EventImage;
  seo: { index: boolean; title: string; description: string; ogImage: EventImage };
  sections: readonly EventSection[];
  /** Optional, explicit next event; archived pages never link to their registration URL. */
  nextEventSlug?: string;
}

export type EventRegistration = {
  event: EventContent;
  /** Optional server component replaces default body composition, retaining shell/status/SEO. */
  Content?: ComponentType<{ event: EventContent }>;
};
