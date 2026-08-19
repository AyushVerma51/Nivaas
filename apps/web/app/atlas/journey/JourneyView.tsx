"use client";

import Link from "next/link";
import { Compass, MapPin, Sparkles, Trash2 } from "lucide-react";
import { useJourney } from "@/lib/atlas/useJourney";
import type { Destination } from "@/lib/atlas";

export default function JourneyView({ all }: { all: Destination[] }) {
  const { wishlist, visited, ready, toggleWishlist, toggleVisited, clear } =
    useJourney();

  const wishlistItems = wishlist
    .map((s) => all.find((d) => d.slug === s))
    .filter((d): d is Destination => Boolean(d));
  const visitedItems = visited
    .map((s) => all.find((d) => d.slug === s))
    .filter((d): d is Destination => Boolean(d));

  const progress = ready
    ? Math.round((visited.length / all.length) * 100)
    : 0;

  return (
    <div className="mt-10">
      {/* Progress */}
      <div className="rounded-md border border-ink/10 bg-paper p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
              Your India so far
            </p>
            <p className="mt-1 font-display text-4xl text-ink">
              {visited.length} <span className="text-xl text-ink-muted">of {all.length} places explored</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl text-moss">{progress}%</p>
            <p className="text-xs uppercase tracking-wider text-ink-muted">
              of the atlas
            </p>
          </div>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Atlas progress"
          className="mt-5 h-2 w-full overflow-hidden rounded-full bg-canvas-2"
        >
          <div
            className="h-full rounded-full bg-moss transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          type="button"
          onClick={clear}
          className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-ink/50 transition-colors hover:text-clay"
        >
          <Trash2 size={13} />
          Clear my journey
        </button>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        {/* Wishlist */}
        <section>
          <div className="flex items-center gap-2.5 border-b border-ink/10 pb-3">
            <Sparkles size={17} className="text-clay" />
            <h2 className="font-display text-3xl text-ink">Wishlist</h2>
            <span className="ml-auto rounded-full bg-canvas-2 px-2.5 py-0.5 text-xs text-ink-muted">
              {wishlistItems.length}
            </span>
          </div>
          {wishlistItems.length === 0 ? (
            <EmptyState
              icon={<Compass size={20} />}
              title="Nothing saved yet"
              text="Tap “Save” on any destination and it will wait for you here."
              href="/atlas/destinations"
              cta="Find somewhere to save"
            />
          ) : (
            <ul className="mt-5 space-y-2">
              {wishlistItems.map((d) => (
                <li
                  key={d.slug}
                  className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-paper px-4 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/atlas/destinations/${d.slug}`}
                      className="font-display text-lg text-ink hover:text-clay"
                    >
                      {d.name}
                    </Link>
                    <p className="truncate text-xs text-ink-muted">
                      {d.state} · {d.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(d.slug)}
                    className="shrink-0 text-xs font-medium text-ink/50 transition-colors hover:text-clay"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Visited */}
        <section>
          <div className="flex items-center gap-2.5 border-b border-ink/10 pb-3">
            <MapPin size={17} className="text-moss" />
            <h2 className="font-display text-3xl text-ink">Visited</h2>
            <span className="ml-auto rounded-full bg-canvas-2 px-2.5 py-0.5 text-xs text-ink-muted">
              {visitedItems.length}
            </span>
          </div>
          {visitedItems.length === 0 ? (
            <EmptyState
              icon={<MapPin size={20} />}
              title="No pins dropped yet"
              text="Mark a destination as “Been here” and it lands on this map."
              href="/atlas/map"
              cta="Open the map"
            />
          ) : (
            <ul className="mt-5 space-y-2">
              {visitedItems.map((d) => (
                <li
                  key={d.slug}
                  className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-paper px-4 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/atlas/destinations/${d.slug}`}
                      className="font-display text-lg text-ink hover:text-clay"
                    >
                      {d.name}
                    </Link>
                    <p className="truncate text-xs text-ink-muted">
                      {d.state} · {d.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleVisited(d.slug)}
                    className="shrink-0 text-xs font-medium text-ink/50 transition-colors hover:text-clay"
                  >
                    Undo
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-5 flex flex-col items-center justify-center rounded-md border border-dashed border-ink/20 bg-paper/50 px-6 py-12 text-center">
      <span className="text-ink/40">{icon}</span>
      <p className="mt-3 font-display text-xl text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-ink-muted">{text}</p>
      <Link href={href} className="link-arrow mt-4">
        {cta}
      </Link>
    </div>
  );
}
