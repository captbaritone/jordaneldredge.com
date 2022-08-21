import { Linter } from "eslint";

// Get ESLint messages as ranges
export function getEslintRanges(config, code) {
  const linter = new Linter();

  const rawMessages = linter.verify(code, {
    env: { es2022: true },
    rules: config,
  });

  const lineOffsets = getLineOffsets(code);

  return rawMessages.map((message) => {
    const endLine = message.endLine ?? message.line;
    const endColumn = message.endColumn ?? message.column;
    return {
      start: lineOffsets[message.line - 1] + message.column - 1,
      end: lineOffsets[endLine - 1] + endColumn - 1,
      tag: "data-err",
      attrs: `title="${message.message}"`,
    };
  });
}

// Get Shiki syntax highlighting tokens as ranges.
export function getSyntaxRanges(highlighter, code, language) {
  const tokenLines = highlighter.codeToThemedTokens(code, language);

  const syntaxRanges = [];
  let offset = 0;
  for (const line of tokenLines) {
    for (const token of line) {
      const endOffset = offset + token.content.length;
      syntaxRanges.push({
        start: offset,
        end: endOffset,
        tag: "span",
        attrs: `style="color: ${token.color}"`,
      });
      offset = endOffset;
    }
    // Line ending
    offset++;
  }
  return syntaxRanges;
}

function getLineOffsets(code) {
  let offset = 0;
  const lineOffsets = {};

  // TODO: More robust line splits
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    lineOffsets[i] = offset;
    offset += lines[i].length + 1;
  }
  return lineOffsets;
}

// Here we take a list or ranges which may overlap in arbitrary ways, and
// covert them into HTML which requires that all tags be strictly nested. For
// example we can't end up with HTML like this:
//
// <a>  <b>   </a>   </b>
//
// We need to convert this into:
//
// <a>  </a><b><a>   </a>   </b>
//
// This approach assumes that all ranges are purely stylistic. Meaning they
// can be nested in any order and that they can be arbitrarily split into
// multiple tags when needed. For example, a tag with a hover state that
// changes the style of the whole tag would not render correctly with this
// approach.
export function applyRangesToText(code, ranges) {
  const sortedRanges = ranges.slice();
  sortedRanges.sort((a, b) => a.start - b.start);

  let html = "";

  // Track which tags are currently open.
  const openRanges = [];

  for (let i = 0; i < code.length; i++) {
    // Close all open ranges that end at this position.
    for (let j = 0; j < openRanges.length; j++) {
      const openRange = openRanges[j];
      if (openRange.end === i) {
        html += `</${openRange.tag}>`;
        openRanges.splice(j, 1);
        // TODO: Juggle j so that we don't skip any ranges?
      }
    }

    // If there is a range that starts at this position, open it.
    // Because ranges are sorted, we can just check the head element.
    if (sortedRanges[0] && sortedRanges[0].start === i) {
      const nextRange = sortedRanges.shift();
      const toOpen = [nextRange];

      // TODO: Maybe I could push on first and just be careful never to get that far?

      // If there are any open ranges that will be closing before this one, we
      // close them here and then reopen them after opening our tag.
      for (let j = 0; j < openRanges.length; j++) {
        const openRange = openRanges[j];
        // This open tag is going to close before this range ends.
        // So we close it here and re-open after the range is opened.
        if (nextRange.start < openRange.end) {
          html += `</${openRange.tag}>`;
          openRanges.splice(j, 1);
          // TODO: Juggle j so that we don't skip any ranges?
          toOpen.push(openRange);
        }
      }

      // Open all the tags that we need to open.
      for (const range of toOpen) {
        html += `<${range.tag} ${range.attrs}>`;
        openRanges.push(range);
      }

      // We might now need to close some tags at this position, or open more
      // tags. So we decrement i to re-evaluate this position on the next turn
      // of the loop.
      i--;
    } else {
      // All tags have been opened for this position. We can emit the character.
      html += code[i];
    }
  }

  // Close any tags that end after the last character.
  for (const openRange of openRanges) {
    if (openRange.end !== code.length) {
      throw new Error("Unexpected range that ends after the code ends.");
    }
    html += `</${openRange.tag}>`;
  }

  return html;
}
