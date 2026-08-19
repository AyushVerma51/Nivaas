import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, MapPin, Sparkles } from "lucide-react";
import { destinations, destinationsBySlug } from "@/lib/atlas";
import DestinationCard from "@/components/atlas/DestinationCard";
import SectionHeading from "@/components/atlas/SectionHeading";
import JourneyView from "./JourneyView";

export const metadata: Metadata = {
  title: "My Journey | Atlas India",
  description:
    "Your personal India travel space — wishlist, visited places and planned journeys, saved in your browser.",
};

export default function JourneyPage() {
  const all = destinations.map((d) => destinationsBySlug.get(d.slug)).filter(
    (d): d is NonNullable<typeof d> => Boolean(d),
  );

  return (
    <>
      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Your space"
          title="My India."
          description="Save places you dream about, mark the ones you've seen, and watch your map of India grow. Everything is stored in your browser — no account needed."
        />
        <JourneyView all={all} />
      </div>

      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-4xl text-ink sm:text-5xl">
            Start somewhere new
          </h2>
          <Link href="/atlas/destinations" className="link-arrow">
            Browse destinations <ArrowRight size={15} className="link-arrow-icon" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {all.slice(0, 8).map((d, i) => (
            <DestinationCard key={d.slug} destination={d} large={i === 0} />
          ))}
        </div>
      </section>
    </>
  );
}
