Systematic editorial review for the 322-post style guide compliance project.

**Usage modes:**
- **Auto-pick**: Automatically select next highest-priority post
- **Specific**: Review a user-specified file
- **New draft**: Review new content before publishing

Steps:
1. Read EDITORIAL_PROGRESS.md to check current status
2. **If auto-pick**: Select next post by priority (recent first)
3. Read STYLE_GUIDE.md for standards
4. Apply direct edits for style guide violations **one at a time with descriptions**
5. Update EDITORIAL_PROGRESS.md with completion
6. Provide summary of changes

**Selection priority (auto-pick mode):**
1. Recent posts first for highest impact
2. Posts over notes
3. Skip completed posts per EDITORIAL_PROGRESS.md

**Review focus:**
- Apply STYLE_GUIDE.md requirements efficiently
- Keep focused on compliance, not content rewrites
- **For each edit**: Explain which style guide rule is being applied and why
- **Use Edit tool**: Apply one change at a time, not MultiEdit

**Progress tracking:**
- Update EDITORIAL_PROGRESS.md per its usage instructions

**Output format:**
1. **Selected Post**: Filename and description
2. **Changes Made**: List each edit with explanation of which style guide rule was applied
3. **Progress Updated**: New completion statistics
4. **Next Steps**: Suggest continuing or specific next post

**Parameters:**
- Default: Auto-pick next post and continue in loop mode
- Add filename to review specific post: `/editorial-review filename.md`
- Add "new" for new drafts: `/editorial-review new`
- Add "single" for one-time review without looping: `/editorial-review single`

**Loop Mode (Default):**
- Automatically continues to next post after completion
- Shows brief summary and immediately starts next review
- Never pauses to ask if user wants to continue
- User can interrupt at any time to stop the loop

Designed for systematic cleanup of the 322-post editorial backlog.