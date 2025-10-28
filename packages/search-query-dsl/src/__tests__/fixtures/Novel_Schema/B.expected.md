# Input: `B`

# Warnings

None

# Results
```json
[
  "B",
  "A B",
  "A B C"
]
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
  "param0": "\"B\""
}
```

# AST

```json
{
  "type": "text",
  "value": "B",
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
    "value": "B",
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