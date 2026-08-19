import Link from "next/link";
import type { Experience } from "@/lib/atlas";

export default function ExperienceCard({
  experience,
  large = false,
}: {
  experience: Experience;
  large?: boolean;
}) {
  return (
    <Link
      href={`/atlas/experiences/${experience.slug}`}
      className={`group relative block overflow-hidden rounded-md bg-ink ${
        large ? "aspect-[16/10]" : "aspect-[3/4]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={experience.heroImage}
        alt={experience.name}
        loading="lazy"
        className="h-full w-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3 className="font-display text-2xl text-cream sm:text-3xl">
          {experience.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cream/85">
          {experience.tagline}
        </p>
        <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sand">
          {experience.destinations.length} destinations
        </p>
      </div>
    </Link>
  );
}
