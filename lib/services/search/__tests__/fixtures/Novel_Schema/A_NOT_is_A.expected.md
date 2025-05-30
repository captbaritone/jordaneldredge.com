# Input: `A NOT is:A`

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
LEFT JOIN content ON content.rowid = content_fts.rowid
WHERE (content_fts MATCH ('{text}: ' || (:param0)) AND NOT content.text = 'A')
ORDER BY RANK ASC, text
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
  "type": "not",
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
    "type": "prefix",
    "prefix": "is",
    "value": "A",
    "loc": {
      "start": 9,
      "end": 10
    }
  },
  "loc": {
    "start": 0,
    "end": 10
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
    "kind": "NOT",
    "loc": {
      "start": 2,
      "end": 5
    }
  },
  {
    "kind": "prefix",
    "value": "is",
    "loc": {
      "start": 6,
      "end": 9
    }
  },
  {
    "kind": "text",
    "value": "A",
    "loc": {
      "start": 9,
      "end": 10
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 10,
      "end": 10
    }
  }
]
```