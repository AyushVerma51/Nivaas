import type { Metadata } from "next";
import { states, regions } from "@/lib/atlas";
import StateCard from "@/components/atlas/StateCard";
import SectionHeading from "@/components/atlas/SectionHeading";
import RegionFilter from "./RegionFilter";

export const metadata: Metadata = {
  title: "States & Union Territories | Atlas India",
  description:
    "All 28 states and 8 union territories of India — regions, destinations and experiences in one atlas.",
};

const stateCount = states.length;
const utCount = states.filter((s) => s.kind === "Union Territory").length;
const regionGroups = regions.map((r) => ({
  ...r,
  items: states.filter((s) => s.region === r.name),
}));

export default function StatesPage() {
  return (
    <>
      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="The atlas"
          title="28 states. 8 union territories. One extraordinary country."
          description={`${stateCount} regions of India, grouped by geography — hover the filter to travel the map, or dive straight into a state.`}
        />
        <RegionFilter />
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-8 lg:px-12">
        <div className="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {states.map((s) => (
            <StateCard key={s.slug} state={s} />
          ))}
        </div>

        <div className="mt-20 space-y-16">
          {regionGroups.map((r) => (
            <section key={r.name} id={`region-${r.name.toLowerCase()}`}>
              <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-3">
                <h2 className="font-display text-3xl text-ink">{r.name} India</h2>
                <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
                  {r.items.length} {r.items.length === 1 ? "region" : "regions"}
                </p>
              </div>
              <p className="mt-3 text-sm text-ink-muted">{r.blurb}</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {r.items.map((s) => (
                  <StateCard key={s.slug} state={s} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-10 text-xs text-ink-muted">
          {utCount} union territories included across the regions above.
        </p>
      </div>
    </>
  );
}
