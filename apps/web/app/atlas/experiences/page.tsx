import type { Metadata } from "next";
import { experiences } from "@/lib/atlas";
import ExperienceCard from "@/components/atlas/ExperienceCard";
import SectionHeading from "@/components/atlas/SectionHeading";

export const metadata: Metadata = {
  title: "Experiences | Atlas India",
  description:
    "Travel India by feeling — mountains, beaches, heritage, wildlife, food and more.",
};

export default function ExperiencesPage() {
  return (
    <>
      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Travel by feeling"
          title="What are you looking for?"
          description="Ten ways to move through India. Pick a feeling and the atlas will follow."
        />
      </div>
      <div className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((e, i) => (
            <ExperienceCard key={e.slug} experience={e} large={i === 0} />
          ))}
        </div>
      </div>
    </>
  );
}
