# Input: `cat OR (dog NOT cute)`

# Warnings

None

# Results
```json
[
  "cats and dogs",
  "cats are cute",
  "cats like to eat hotdogs"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.rowid = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || ((:param0 || 'OR' || (:param1 || 'NOT' || :param2))))
ORDER BY RANK ASC, text
```

# Params

```json
{
  "param0": "\"cat\"",
  "param1": "\"dog\"",
  "param2": "\"cute\""
}
```

# AST

```json
{
  "type": "or",
  "left": {
    "type": "text",
    "value": "cat",
    "loc": {
      "start": 0,
      "end": 3
    },
    "isEof": false
  },
  "right": {
    "type": "not",
    "left": {
      "type": "text",
      "value": "dog",
      "loc": {
        "start": 8,
        "end": 11
      },
      "isEof": false
    },
    "right": {
      "type": "text",
      "value": "cute",
      "loc": {
        "start": 16,
        "end": 20
      },
      "isEof": false
    },
    "loc": {
      "start": 8,
      "end": 20
    }
  },
  "loc": {
    "start": 0,
    "end": 20
  }
}
```

# Tokens
```json
[
  {
    "kind": "text",
    "value": "cat",
    "loc": {
      "start": 0,
      "end": 3
    }
  },
  {
    "kind": "OR",
    "loc": {
      "start": 4,
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
    "value": "dog",
    "loc": {
      "start": 8,
      "end": 11
    }
  },
  {
    "kind": "NOT",
    "loc": {
      "start": 12,
      "end": 15
    }
  },
  {
    "kind": "text",
    "value": "cute",
    "loc": {
      "start": 16,
      "end": 20
    }
  },
  {
    "kind": ")",
    "loc": {
      "start": 20,
      "end": 21
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 21,
      "end": 21
    }
  }
]
```