import { useMemo, ViewTransition } from "react";

export const ContentTileViewTransition = make("content-title", "vt-text");
export const ContentDateViewTransition = make("content-date", "vt-text");
export const ImageViewTransition = make("image", "vt-image");

type Props = {
  id?: string;
  children: React.ReactNode;
};

// Each boundary only participates in shared-element morphs (`share`). Without
// `default="none"` every named boundary on the page also cross-fades on every
// navigation, whether or not it has a partner on the other page.
function make(
  prefix: string,
  shareClass: string,
): (props: Props) => React.ReactNode {
  const component = function Component({ id, children }) {
    const escapedId = useMemo(
      () => (id == null ? null : encodeToAsciiLetters(id)),
      [id],
    );
    if (escapedId == null) {
      return <>{children}</>;
    }

    return (
      <ViewTransition
        name={`${prefix}-${escapedId}`}
        share={shareClass}
        default="none"
      >
        {children}
      </ViewTransition>
    );
  };
  component.displayName = `ViewTransition(${prefix})`;
  return component;
}

/**
 * https://github.com/facebook/react/issues/33015
 *
 * There are places where we want to use image URLs to provide an identity for a
 * ViewTransition, but the URLs may contain characters that break ViewTransition
 * names.
 *
 * My first assumption was that the restriction was simply that the name just
 * had to be a valid CSS identifier, but I tried using `css.escape` and it
 * didn't work. I haven't validated exactly why, but I'm using this super
 * conservative encoding scheme to restrict to just alphabetic character and it
 * seems the ViewTransition name is always working with this approach for now.
 */
function encodeToAsciiLetters(input: string) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = alphabet.length;
  const bytes = new TextEncoder().encode(input);
  const output: string[] = [];

  let acc = 0;
  let bits = 0;

  for (const byte of bytes) {
    acc = (acc << 8) | byte;
    bits += 8;

    while (bits >= 6) {
      bits -= 6;
      const index = (acc >> bits) & 0x3f;
      output.push(alphabet[index % base]);
    }
  }

  if (bits > 0) {
    const index = (acc << (6 - bits)) & 0x3f;
    output.push(alphabet[index % base]);
  }

  return output.join("");
}
