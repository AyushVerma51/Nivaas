import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Destination } from "@/lib/atlas";

export default function DestinationCard({
  destination,
  large = false,
}: {
  destination: Destination;
  large?: boolean;
}) {
  return (
    <Link
      href={`/atlas/destinations/${destination.slug}`}
      className={`group block overflow-hidden rounded-md bg-ink ${large ? "aspect-[4/5]" : "aspect-[3/4]"}`}
    >
      <div className="relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={destination.heroImage}
          alt={destination.name}
          loading="lazy"
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sand">
            {destination.state} · {destination.category}
          </p>
          <h3 className="mt-1.5 font-display text-2xl text-cream sm:text-[1.7rem] sm:leading-tight">
            {destination.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cream/85">
            {destination.tagline}
          </p>
          <span className="link-arrow mt-3 inline-flex !text-cream">
            Explore
            <ArrowRight size={15} className="link-arrow-icon" />
          </span>
        </div>
      </div>
    </Link>
  );
}
