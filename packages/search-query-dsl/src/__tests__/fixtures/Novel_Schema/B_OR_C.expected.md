# Input: `B OR C`

# Warnings

None

# Results
```json
[
  "C",
  "A B C",
  "B",
  "A B"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.id = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || ((:param0 || 'OR' || :param1 || ' *')))
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
  "type": "or",
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
      "start": 5,
      "end": 6
    },
    "isEof": true
  },
  "loc": {
    "start": 0,
    "end": 6
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
    "kind": "OR",
    "loc": {
      "start": 2,
      "end": 4
    }
  },
  {
    "kind": "text",
    "value": "C",
    "loc": {
      "start": 5,
      "end": 6
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 6,
      "end": 6
    }
  }
]
```