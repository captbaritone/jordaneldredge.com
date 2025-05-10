# Input: `Hello -has:video`

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.rowid = content_fts.rowid
WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
AND (content_fts MATCH ('{title content tags summary}: ' || :param0 || ' *') AND NOT (EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)))
ORDER BY RANK DESC, page_rank DESC
```

# Params

```json
{
  "param0": "\"Hello\""
}
```