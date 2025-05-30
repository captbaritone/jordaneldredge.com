# Input: `B NOT C`

# Warnings

None

# Results
```json
[
  "B",
  "A B"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.rowid = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || ((:param0 || 'NOT' || :param1 || ' *')))
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
  "type": "not",
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
    "kind": "NOT",
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