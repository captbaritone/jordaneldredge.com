# Input: `a (`

# Warnings

a (
  ^
- Unexpected end of input after ( at 3:3

# Results
```json
[]
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
  "param0": "\"a\"",
  "param1": "\"(\""
}
```

# AST

```json
{
  "type": "and",
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
    "type": "text",
    "value": "(",
    "loc": {
      "start": 2,
      "end": 3
    },
    "isEof": true
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
    "kind": "text",
    "value": "a",
    "loc": {
      "start": 0,
      "end": 1
    }
  },
  {
    "kind": "(",
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