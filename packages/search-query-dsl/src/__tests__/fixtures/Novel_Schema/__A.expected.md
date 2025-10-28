# Input: `--A`

# Warnings

None

# Results
```json
[
  "A",
  "A B",
  "A B C"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.id = content_fts.rowid
WHERE NOT (NOT (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{text}: ' || :param0))))
ORDER BY text
```

# Params

```json
{
  "param0": "\"A\""
}
```

# AST

```json
{
  "type": "unary",
  "prefix": "-",
  "expression": {
    "type": "unary",
    "prefix": "-",
    "expression": {
      "type": "text",
      "value": "A",
      "loc": {
        "start": 2,
        "end": 3
      },
      "isEof": true
    },
    "loc": {
      "start": 1,
      "end": 3
    }
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
    "kind": "-",
    "loc": {
      "start": 0,
      "end": 1
    }
  },
  {
    "kind": "-",
    "loc": {
      "start": 1,
      "end": 2
    }
  },
  {
    "kind": "text",
    "value": "A",
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