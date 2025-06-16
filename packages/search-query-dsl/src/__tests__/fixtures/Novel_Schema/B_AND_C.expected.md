# Input: `B AND C`

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
LEFT JOIN content ON content.rowid = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || ((:param0 || 'AND' || :param1 || ' *')))
ORDER BY RANK ASC, text
```

# Params

```json
{
  "param0": "\"B\"",
  "param1": "\"C\""
}
```

# AST

```json
{
  "type": "and",
  "left": {
    "type": "text",
    "value": "B",
    "loc": {
      "start": 0,
      "end": 1
    },
    "isEof": false
  },
  "right": {
    "type": "text",
    "value": "C",
    "loc": {
      "start": 6,
      "end": 7
    },
    "isEof": true
  },
  "loc": {
    "start": 0,
    "end": 7
  }
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
    "kind": "AND",
    "loc": {
      "start": 2,
      "end": 5
    }
  },
  {
    "kind": "text",
    "value": "C",
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