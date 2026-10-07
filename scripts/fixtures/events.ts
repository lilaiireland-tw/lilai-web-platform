import type { EventContent, EventRegistration } from "../../src/lib/events/event-types";

// Synthetic test data only. Never register these in published content.
export const active: EventContent = {
  slug: "fixture-active", title: "Fixture active event", shortTitle: "Active fixture",
  description: "Test event description", startAt: "2027-01-01T10:00:00+00:00",
  dateLabel: "Fixture date", venue: "Fixture venue", format: "online",
  registrationUrl: "https://example.com/register?campaign=fixture", registrationLabel: "Fixture registration",
  campaignName: "fixture-campaign", status: "active",
  seo: { index: true, title: "Fixture SEO title", description: "Fixture SEO description",
    ogImage: { src: "/events/fixture-active/og.webp", width: 1200, height: 630, alt: "Fixture OG" } },
  sections: [
    { id: "info", type: "info", title: "Fixture details" },
    { id: "speakers", type: "speakers", title: "Fixture speakers", speakers: [{ name: "Fixture speaker", bio: "Fixture bio" }] },
    { id: "agenda", type: "agenda", title: "Fixture agenda", items: [{ title: "Fixture topic" }] },
    { id: "faq", type: "faq", title: "Fixture FAQ", items: [{ question: "Fixture question?", answer: "Fixture answer" }] },
    { id: "registration", type: "cta", title: "Fixture CTA", label: "Fixture registration" },
  ],
};
export const archived: EventContent = { ...active, slug: "fixture-archived", title: "Fixture archived event", shortTitle: "Archived fixture", status: "archived", nextEventSlug: active.slug };
export const draft: EventContent = { ...active, slug: "fixture-draft", title: "Fixture draft event", status: "draft" };
export const registrations: readonly EventRegistration[] = [active, archived, draft].map(event => ({ event }));
