import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { experiences, destinationsBySlug } from "@/lib/atlas";
import DestinationCard from "@/components/atlas/DestinationCard";
import ExperienceCard from "@/components/atlas/ExperienceCard";

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = experiences.find((x) => x.slug === slug);
  if (!e) return { title: "Experience not found | Atlas India" };
  return {
    title: `${e.name} in India | Atlas India`,
    description: `${e.tagline} — ${e.description.slice(0, 150)}`,
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = experiences.find((x) => x.slug === slug);
  if (!e) notFound();

  const list = e.destinations
    .map((s) => destinationsBySlug.get(s))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const others = experiences.filter((x) => x.slug !== e.slug);

  return (
    <>

      {/* Hero */}
      <section className="relative flex min-h-[64vh] items-end overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={e.heroImage}
          alt={e.name}
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1600px] px-6 pb-16 pt-32 sm:px-8 lg:px-12">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-sand"
          >
            <Link href="/atlas" className="hover:text-cream">
              Atlas
            </Link>
            <ChevronRight size={12} />
            <Link href="/atlas/experiences" className="hover:text-cream">
              Experiences
            </Link>
            <ChevronRight size={12} />
            <span className="text-cream">{e.name}</span>
          </nav>
          <h1 className="mt-6 font-display text-6xl text-cream sm:text-7xl lg:text-8xl">
            {e.name}
          </h1>
          <p className="mt-4 max-w-2xl font-display text-xl italic text-cream/85 sm:text-2xl">
            {e.tagline}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="eyebrow">Travel by feeling</p>
          <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            {e.name}, India.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
            {e.description}
          </p>
        </div>
      </section>

      {/* Matching destinations */}
      <section className="bg-canvas-2/60 py-20">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-4xl text-ink sm:text-5xl">
              Where to feel it
            </h2>
            <Link href="/atlas/destinations" className="link-arrow">
              All destinations <ArrowRight size={15} className="link-arrow-icon" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {list.map((d, i) => (
              <DestinationCard key={d.slug} destination={d} large={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Other experiences */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 sm:px-8 lg:px-12">
        <h2 className="font-display text-4xl text-ink sm:text-5xl">
          Keep exploring
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {others.map((o) => (
            <ExperienceCard key={o.slug} experience={o} />
          ))}
        </div>
      </section>
    </>
  );
}
