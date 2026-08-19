import type { Metadata } from "next";
import { destinations, categories } from "@/lib/atlas";
import DestinationCard from "@/components/atlas/DestinationCard";
import SectionHeading from "@/components/atlas/SectionHeading";
import CategoryFilter from "./CategoryFilter";

export const metadata: Metadata = {
  title: "Destinations | Atlas India",
  description:
    "Every destination in the Atlas India — from the Taj Mahal to living root bridges, sorted by what you're looking for.",
};

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = categories.find(
    (c) => c.toLowerCase() === (category ?? "").toLowerCase(),
  );
  const list = active
    ? destinations.filter((d) => d.category === active)
    : destinations;

  return (
    <>
      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="The places"
          title="Destinations worth the detour."
          description={
            active
              ? `${list.length} ${active.toLowerCase()} destinations across India.`
              : `${destinations.length} places across India — temples, tea gardens, deserts and islands. Filter by what pulls you.`
          }
        />
        <CategoryFilter active={active ?? null} />
      </div>
      <div className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-8 lg:px-12">
        {list.length === 0 ? (
          <p className="mt-12 text-center text-ink-muted">
            No destinations in this category yet.
          </p>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {list.map((d, i) => (
              <DestinationCard key={d.slug} destination={d} large={i % 9 === 0} />
            ))}
          </div>
        )}
        <p className="mt-8 text-xs text-ink-muted">
          Categories: {categories.join(" · ")}
        </p>
      </div>
    </>
  );
}
