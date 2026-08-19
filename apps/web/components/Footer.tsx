"use client";

import Link from "next/link";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Atlas", href: "/atlas" },
      { label: "City Guides", href: "/city-guide" },
      { label: "Price Prediction", href: "/predict" },
    ],
  },
  {
    title: "Atlas India",
    links: [
      { label: "Explore", href: "/atlas" },
      { label: "States", href: "/atlas/states" },
      { label: "Destinations", href: "/atlas/destinations" },
      { label: "Experiences", href: "/atlas/experiences" },
      { label: "My Journey", href: "/atlas/journey" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Price Prediction", href: "/predict" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "The platform", href: "/" },
      { label: "Journal", href: "/city-guide" },
      { label: "Contact", href: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-[1600px] px-6 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-12">
          {/* Newsletter / statement */}
          <div className="lg:col-span-5">
            <p className="eyebrow !text-sand">Stay close</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
              Your India starts here.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/70">
              New listings, neighborhood notes, and city guides — a quiet letter
              for people who care where they live.
            </p>
            <form
              className="mt-6 flex max-w-md gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                className="w-full rounded-sm border border-cream/25 bg-transparent px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-cream/70 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-sm bg-clay px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-ink"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Link columns */}
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow !text-sand">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-cream/75 transition-colors hover:text-cream"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-cream/15 pt-8 text-xs text-cream/45 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Estately — Real Estate & Neighborhood Intelligence.</p>
          <p className="font-display text-sm tracking-wide">Estately · editorial, not template.</p>
        </div>
      </div>
    </footer>
  );
}
