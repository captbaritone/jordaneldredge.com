# Input: `winamp has:image`

# Query

```sql
SELECT content.* FROM content_fts_2
LEFT JOIN content ON content.rowid = content_fts_2.rowid
WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
AND (content_fts_2 MATCH ('{title content tags summary}: ' || (:param0)) AND EXISTS (SELECT 1 FROM content_images WHERE content_images.content_id = content.id))
ORDER BY RANK ASC, page_rank DESC
```

# Params

```json
{
  "param0": "\"winamp\""
}
```