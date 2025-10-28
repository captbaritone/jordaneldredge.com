# Input: `NOT`

# Warnings

NOT
^~~
- Unexpected `NOT` token. at 0:3

# Results
```json
[]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.id = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || (:param0 || ' *'))
ORDER BY RANK ASC, text
```

# Params

```json
{
  "param0": "\"NOT\""
}
```

# AST

```json
{
  "type": "text",
  "value": "NOT",
  "loc": {
    "start": 0,
    "end": 3
  },
  "isEof": true
}
```

# Tokens
```json
[
  {
    "kind": "NOT",
    "loc": {
      "start": 0,
      "end": 3
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 3,
      "end": 3
    }
  }
]
```