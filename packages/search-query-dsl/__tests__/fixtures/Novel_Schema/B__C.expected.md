# Input: `B -C`

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
WHERE (content_fts MATCH ('{text}: ' || (:param0)) AND NOT (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{text}: ' || :param1))))
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
    "type": "unary",
    "prefix": "-",
    "expression": {
      "type": "text",
      "value": "C",
      "loc": {
        "start": 3,
        "end": 4
      },
      "isEof": true
    },
    "loc": {
      "start": 2,
      "end": 4
    }
  },
  "loc": {
    "start": 0,
    "end": 4
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
    "kind": "-",
    "loc": {
      "start": 2,
      "end": 3
    }
  },
  {
    "kind": "text",
    "value": "C",
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