# Input: `a AND`

# Warnings

a AND
 ^~~
- Unexpected end of input after AND at 2:5

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
  "param0": "\"AND\""
}
```

# AST

```json
{
  "type": "text",
  "value": "AND",
  "loc": {
    "start": 2,
    "end": 5
  },
  "isEof": true
}
```

# Tokens
```json
[
  {
    "kind": "text",
    "value": "a",
    "loc": {
      "start": 0,
      "end": 1
    }
  },
  {
    "kind": "AND",
    "loc": {
      "start": 2,
      "end": 5
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 5,
      "end": 5
    }
  }
]
```