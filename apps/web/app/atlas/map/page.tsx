import type { Metadata } from "next";
import { readIndiaSvg } from "@/lib/atlas/readSvg";
import { states } from "@/lib/atlas";
import IndiaMap from "@/components/atlas/IndiaMap";
import SectionHeading from "@/components/atlas/SectionHeading";
import StateCard from "@/components/atlas/StateCard";

export const metadata: Metadata = {
  title: "Map of India | Atlas India",
  description:
    "An interactive map of India — hover a state to see where it could take you, click to open its guide.",
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const svg = readIndiaSvg();
  const highlighted = state
    ? states.find((s) => s.slug === state)
    : undefined;

  return (
    <>
      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="The atlas"
          title="Start anywhere."
          description={
            highlighted
              ? `${highlighted.name} is highlighted below. Hover any state to preview it — click to open its full guide.`
              : "Hover a state to preview where it could take you, then click to open its full guide. Thirty-six regions, one map."
          }
        />
      </div>

      <section className="mx-auto max-w-[1600px] px-6 pb-20 sm:px-8 lg:px-12">
        <IndiaMap svg={svg} highlight={highlighted?.slug} className="mx-auto max-w-3xl" />
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-4xl text-ink sm:text-5xl">
            All {states.length} regions
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {states.map((s) => (
            <StateCard key={s.slug} state={s} />
          ))}
        </div>
      </section>
    </>
  );
}
