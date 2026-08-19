import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  MapPin,
} from "lucide-react";
import {
  destinations,
  destinationsBySlug,
  experiences,
  states,
} from "@/lib/atlas";
import DestinationCard from "@/components/atlas/DestinationCard";
import ExperienceCard from "@/components/atlas/ExperienceCard";
import WishlistButton from "@/components/atlas/WishlistButton";
import VisitedButton from "@/components/atlas/VisitedButton";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = destinationsBySlug.get(slug);
  if (!d) return { title: "Destination not found | Atlas India" };
  return {
    title: `Explore ${d.name} | Atlas India`,
    description: `${d.tagline} — ${d.description.slice(0, 150)}`,
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = destinationsBySlug.get(slug);
  if (!d) notFound();

  const state = states.find((s) => s.slug === d.stateSlug);
  const nearbyList = d.nearby
    .map((s) => destinationsBySlug.get(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const experienceList = experiences.filter((e) =>
    e.destinations.includes(d.slug),
  );

  return (
    <>

      {/* Hero */}
      <section className="relative flex min-h-[72vh] items-end overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={d.heroImage}
          alt={d.name}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1600px] px-6 pb-16 pt-32 sm:px-8 lg:px-12">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-sand"
          >
            <Link href="/atlas" className="hover:text-cream">
              Atlas
            </Link>
            <ChevronRight size={12} />
            {state ? (
              <Link href={`/atlas/states/${state.slug}`} className="hover:text-cream">
                {state.name}
              </Link>
            ) : (
              <span>{d.state}</span>
            )}
            <ChevronRight size={12} />
            <span className="text-cream">{d.name}</span>
          </nav>
          <h1 className="mt-6 font-display text-6xl text-cream sm:text-7xl lg:text-8xl">
            {d.name}
          </h1>
          <p className="mt-4 max-w-2xl font-display text-xl italic text-cream/85 sm:text-2xl">
            {d.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WishlistButton slug={d.slug} label={`Save ${d.name}`} />
            <VisitedButton slug={d.slug} />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">About {d.name}</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {d.tagline}.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
              {d.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink/60">
              <MapPin size={14} className="text-clay" />
              {d.state}
              <span className="mx-1 text-ink/30">·</span>
              {d.category}
              {state ? (
                <>
                  <span className="mx-1 text-ink/30">·</span>
                  <Link href={`/atlas/states/${state.slug}`} className="link-arrow">
                    Explore {state.name}
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          {/* Best time */}
          <div className="lg:col-span-5">
            <div className="rounded-md border border-ink/10 bg-paper p-6">
              <div className="flex items-center gap-3 border-b border-ink/10 pb-5">
                <CalendarDays size={18} className="text-clay" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    Best time to visit
                  </p>
                  <p className="mt-0.5 font-medium text-ink">{d.bestTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <MapPin size={18} className="text-clay" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    Nearby in the atlas
                  </p>
                  <p className="mt-0.5 font-medium text-ink">
                    {nearbyList.length} nearby places
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Things to do */}
      <section className="bg-canvas-2/60 py-20">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
          <h2 className="font-display text-4xl text-ink sm:text-5xl">
            Things to do
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {d.highlights.map((h) => (
              <li
                key={h}
                className="flex items-start gap-3 rounded-md border border-ink/10 bg-paper p-5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss/15 text-moss">
                  <Check size={14} />
                </span>
                <span className="text-sm leading-relaxed text-ink">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Experiences */}
      {experienceList.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-6 py-20 sm:px-8 lg:px-12">
          <h2 className="font-display text-4xl text-ink sm:text-5xl">
            Experiences here
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
            {experienceList.map((e) => (
              <ExperienceCard key={e.slug} experience={e} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Nearby */}
      {nearbyList.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-4xl text-ink sm:text-5xl">
              Nearby places
            </h2>
            <Link href="/atlas/destinations" className="link-arrow">
              All destinations <ArrowRight size={15} className="link-arrow-icon" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {nearbyList.map((n) => (
              <DestinationCard key={n.slug} destination={n} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
