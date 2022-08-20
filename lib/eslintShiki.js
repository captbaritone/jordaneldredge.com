const { Linter } = require("eslint");

function eslintShiki(highlighter, code) {
  const lineOffsets = getLineOffsets(code);

  const linter = new Linter();

  const messages = linter.verify(code, {
    env: { es6: true },
    rules: { "no-constant-binary-expression": 2 },
  });

  const tags = [];
  for (const message of messages) {
    const start = lineOffsets[message.line - 1] + message.column - 1;
    const end = lineOffsets[message.endLine - 1] + message.endColumn - 1;
    tags.push({
      tagType: "open",
      content: ">>",
      pos: start,
      message: message.message,
    });
    tags.push({
      tagType: "close",
      content: "<<",
      pos: end,
      message: message.message,
    });
  }

  // TODO: If messages overlap, we should split them:
  // <a>     </a>
  //      <b>     </b>
  // <a>  </a><a><b>  </b></a><b>  </b>

  tags.sort((a, b) => a.pos - b.pos);

  const tokenLines = highlighter.codeToThemedTokens(code, "js");
  mergeTagsIntoTokens(tokenLines, tags);
  return tokenLines;
}

/**
 * Mutates `tokenLines`, merging in `tags` at the specified positions. If tags
 * are positioned within a token, that token is split into two tokens with the
 * tag positioned between them.
 *
 * @param {*} tokenLines An array of arrays of tokens, each array of tokens representing a line.
 * @param {*} tags A _sorted_ array of tag objects (open or close), each with a
 *     `pos` property representing the position of the tag.  @returns An array of
 * arrays of tokens/tags, each array of tokens/tags representing a line.
 */
function mergeTagsIntoTokens(tokenLines, tags) {
  let nextTag = tags.shift();

  let offset = 0;
  for (const line of tokenLines) {
    // Iterate over each token inserting tags as necessary. If the tag needs to
    // start or end in the middle of the token, split the token and insert the
    // tag in the middle.
    for (let i = 0; i < line.length; i++) {
      if (nextTag == null) {
        return;
      }
      const token = line[i];
      const endOffset = offset + token.content.length;

      if (nextTag.pos < endOffset) {
        if (offset == nextTag.pos) {
          // This tag belongs right before this token. So we insert it.
          // Because we inserted before the token, the next iteration of the
          // token loop will compare the same token against the next tag.
          line.splice(i, 0, nextTag);
        } else {
          // This tag belongs in the middle of this token. So we split the
          // token in two and insert the tag in the middle.
          //
          // We advance `i` by 1 and `offset` by the before length to account
          // for the "before" token, which is now complete. The next iteration
          // of the token loop with compare the "after" token to the next tag.
          const [before, after] = splitToken(token, nextTag.pos - offset);
          line.splice(i, 1, before, nextTag, after);
          i += 1;
          offset = offset + before.content.length;
        }
        nextTag = tags.shift();
      } else {
        offset = endOffset;
      }
    }
    // Newline character
    offset++;
  }
}

function splitToken(token, offset) {
  const before = { ...token, content: token.content.substring(0, offset) };
  const after = { ...token, content: token.content.substring(offset) };
  return [before, after];
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

// Alternate idea:

/**

Sort the messages by start position.
const messages = [...messages];
messages.sort((a, b) => a.start - b.start);

const openTags = [];
const nextTag = messages.shift();

let offset = 0;

for (const line of tokenLines) {
    for (const token of line) {
        if(nextTag == null && openTags.length == 0) {
            return tokenLines;
        }
        const endOffset = offset + token.content.length;

        if(nextTag != null && nextTag.start < endOffset) {
            for(const openTag of openTags) {
                if(nextTag.end > openTag.end) {
                    // Insert a close tag for the current open tag.
                }
            }
            // If there are currently open tags that will be closed before this
            // messages closes, we need to close the open tag before we insert
            // this open.
            openTags.push(nextTag);
        }

        // If the next tag is in this token, split the token and insert the tag in the middle.
        // If any of the open tags end within this token, split the token and insert the tag in the middle.

        offset = endOffset;

    }
}

 */

module.exports = eslintShiki;
