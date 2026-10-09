import { notFound } from "next/navigation";
import { EventPage } from "@/components/events/EventPage";
import { eventRegistry } from "@/lib/events/event-registry";
import { buildEventMetadata } from "@/lib/events/event-metadata";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return eventRegistry.slugs().map(slug => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const registration = eventRegistry.resolve((await params).slug);
  if (!registration) notFound();
  return buildEventMetadata(registration.event);
}
export default async function CampaignPage({ params }: Props) {
  const registration = eventRegistry.resolve((await params).slug);
  if (!registration) notFound();
  const nextEvent = registration.event.nextEventSlug ? eventRegistry.resolve(registration.event.nextEventSlug)?.event : undefined;
  return <EventPage registration={registration} nextEvent={nextEvent} />;
}
