# Input: `a OR -b`

# Warnings

None

# Results
```json
[
  "A",
  "A B",
  "A B C",
  "C"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.id = content_fts.rowid
WHERE (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{text}: ' || :param0)) OR NOT (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{text}: ' || :param1))))
ORDER BY text
```

# Params

```json
{
  "param0": "\"a\"",
  "param1": "\"b\""
}
```

# AST

```json
{
  "type": "or",
  "left": {
    "type": "text",
    "value": "a",
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
      "value": "b",
      "loc": {
        "start": 6,
        "end": 7
      },
      "isEof": true
    },
    "loc": {
      "start": 5,
      "end": 7
    }
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
    "value": "a",
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
    "kind": "-",
    "loc": {
      "start": 5,
      "end": 6
    }
  },
  {
    "kind": "text",
    "value": "b",
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