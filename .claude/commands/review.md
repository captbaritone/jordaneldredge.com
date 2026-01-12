Review a blog post or note for style guide compliance.

**Usage modes:**
- **Feedback only**: Provide detailed review without editing
- **Edit mode**: Apply fixes directly + explain changes

Steps:
1. Read STYLE_GUIDE.md to understand all standards
2. Read the post file the user specifies
3. **If edit mode**: Apply direct edits for style guide violations
4. Provide comprehensive feedback

**What to review:**
- Complete compliance with STYLE_GUIDE.md (all sections)

**Edit mode guidelines:**
- Apply ONLY changes required by STYLE_GUIDE.md
- Preserve author's authentic voice and content

**Output format:**
1. **Changes Made** (edit mode only): Summary of direct edits applied
2. **Assessment**: Compliance with STYLE_GUIDE.md sections
3. **Remaining Issues**: Items requiring author attention
4. **Strengths**: What works well per style guide

**Parameters:**
- Add "edit" to command for edit mode: `/review edit`
- Default is feedback-only mode