import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Journey } from "@/lib/atlas";

export default function JourneyCard({ journey }: { journey: Journey }) {
  return (
    <Link
      href={`/atlas/destinations/${journey.stops[0]}`}
      className="group block overflow-hidden rounded-md border border-ink/10 bg-paper transition duration-300 hover:border-ink/25"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={journey.heroImage}
          alt={journey.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-sm bg-cream/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-ink">
          {journey.days} days
        </span>
      </div>
      <div className="p-5">
        <p className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-moss">
          <MapPin size={12} />
          {journey.tagline}
        </p>
        <h3 className="mt-2 font-display text-2xl text-ink">{journey.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {journey.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {journey.theme.map((t) => (
            <span
              key={t}
              className="rounded-sm bg-canvas-2 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-ink-muted"
            >
              {t}
            </span>
          ))}
        </div>
        <span className="link-arrow mt-4 inline-flex">
          Start this journey
          <ArrowRight size={15} className="link-arrow-icon" />
        </span>
      </div>
    </Link>
  );
}
