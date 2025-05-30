# Input: `C`

# Warnings

None

# Results
```json
[
  "C",
  "A B C"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.rowid = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || (:param0 || ' *'))
ORDER BY RANK ASC, text
```

# Params

```json
{
  "param0": "\"C\""
}
```

# AST

```json
{
  "type": "text",
  "value": "C",
  "loc": {
    "start": 0,
    "end": 1
  },
  "isEof": true
}
```

# Tokens
```json
[
  {
    "kind": "text",
    "value": "C",
    "loc": {
      "start": 0,
      "end": 1
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 1,
      "end": 1
    }
  }
]
```