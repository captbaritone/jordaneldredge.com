# Input: `(A NOT (C OR is:A))`

# Warnings

None

# Results
```json
[
  "A B"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.id = content_fts.rowid
WHERE (content_fts MATCH ('{text}: ' || (:param0)) AND NOT (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{text}: ' || :param1)) OR content.text = 'A'))
ORDER BY RANK ASC, text
```

# Params

```json
{
  "param0": "\"A\"",
  "param1": "\"C\""
}
```

# AST

```json
{
  "type": "not",
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
    "type": "or",
    "left": {
      "type": "text",
      "value": "C",
      "loc": {
        "start": 8,
        "end": 9
      },
      "isEof": false
    },
    "right": {
      "type": "prefix",
      "prefix": "is",
      "value": "A",
      "loc": {
        "start": 13,
        "end": 17
      }
    },
    "loc": {
      "start": 8,
      "end": 17
    }
  },
  "loc": {
    "start": 1,
    "end": 17
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
    "kind": "NOT",
    "loc": {
      "start": 3,
      "end": 6
    }
  },
  {
    "kind": "(",
    "loc": {
      "start": 7,
      "end": 8
    }
  },
  {
    "kind": "text",
    "value": "C",
    "loc": {
      "start": 8,
      "end": 9
    }
  },
  {
    "kind": "OR",
    "loc": {
      "start": 10,
      "end": 12
    }
  },
  {
    "kind": "prefix",
    "value": "is",
    "loc": {
      "start": 13,
      "end": 16
    }
  },
  {
    "kind": "text",
    "value": "A",
    "loc": {
      "start": 16,
      "end": 17
    }
  },
  {
    "kind": ")",
    "loc": {
      "start": 17,
      "end": 18
    }
  },
  {
    "kind": ")",
    "loc": {
      "start": 18,
      "end": 19
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 19,
      "end": 19
    }
  }
]
```