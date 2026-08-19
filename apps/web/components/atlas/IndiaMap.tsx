"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { states, type State } from "@/lib/atlas";

/**
 * Interactive India map. Receives the raw SVG markup (read server-side from
 * /public/atlas/india-map.svg), injects it, and attaches hover/click behavior
 * to the state paths by their ISO id attributes (e.g. "INRJ").
 */
export default function IndiaMap({
  svg,
  highlight,
  className = "",
}: {
  svg: string;
  highlight?: string; // state slug to highlight
  className?: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState<State | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  const byId = useMemo(() => new Map(states.map((s) => [s.id, s])), []);
  const highlightId = useMemo(() => {
    const s = states.find((x) => x.slug === highlight);
    return s?.id ?? null;
  }, [highlight]);

  // Inject the highlight class into the matching path so it stays lit.
  const processedSvg = useMemo(() => {
    if (!highlightId) return svg;
    return svg.replace(
      new RegExp(`(<path[^>]*?id="${highlightId}")([^>]*?)>`),
      `$1 class="atlas-active"$2>`,
    );
  }, [svg, highlightId]);

  function onMove(e: React.MouseEvent) {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function pathFrom(e: React.MouseEvent): SVGPathElement | null {
    return (e.target as HTMLElement).closest("path[id]") as SVGPathElement | null;
  }

  function onOver(e: React.MouseEvent) {
    const el = pathFrom(e);
    document
      .querySelectorAll(".atlas-map path.atlas-hover")
      .forEach((p) => p.classList.remove("atlas-hover"));
    if (el) {
      const id = el.getAttribute("id")!;
      el.classList.add("atlas-hover");
      const state = byId.get(id);
      if (state) setActive(state);
    }
  }

  function onOut(e: React.MouseEvent) {
    const el = pathFrom(e);
    if (el) {
      el.classList.remove("atlas-hover");
      setActive(null);
    }
  }

  function onClick(e: React.MouseEvent) {
    const el = pathFrom(e);
    const state = el ? byId.get(el.getAttribute("id")!) : undefined;
    if (state) router.push(`/atlas/states/${state.slug}`);
  }

  return (
    <div
      ref={boxRef}
      className={`relative ${className}`}
      onMouseMove={onMove}
      onMouseLeave={() => setActive(null)}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <div
        className="atlas-map"
        dangerouslySetInnerHTML={{ __html: processedSvg }}
        onMouseOver={onOver}
        onMouseOut={onOut}
        onClick={onClick}
      />

      {/* Lakshadweep label — too small on the SVG to see */}
      <div className="pointer-events-none absolute" style={{ left: "12%", bottom: "4%" }}>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-clay" />
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-ink-muted">Lakshadweep</span>
        </div>
      </div>

      {/* Tooltip */}
      {active ? (
        <div
          className="pointer-events-none absolute z-10 w-56 rounded-md border border-ink/10 bg-cream p-4 shadow-lg"
          style={{
            left: Math.min(position.x, 200),
            top: Math.max(position.y - 12, 8),
          }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-moss">
            {active.region}
          </p>
          <h4 className="mt-1 font-display text-xl text-ink">{active.name}</h4>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
            {active.tagline}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-clay">
            Explore <ArrowRight size={12} />
          </span>
        </div>
      ) : null}

      {active ? (
        <button
          type="button"
          aria-label="Close map tooltip"
          onClick={() => setActive(null)}
          className="absolute right-2 top-2 rounded-sm bg-cream/80 p-1 text-ink/60 hover:text-ink lg:hidden"
        >
          <X size={14} />
        </button>
      ) : null}

      <style jsx global>{`
        .atlas-map svg {
          width: 100%;
          height: auto;
          display: block;
        }
        .atlas-map path[id] {
          fill: #d8d0be;
          stroke: #f8f7f2;
          stroke-width: 0.8;
          transition: fill 0.25s ease-out;
          cursor: pointer;
        }
        .atlas-map path[id]:hover,
        .atlas-map path[id].atlas-hover,
        .atlas-map path[id].atlas-active {
          fill: #a85f43;
        }
      `}</style>
    </div>
  );
}
