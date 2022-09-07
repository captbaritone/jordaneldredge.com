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
        attrs: { style: `color: ${token.color}` },
      });
      offset = endOffset;
    }
    // Line ending
    // TODO: Ensure we don't end up with an off-by-one error if they use `/r/n`.
    offset++;
  }
  return syntaxRanges;
}

function getLineOffsets(code) {
  let offset = 0;
  const lineOffsets = {};

  // TODO: Ensure we don't end up with an off-by-one error if they use `/r/n`.
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    lineOffsets[i] = offset;
    offset += lines[i].length + 1;
  }
  return lineOffsets;
}

// Here we take a list or attributed ranges which may overlap in arbitrary ways,
// and covert them into HTML which requires that all tags be strictly nested.
// For example we can't end up with HTML like this:
//
// <a>  <b>   </a>   </b>
//
// We need to convert this into:
//
// <a>  </a><b><a>   </a>   </b>
//
// or
//
// <a>  <b>   </b></a><b>   </b>
//
// This approach assumes that all ranges are purely stylistic. Meaning they
// can be nested in any order and that they can be arbitrarily split into
// multiple tags when needed. For example, a tag with a hover state that
// changes the style of the whole tag might not render correctly with this
// approach.
//
// Note that we also assume that all ranges have a length of at least 1.
export function applyRangesToText(code, ranges) {
  const sortedRanges = ranges.slice();
  sortedRanges.sort((a, b) => {
    return a.start - b.start;
  });

  let html = `<span class="highlight-line">`;

  // Track which ranges are currently open.
  const openRanges = [];

  for (let i = 0; i < code.length; i++) {
    // Close all open ranges that end at this position.
    for (let j = 0; j < openRanges.length /* no increment */; ) {
      const openRange = openRanges[j];
      if (openRange.end === i) {
        html += `</${openRange.tag}>`;
        // Because splice shrinks the array, we don't need to increment j.
        openRanges.splice(j, 1);
      } else {
        j++;
      }
    }

    // While there is a range that starts at this position, open it.
    // Because ranges are sorted, we can just check the head element.
    while (sortedRanges[0] && sortedRanges[0].start <= i) {
      const nextRange = sortedRanges.shift();
      const toOpen = [nextRange];

      // TODO: Maybe I could push on first and just be careful never to get that far?

      // If there are any open ranges that will be closing before this one ends,
      // we close them here and then reopen them after opening our tag.
      for (let j = 0; j < openRanges.length /* no increment */; ) {
        const openRange = openRanges[j];
        // If this already-open tag is going to close before this range ends, we
        // need to close it here and re-open after the range is opened.
        if (openRange.end < nextRange.end) {
          html += `</${openRange.tag}>`;
          // Because splice shrinks the array, we don't need to increment j.
          openRanges.splice(j, 1);
          toOpen.push(openRange);
        } else {
          j++;
        }
      }

      // Open all the tags that we need to open.
      for (const range of toOpen) {
        let attributes = "";
        if (range.attrs != null) {
          for (const [key, value] of Object.entries(range.attrs)) {
            attributes += ` ${key}="${escapeAttribute(value)}"`;
          }
        }
        html += `<${range.tag}${attributes}>`;
        openRanges.push(range);
      }
    }

    if (code[i] === "\n") {
      for (let j = 0; j < openRanges.length /* no increment */; ) {
        html += `</${openRanges[j].tag}>`;
        openRanges.splice(j, 1);
        sortedRanges.unshift(openRanges[j]);
        sortedRanges.sort((a, b) => {
          return a.start - b.start;
        });
      }
      html += `</span>`;
      html += "<br />";
      html += `<span class="highlight-line">`;
    } else {
      // TODO: Do I need to escape other characters?
      // Shiki-twoslash does a few more: https://github.com/shikijs/twoslash/blob/main/packages/shiki-twoslash/src/utils.ts#L113
      html += escapeHtmlChar(code[i]);
    }
  }

  // Close any tags that end after the last character.
  for (const openRange of openRanges) {
    // In theory `openRange.end` should always be `code.length` here.
    html += `</${openRange.tag}>`;
  }

  html += `</span>`; // highlight-line
  return html;
}

function escapeHtmlChar(char) {
  if (char === "<") {
    return "&lt;";
  } else if (char === ">") {
    return "&gt;";
  } else {
    return char;
  }
}

function escapeAttribute(value) {
  return value.replace(/"/g, "&quot;");
}
