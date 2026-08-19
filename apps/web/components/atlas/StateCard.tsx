import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { State } from "@/lib/atlas";

export default function StateCard({ state }: { state: State }) {
  return (
    <Link
      href={`/atlas/states/${state.slug}`}
      className="group relative block overflow-hidden rounded-md bg-ink"
    >
      <div className="aspect-[4/3] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={state.heroImage}
          alt={state.name}
          loading="lazy"
          className="h-full w-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sand">
            {state.region} · {state.destinations.length} destinations
          </p>
          <h3 className="mt-1 font-display text-2xl text-cream">{state.name}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-cream/85">{state.tagline}</p>
          <span className="link-arrow mt-3 inline-flex !text-cream">
            Explore
            <ArrowRight size={15} className="link-arrow-icon" />
          </span>
        </div>
      </div>
    </Link>
  );
}
