import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { readIndiaSvg } from "@/lib/atlas/readSvg";
import {
  states,
  destinationsBySlug,
  experiencesBySlug,
} from "@/lib/atlas";
import IndiaMap from "@/components/atlas/IndiaMap";
import DestinationCard from "@/components/atlas/DestinationCard";
import ExperienceCard from "@/components/atlas/ExperienceCard";
import WishlistButton from "@/components/atlas/WishlistButton";

export function generateStaticParams() {
  return states.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const state = states.find((s) => s.slug === slug);
  if (!state) return { title: "State not found | Atlas India" };
  return {
    title: `Explore ${state.name} | Atlas India`,
    description: `${state.tagline} — ${state.description.slice(0, 150)}`,
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const state = states.find((s) => s.slug === slug);
  if (!state) notFound();

  const svg = readIndiaSvg();
  const placeList = state.destinations
    .map((s) => destinationsBySlug.get(s))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const experienceList = state.experiences
    .map((s) => experiencesBySlug.get(s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <>

      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={state.heroImage}
          alt={state.name}
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1600px] px-6 pb-16 pt-32 sm:px-8 lg:px-12">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sand">
            {state.kind} · {state.region} India
          </p>
          <h1 className="mt-3 font-display text-6xl text-cream sm:text-7xl lg:text-8xl">
            {state.name}
          </h1>
          <p className="mt-4 max-w-xl font-display text-xl italic text-cream/85 sm:text-2xl">
            {state.tagline}
          </p>
        </div>
      </section>

      {/* Intro + meta */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">Discover {state.name}</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {state.tagline}.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
              {state.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <WishlistButton slug={state.slug} label={`Save ${state.name}`} />
              <Link href={`/atlas/map?state=${state.slug}`} className="link-arrow">
                See on the map <ArrowRight size={15} className="link-arrow-icon" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-md border border-ink/10 bg-paper p-6">
              <div className="flex items-center gap-3 border-b border-ink/10 pb-5">
                <CalendarDays size={18} className="text-clay" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    Best time to visit
                  </p>
                  <p className="mt-0.5 font-medium text-ink">{state.bestTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <MapPin size={18} className="text-clay" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    On this map
                  </p>
                  <p className="mt-0.5 font-medium text-ink">
                    {placeList.length} destinations · {experienceList.length} experiences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Places to explore */}
      <section className="bg-canvas-2/60 py-20">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
          <h2 className="font-display text-4xl text-ink sm:text-5xl">
            Places to explore
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5">
            {placeList.map((d, i) => (
              <DestinationCard key={d.slug} destination={d} large={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 sm:px-8 lg:px-12">
        <h2 className="font-display text-4xl text-ink sm:text-5xl">Experiences</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {experienceList.map((e) => (
            <ExperienceCard key={e.slug} experience={e} />
          ))}
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-8 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Explore on map</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              {state.name} on the atlas.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
              {state.name} is highlighted on the map. Hover the neighbouring
              states — the next journey might be closer than you think.
            </p>
            <Link href="/atlas/map" className="btn-primary mt-8">
              Open full map <ArrowRight size={15} className="link-arrow-icon" />
            </Link>
          </div>
          <IndiaMap svg={svg} highlight={state.slug} className="mx-auto w-full max-w-xl" />
        </div>
      </section>
    </>
  );
}
