import { useSyncExternalStore } from "react";

// Whether the next update to a search result list comes from the search box or
// the sort control. Result items animate only while this is set, so they stay
// still during ordinary navigations.
//
// This would naturally be a transition type (addTransitionType), but React
// drops the types of a navigation whose results take more than one pass to
// render, such as clearing the query to bring back every post, so those
// updates snapped into place instead of animating.

export type SearchTransition = {
  pending: boolean;
  // Keys of the results that were on screen when the search started.
  visibleKeys: ReadonlySet<string>;
};

// The attribute KeyboardList puts on each result, holding its key.
export const SEARCH_RESULT_ATTRIBUTE = "data-search-result";

const IDLE: SearchTransition = { pending: false, visibleKeys: new Set() };
let current = IDLE;
let clearTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function visibleResultKeys(): Set<string> {
  const keys = new Set<string>();
  const height = window.innerHeight;
  for (const element of document.querySelectorAll(
    `[${SEARCH_RESULT_ATTRIBUTE}]`,
  )) {
    const rect = element.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < height) {
      keys.add(element.getAttribute(SEARCH_RESULT_ATTRIBUTE)!);
    }
  }
  return keys;
}

// Call before starting the navigation, outside startTransition.
export function markSearchTransition() {
  current = { pending: true, visibleKeys: visibleResultKeys() };
  // In case the navigation never commits new results, don't leave the list
  // primed to animate whatever happens next.
  if (clearTimer != null) {
    clearTimeout(clearTimer);
  }
  clearTimer = setTimeout(clearSearchTransition, 3000);
  emit();
}

export function clearSearchTransition() {
  if (!current.pending) {
    return;
  }
  current = IDLE;
  if (clearTimer != null) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSearchTransition(): SearchTransition {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => IDLE,
  );
}
