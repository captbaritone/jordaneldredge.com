# Input: `OR`

# Warnings

OR
^~
- Unexpected `OR` token. at 0:2

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
  "param0": "\"OR\""
}
```

# AST

```json
{
  "type": "text",
  "value": "OR",
  "loc": {
    "start": 0,
    "end": 2
  },
  "isEof": true
}
```

# Tokens
```json
[
  {
    "kind": "OR",
    "loc": {
      "start": 0,
      "end": 2
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 2,
      "end": 2
    }
  }
]
```