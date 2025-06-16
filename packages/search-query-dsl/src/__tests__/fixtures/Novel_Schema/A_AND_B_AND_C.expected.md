# Input: `A AND B AND C`

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
WHERE content_fts MATCH ('{text}: ' || (((:param0 || 'AND' || :param1) || 'AND' || :param2 || ' *')))
ORDER BY RANK ASC, text
```

# Params

```json
{
  "param0": "\"A\"",
  "param1": "\"B\"",
  "param2": "\"C\""
}
```

# AST

```json
{
  "type": "and",
  "left": {
    "type": "and",
    "left": {
      "type": "text",
      "value": "A",
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
        "start": 6,
        "end": 7
      },
      "isEof": false
    },
    "loc": {
      "start": 0,
      "end": 7
    }
  },
  "right": {
    "type": "text",
    "value": "C",
    "loc": {
      "start": 12,
      "end": 13
    },
    "isEof": true
  },
  "loc": {
    "start": 0,
    "end": 13
  }
}
```

# Tokens
```json
[
  {
    "kind": "text",
    "value": "A",
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
    "value": "B",
    "loc": {
      "start": 6,
      "end": 7
    }
  },
  {
    "kind": "AND",
    "loc": {
      "start": 8,
      "end": 11
    }
  },
  {
    "kind": "text",
    "value": "C",
    "loc": {
      "start": 12,
      "end": 13
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 13,
      "end": 13
    }
  }
]
```