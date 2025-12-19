# Writing Style Guide for jordaneldredge.com

This style guide captures the consistent voice and formatting conventions for all blog posts and notes on jordaneldredge.com.

## Content Types: Posts vs. Notes

This site features two types of content with different purposes and editorial approaches:

### Posts (`_posts/`)
**Purpose**: Comprehensive, polished pieces that explore topics in depth.

**Characteristics:**
- **Length**: Typically 1,000+ words, often much longer
- **Structure**: Multiple sections with headers (H2, H3), clear beginning/middle/end
- **Depth**: Deep dives into projects, technical topics, or experiences
- **Polish**: Carefully edited, complete narratives
- **Examples**: Include code examples, detailed explanations, step-by-step guides
- **Time investment**: Readers should expect to spend 5-15 minutes reading

**When to write a post:**
- Documenting a project or technical achievement
- Tutorial or how-to guide
- Comprehensive technical explanation
- Extended narrative or case study
- Detailed retrospective or post-mortem

**Examples from the blog:**
- "Grats: A More Pleasant Way to Build TypeScript GraphQL Servers"
- "Mainlining Nostalgia: Making the Winamp Skin Museum"
- "Implementation-First GraphQL"

### Notes (`_notes/`)
**Purpose**: Quick observations, insights, or interesting shares that don't require deep exploration.

**Characteristics:**
- **Length**: Typically 100-500 words, can be as short as a single paragraph or quote
- **Structure**: More free-form, often no headers or just one section
- **Depth**: Single insight, observation, or idea
- **Polish**: Conversational and casual, though still well-written
- **Examples**: May include minimal or no code examples
- **Attribution**: May be shares of others' content (talks, articles, tools)
- **Time investment**: Readers should expect to spend 1-3 minutes reading

**When to write a note:**
- Quick observation about programming or software engineering
- Sharing someone else's interesting content with brief commentary
- Short reflection on a concept or pattern
- Brief "Today I learned" moments
- Pithy quote or aphorism
- Personal reflection that doesn't require extensive explanation

**Examples from the blog:**
- "Eldredge's law of online discourse" (single quote)
- "Lint or Keep Quiet" (focused argument with bullet points)
- "Software at Scale" (brief observation about Meta's approach)
- "Becoming a local subject matter expert" (short reflection)

### Shared Voice
**Important**: While posts and notes differ in scope and structure, they share the same authentic voice:
- First person perspective
- Conversational tone with contractions
- Technical but accessible
- Honest and direct

The difference is **scope and depth**, not voice or authenticity.

## Voice and Tone

### Personal and Conversational
- **Use first person**: Write with "I" throughout. This is your blog; own it.
- **Use contractions**: Write naturally with "I've", "it's", "don't", "you're", etc.
- **Be direct**: Address readers as "you" when appropriate.
- **Stay authentic**: Your writing should feel like a conversation with a fellow developer.

### Technical but Accessible
- Write for an audience of developers who may not be experts in your specific topic.
- Explain technical concepts clearly without being condescending.
- Use code examples liberally to illustrate points in posts; sparingly in notes.

## Title Conventions

### Title Casing
**Use sentence case** for all post titles, with the following exceptions:
- Proper nouns (e.g., "Winamp", "TypeScript", "GraphQL")
- Acronyms (e.g., "API", "UI", "UX")
- Code elements when part of the title (e.g., `??`, `{transitions}`)

**Examples:**
- ✅ "Gzip hates your DRY code"
- ✅ "Building the @WinampSkins Twitter Bot"
- ✅ "?? "" is a Code Smell"
- ✅ "{transitions} = f(state)"
- ❌ "Gzip Hates Your DRY Code"
- ❌ "Building The @WinampSkins Twitter Bot"

### Title Punctuation
- **No period at the end** of titles
- **Use colons** to separate main title from subtitle: "Grats: A More Pleasant Way to Build TypeScript GraphQL Servers"
- **Use quotes** for quoting code or literal strings: `?? "" is a Code Smell`
- **Use question marks** when the title is genuinely a question

## Summary Conventions

The summary appears in the post's frontmatter and is used for social sharing, RSS feeds, and post listings. A well-crafted summary gives readers a clear sense of what the post is about and why they might want to read it.

### Length
- **Keep it to 1-2 sentences** (occasionally 3 for complex topics)
- Aim for 100-200 characters when possible for optimal social sharing
- Be concise but complete

### Tone and Style
- **Be direct and informative**: Tell readers what they'll get from the post
- **Use complete sentences** that end with periods
- **Use sentence case**, same as titles
- **First person is fine**: "I think", "I wrote", "I built" maintains your authentic voice
- **Avoid hype**: No "amazing", "incredible", "must-read" language
- **Be specific**: Reference actual technologies, outcomes, or insights rather than vague descriptions

### Content Patterns

#### Declarative (What the post is)
State what the post covers directly:
- ✅ "Bringing Implementation-First GraphQL to TypeScript via a novel static analysis approach."
- ✅ "Defining a meaningful distinction within code-first GraphQL server libraries."

#### Descriptive (What you did or learned)
Share your experience or findings:
- ✅ "After more than four years, I'm finally happy with how Webamp implements balance."
- ✅ "How my Twitter bot @winampskins works under the hood, how it has evolved over time, and what I've learned from the project."

#### Intriguing (Hook with a surprise or contradiction)
Create curiosity with an unexpected angle:
- ✅ "How to remove code and still increase your library weight."
- ✅ "Defaulting to empty string is a lie we tell our type checker."

#### Observational (Personal insight)
Share a personal perspective or realization:
- ✅ "For some reason SQLite databases feel more 'real' to me."
- ✅ "Thoughts on what I think made the Winamp Skin Museum successful."

### What to Avoid
- ❌ Clickbait: "You won't believe what happened next!"
- ❌ Questions (save those for titles if needed): "Did you know about this GraphQL pattern?"
- ❌ Vague descriptions: "Some thoughts on programming"
- ❌ Marketing speak: "The ultimate guide to...", "Everything you need to know about..."
- ❌ Incomplete sentences or fragments

### Examples

**Good summaries from actual posts:**
```yaml
summary: "Thinking about the React component tree as modeling a state machine can help clarify the implications of asynchronous updates and React's concurrent features."

summary: "Python Context Managers are a great way to model resources with setup and teardown. Here's how to implement that pattern in JavaScript."

summary: "How implementing an ESLint rule led to changes in how people write JavaScript."

summary: "Why I'm perfectly happy to have built something that nobody really uses."
```

**Summaries to improve:**
```yaml
# Too vague
summary: "Some thoughts on GraphQL"

# Better
summary: "Defining a meaningful distinction within code-first GraphQL server libraries."

# Too clickbaity
summary: "This one weird trick will change how you write TypeScript!"

# Better
summary: "Using TypeScript's type system to catch bugs at compile time rather than runtime."

# Incomplete sentence
summary: "Building a Twitter bot and what I learned"

# Better
summary: "How my Twitter bot works under the hood, how it has evolved over time, and what I've learned from the project."
```

## Markdown Formatting

### Links
**Use inline markdown links** for all references:
```markdown
[link text](https://example.com)
```

**Avoid** reference-style links unless you're using the same URL multiple times in the same post.

### Emphasis

#### Italics
Use **single underscores** for italic text:
```markdown
_This is italic text_
```

**Common uses:**
- Book, movie, or product names
- Introducing new terms
- Attribution at the end of posts: `_Thanks to Person Name for feedback._`
- Foreign words or phrases
- Metadata/preamble text: `_Discussed on [Hacker News](...)_`

#### Bold
Use **double asterisks** for bold text:
```markdown
**This is bold text**
```

**Common uses:**
- Emphasizing key points within sentences
- Important concepts or warnings
- Section of text you want to stand out

#### Code
Use **backticks** for inline code:
```markdown
`someFunction()` or `variableName`
```

### Code Blocks

Always specify the language for syntax highlighting:

````markdown
```javascript
const foo = "bar";
```

```typescript
type User = { name: string };
```

```python
def hello():
    return "world"
```
````

**Common language identifiers:**
- `javascript` (preferred over `js`)
- `tsx` (preferred over `typescript` for all TypeScript code)
- `jsx`
- `python`
- `graphql`
- `bash` or `shell`

### Headers

Use `##` (H2) for main section headers within posts. The post title is H1 and should not be repeated in the body.

**Use sentence case** for headers, same as titles:
```markdown
## This is a section header
## Making it fast and cheap
## What's the difference?
```

**Avoid:**
- Using `#` (H1) in post body
- Title case for headers: ~~## This Is A Section Header~~

### Horizontal Rules

Use **three hyphens** for horizontal rules:
```markdown
---
```

**Common uses:**
- Separating preamble/metadata from main content
- Before attribution/acknowledgments at the end of posts
- Between major conceptual sections (use sparingly)

### Lists

#### Unordered Lists
Use **hyphens** for bullet points:
```markdown
- First item
- Second item
- Third item
```

#### Ordered Lists
Use **numbers with periods**:
```markdown
1. First step
2. Second step
3. Third step
```

### Quotes

**Block quotes** - Use for longer quotations (2+ sentences) or when you want to give the quote visual emphasis:
```markdown
> This is a quoted passage from someone else.
> It can span multiple lines.
```

**Inline quotes** - Use for short quotations or phrases within your sentence:
```markdown
As Knuth said, "premature optimization is the root of all evil."
```

**Block Quote Attribution**:

Attribution is required for block quotes unless the quote is your own (e.g., epigrams you've written).

**Standard format** - Place attribution on the line immediately following the quote, using italics with em dash:
```markdown
> Quote text here.

_― Author Name_
```

**With link** - Link the author's name to their canonical online identity (personal homepage, GitHub, Twitter, etc.) **only if the person has not been previously mentioned by name in the post**:
```markdown
> I thought that talk about dynamically creating WebAssembly from a little mini DSL was actually super interesting.

_― [Anders Hejlsberg](https://en.wikipedia.org/wiki/Anders_Hejlsberg)_
```

**Without link** - If the person has already been mentioned and linked earlier in the post, use just their name:
```markdown
> I thought that talk about dynamically creating WebAssembly from a little mini DSL was actually super interesting.

_― Anders Hejlsberg_
```

**In prose** - For quotes that are integrated into discussion, attribution can be in the following paragraph:
```markdown
> If I had more time, I would have written a shorter letter

Which has been attributed to many people in [different variations](http://quoteinvestigator.com/...).
```

**Formatting notes**:
- Use em dash with hyphens (―) before the author name: `_― Author Name_`
- The entire attribution line should be italicized
- Leave a blank line between the quote and the attribution
- For inline quotes, attribute within the sentence: `As Knuth said, "premature optimization is the root of all evil."`

## Post Structure

### Preamble (Optional)
Posts may optionally include italicized metadata at the beginning:

```markdown
_Discussed on [Hacker News](https://news.ycombinator.com/...)._

---
```

Or:

```markdown
_TL;DR: Brief summary of the entire post._

---
```

Always follow preamble with `---` to separate it from the main content.

### Opening
Start posts directly with the topic. No need for "Hello readers" or similar pleasantries.

### Attribution and Thanks (Optional)
When thanking contributors or providing attribution, place at the end after `---`.

**Always link to the person's canonical online identity:**
- Prefer personal homepage/website if they have one
- Otherwise, link to GitHub profile, social media (Twitter/Threads), or professional profile
- Use the platform where they're most active and identifiable

```markdown
---

_Thanks to [Person Name](https://their-website.com) for feedback on early drafts._
```

**Multiple contributors:**
```markdown
---

_Thanks to [Person One](https://example.com), [Person Two](https://github.com/person), and [Person Three](https://twitter.com/person) for their contributions._
```

### Updates (Optional)
For significant updates to published posts, add them with the update clearly marked.

**Placement guidance:**

**At the top** (in preamble, after any existing metadata) - Use when:
- The update is critical context for understanding the post (e.g., "This project has been deprecated")
- The information has fundamentally changed (e.g., major breaking changes)
- Readers need to know this immediately before reading the rest

```markdown
_Update, Nov 23, 2022: This API has been deprecated. See [new version](link) instead._

---
```

**At the end** (after `---`) - Use when:
- Adding follow-up information or related content
- Sharing how ideas evolved or were received
- Linking to related work that came later
- The update supplements but doesn't contradict the original

```markdown
---

_Update Oct. 2024_: Erik Wrede's 2024 GraphQL conf talk expands upon the ideas in this post: [link]
```

**Inline** - Use when:
- Correcting a specific factual error in context
- Adding a small clarification to a specific section

## Custom Components

### YouTube Embeds
```markdown
::youtube{token=videoId}
```

### Audio Players
```markdown
::audio{src=/path/to/audio.mp3}
```

### Tweets (Legacy)
```markdown
::tweet{status=tweetId}
```

## Content Conventions

### Em Dashes
Use em dashes (—) for parenthetical thoughts or breaks in thought. In markdown, these should be actual em dash characters, not double hyphens:
```markdown
This is a sentence — and here's a related thought — that continues.
```

### Numbers
- Spell out numbers one through nine
- Use numerals for 10 and above
- Use numerals for technical values, measurements, and statistics
- Use commas for thousands: "65,000 skins" not "65000 skins"

### Abbreviations
- Spell out abbreviations on first use, followed by the abbreviation in parentheses: "Content Delivery Network (CDN)"
- Use the abbreviation for subsequent references
- Exception: Well-known abbreviations (API, UI, URL, etc.) don't need to be spelled out

### Code and Technical Terms
- Use `backticks` for all code elements, function names, variable names, file names, and command-line tools
- Capitalize product names correctly: "TypeScript", "JavaScript", "GraphQL", "React", "Python"
- Use proper casing for file extensions: `.js`, `.ts`, `.md`

### URLs and Paths
- Display URLs as links with descriptive text: [Grats website](https://grats.capt.dev/)
- Use backticks for file paths in text: `src/components/Header.tsx`
- Use backticks for command-line commands: `npm install`

## Grammar and Punctuation

### Oxford Comma
**Always use** the Oxford comma in lists:
- ✅ "apples, oranges, and bananas"
- ❌ "apples, oranges and bananas"

### Contractions
Use contractions naturally to maintain a conversational tone:
- "it's" not "it is"
- "don't" not "do not"
- "you're" not "you are"

### Possessives
For singular possessives of words ending in 's', add apostrophe-s:
- "Anders's idea"
- "TypeScript's compiler"

### Quotation Marks
- Use "double quotes" for actual quotations
- Use backticks for code elements, not quotes
- Place periods and commas inside quotation marks (American style)

## Frontmatter Conventions

### Required Fields
```yaml
title: "Post title in sentence case"
summary: "Brief description of the post"
tags: ["tag1", "tag2", "tag3"]
```

### Optional Fields
```yaml
summary_image: /path/to/image.png
github_comments_issue_id: 123
canonical_url: https://other-site.com/post
youtube_slug: videoId
notion_id: uuid-here
```

### Tag Style
- Use lowercase for tags: `javascript`, not `JavaScript`
- Use camelCase for multi-word tags: `staticAnalysis`, not `static-analysis` or `static_analysis`
- Common tags: `javascript`, `typescript`, `react`, `graphql`, `opinion`, `project`, `talk`, `note`, `winamp`, `eslint`, `staticAnalysis`, `implementationFirst`

## Images

### Image References
```markdown
![Alt text describing the image](/path/to/image.png)
```

### Image Captions
Place caption text immediately after the image on a new line, or use a standard paragraph.

### Alt Text
Always provide descriptive alt text for accessibility.

## Consistency Checklist

Before publishing, verify:
- [ ] Title uses sentence case (except proper nouns and acronyms)
- [ ] No period at end of title
- [ ] Summary is 1-2 sentences with complete sentences ending in periods
- [ ] Summary is direct and informative (no hype or clickbait)
- [ ] Code blocks have language specified
- [ ] Links use inline markdown format
- [ ] Italics use single underscores
- [ ] Bold uses double asterisks
- [ ] Headers use sentence case
- [ ] Horizontal rules use three hyphens `---`
- [ ] Oxford commas in all lists
- [ ] Contractions used naturally
- [ ] Product names capitalized correctly
- [ ] Em dashes are actual em dash characters (—)
- [ ] Tags in frontmatter use lowercase/camelCase

---

_This style guide is a living document. Update it as new patterns emerge or conventions evolve._
