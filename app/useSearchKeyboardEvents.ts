/**
 * Borrowed and adapted from Algolia DocSearch
 * https://github.com/algolia/docsearch/blob/7f670b6ba9d09bd8adf2455239c1c96ceb208851/packages/docsearch-react/src/useDocSearchKeyboardEvents.ts
 */
import React from "react";

export interface UseDocSearchKeyboardEventsProps {
  onOpen: () => void;
}

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement;
  const tagName = element.tagName;

  return (
    element.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "SELECT" ||
    tagName === "TEXTAREA"
  );
}

export function useSearchKeyboardEvents({
  onOpen,
}: UseDocSearchKeyboardEventsProps): void {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (
        // The `Cmd+K` shortcut both opens and closes the modal.
        // We need to check for `event.key` because it can be `undefined` with
        // Chrome's autofill feature.
        // See https://github.com/paperjs/paper.js/issues/1398
        (event.key?.toLowerCase() === "k" &&
          (event.metaKey || event.ctrlKey)) ||
        // The `/` shortcut opens but doesn't close the modal because it's
        // a character.
        (!isEditingContent(event) && event.key === "/")
      ) {
        event.preventDefault();

        // We check that no other DocSearch modal is showing before opening
        // another one.
        onOpen();

        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return (): void => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpen]);
}
