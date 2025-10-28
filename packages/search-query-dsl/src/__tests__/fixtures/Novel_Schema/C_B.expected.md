# Input: `C B`

# Warnings

None

# Results
```json
[
  "A B C"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.id = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || ((:param0 || 'AND' || :param1 || ' *')))
ORDER BY RANK ASC, text
```

# Params

```json
{
  "param0": "\"C\"",
  "param1": "\"B\""
}
```

# AST

```json
{
  "type": "and",
  "left": {
    "type": "text",
    "value": "C",
    "loc": {
      "start": 0,
      "end": 1
    },
    "isEof": false
  },
  "right": {
    "type": "text",
    "value": "B",
    "loc": {
      "start": 2,
      "end": 3
    },
    "isEof": true
  },
  "loc": {
    "start": 0,
    "end": 3
  }
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
    "kind": "text",
    "value": "B",
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