import type { Metadata } from "next";
import SearchBar from "@/components/atlas/SearchBar";
import SectionHeading from "@/components/atlas/SectionHeading";

export const metadata: Metadata = {
  title: "Search India | Atlas India",
  description:
    "Search the Atlas India — destinations, states and experiences in one place.",
};

export default function SearchPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Search the atlas"
          title="Where do you want to go?"
          description="Destinations, states, experiences — type anything and watch the atlas answer."
        />
        <div className="mt-10">
          <SearchBar autoFocus />
        </div>
      </div>
    </>
  );
}
