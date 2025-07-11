# Input: `(B)`

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
LEFT JOIN content ON content.rowid = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || (:param0))
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
    "start": 1,
    "end": 2
  },
  "isEof": false
}
```

# Tokens
```json
[
  {
    "kind": "(",
    "loc": {
      "start": 0,
      "end": 1
    }
  },
  {
    "kind": "text",
    "value": "B",
    "loc": {
      "start": 1,
      "end": 2
    }
  },
  {
    "kind": ")",
    "loc": {
      "start": 2,
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