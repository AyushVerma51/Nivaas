import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Map as MapIcon } from "lucide-react";
import { readIndiaSvg } from "@/lib/atlas/readSvg";
import {
  destinations,
  states,
  experiences,
  journeys,
  destinationsBySlug,
  img,
} from "@/lib/atlas";
import IndiaMap from "@/components/atlas/IndiaMap";
import DestinationCard from "@/components/atlas/DestinationCard";
import ExperienceCard from "@/components/atlas/ExperienceCard";
import JourneyCard from "@/components/atlas/JourneyCard";
import SectionHeading from "@/components/atlas/SectionHeading";

export const metadata: Metadata = {
  title: "Explore India | Atlas India",
  description:
    "A premium digital atlas of India — states, destinations, experiences and journeys, one journey at a time.",
};

const featuredSlugs = [
  "srinagar",
  "jaipur",
  "varanasi",
  "alleppey",
  "leh",
  "goa",
  "hampi",
  "cherrapunji",
];
const featured = featuredSlugs
  .map((s) => destinationsBySlug.get(s))
  .filter((d): d is NonNullable<typeof d> => Boolean(d));

export default function AtlasPage() {
  const svg = readIndiaSvg();

  return (
    <>
      <section className="relative flex min-h-[82vh] items-end overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img("photo-1469474968028-56623f02e42e", 2400)}
          alt="Himalayan landscape at sunrise"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1600px] px-6 pb-20 pt-40 sm:px-8 lg:px-12">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sand">
            Atlas India
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.02] text-cream sm:text-7xl lg:text-8xl">
            Explore India, one journey at a time.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
            28 states, 8 union territories, a thousand landscapes. An atlas of
            India's mountains, coasts, temples and trails — built for the slow
            traveller.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/atlas/destinations" className="btn-primary !bg-cream !text-ink hover:!bg-paper">
              <Compass size={16} />
              Explore India
            </Link>
            <Link href="/atlas/map" className="btn-secondary !border-cream/50 !text-cream hover:!bg-cream hover:!text-ink">
              <MapIcon size={16} />
              Start on the map
            </Link>
          </div>
        </div>
      </section>

      {/* Featured destinations */}
      <section className="mx-auto max-w-[1600px] px-6 py-24 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Featured destinations"
            title="Places that stay with you."
            description="Eight places that define the atlas — from the pink walls of Jaipur to the cloud forests of Meghalaya."
          />
          <Link href="/atlas/destinations" className="link-arrow">
            All destinations <ArrowRight size={15} className="link-arrow-icon" />
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.slice(0, 4).map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
          {featured.slice(4, 8).map((d, i) => (
            <DestinationCard key={d.slug} destination={d} large={i % 2 === 0} />
          ))}
        </div>
      </section>

      {/* Map preview */}
      <section className="bg-canvas-2/60 py-24">
        <div className="mx-auto grid max-w-[1600px] items-center gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <SectionHeading
              eyebrow="The atlas"
              title="Start anywhere."
              description="Hover a state to see where it could take you. Every shape on this map leads to a real guide — forts, beaches, monasteries and tea gardens included."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/atlas/map" className="btn-primary">
                Open the full map <ArrowRight size={15} className="link-arrow-icon" />
              </Link>
              <Link href="/atlas/states" className="btn-secondary">
                Browse all states
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ink/10 pt-8">
              <div>
                <dt className="font-display text-3xl text-ink">{states.length}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-ink-muted">
                  States & UTs
                </dd>
              </div>
              <div>
                <dt className="font-display text-3xl text-ink">{destinations.length}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-ink-muted">
                  Destinations
                </dd>
              </div>
              <div>
                <dt className="font-display text-3xl text-ink">{experiences.length}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-ink-muted">
                  Experiences
                </dd>
              </div>
            </dl>
          </div>
          <IndiaMap svg={svg} className="mx-auto w-full max-w-xl" />
        </div>
      </section>

      {/* Experiences */}
      <section className="mx-auto max-w-[1600px] px-6 py-24 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="By experience"
            title="What are you looking for?"
            description="Mountains, beaches, heritage or food — every journey starts with a feeling."
          />
          <Link href="/atlas/experiences" className="link-arrow">
            All experiences <ArrowRight size={15} className="link-arrow-icon" />
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {experiences.slice(0, 10).map((e, i) => (
            <ExperienceCard key={e.slug} experience={e} large={i === 0} />
          ))}
        </div>
      </section>

      {/* Journeys */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Featured journeys"
          title="Routes worth the miles."
          description="Six ready-made itineraries across the map — each one an editorial story, not a booking list."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {journeys.slice(0, 6).map((j) => (
            <JourneyCard key={j.slug} journey={j} />
          ))}
        </div>
      </section>
    </>
  );
}
