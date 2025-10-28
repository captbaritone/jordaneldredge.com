# Input: `(A) (B)`

# Warnings

None

# Results
```json
[
  "A B",
  "A B C"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.id = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || ((:param0 || 'AND' || :param1)))
ORDER BY RANK ASC, text
```

# Params

```json
{
  "param0": "\"A\"",
  "param1": "\"B\""
}
```

# AST

```json
{
  "type": "and",
  "left": {
    "type": "text",
    "value": "A",
    "loc": {
      "start": 1,
      "end": 2
    },
    "isEof": false
  },
  "right": {
    "type": "text",
    "value": "B",
    "loc": {
      "start": 5,
      "end": 6
    },
    "isEof": false
  },
  "loc": {
    "start": 1,
    "end": 6
  }
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
    "value": "A",
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
    "kind": "(",
    "loc": {
      "start": 4,
      "end": 5
    }
  },
  {
    "kind": "text",
    "value": "B",
    "loc": {
      "start": 5,
      "end": 6
    }
  },
  {
    "kind": ")",
    "loc": {
      "start": 6,
      "end": 7
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 7,
      "end": 7
    }
  }
]
```