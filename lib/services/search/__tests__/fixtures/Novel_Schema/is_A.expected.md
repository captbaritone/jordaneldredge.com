# Input: `is:A`

# Warnings

None

# Results
```json
[
  "A"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.rowid = content_fts.rowid
WHERE content.text = 'A'
ORDER BY text
```

# Params

```json
{}
```

# AST

```json
{
  "type": "prefix",
  "prefix": "is",
  "value": "A",
  "loc": {
    "start": 3,
    "end": 4
  }
}
```

# Tokens
```json
[
  {
    "kind": "prefix",
    "value": "is",
    "loc": {
      "start": 0,
      "end": 3
    }
  },
  {
    "kind": "text",
    "value": "A",
    "loc": {
      "start": 3,
      "end": 4
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 4,
      "end": 4
    }
  }
]
```