"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "atlas-journey-v1";

export interface JourneyState {
  wishlist: string[];
  visited: string[];
}

const EMPTY: JourneyState = { wishlist: [], visited: [] };

// Module-scoped store: every useJourney() consumer shares one state, so
// WishlistButton and VisitedButton on the same page never clobber each other.
let state: JourneyState = EMPTY;
let listeners = new Set<() => void>();
let loaded = false;

function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<JourneyState>;
      state = {
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
        visited: Array.isArray(parsed.visited) ? parsed.visited : [],
      };
    }
  } catch {
    state = EMPTY;
  }
}

function subscribe(cb: () => void): () => void {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): JourneyState {
  load();
  return state;
}

function persist(next: JourneyState): void {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — keep in-memory state
  }
  listeners.forEach((cb) => cb());
}

export function useJourney() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const toggleWishlist = useCallback((slug: string) => {
    persist({
      ...state,
      wishlist: state.wishlist.includes(slug)
        ? state.wishlist.filter((x) => x !== slug)
        : [...state.wishlist, slug],
    });
  }, []);

  const toggleVisited = useCallback((slug: string) => {
    persist({
      ...state,
      visited: state.visited.includes(slug)
        ? state.visited.filter((x) => x !== slug)
        : [...state.visited, slug],
    });
  }, []);

  const clear = useCallback(
    () => persist({ wishlist: [], visited: [] }),
    [],
  );

  return { ...s, ready: true, toggleWishlist, toggleVisited, clear };
}
