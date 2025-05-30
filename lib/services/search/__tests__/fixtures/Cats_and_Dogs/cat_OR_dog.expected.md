# Input: `cat OR dog`

# Warnings

None

# Results
```json
[
  "cats and dogs",
  "dogs are cute",
  "cats are cute",
  "cats like to eat hotdogs"
]
```

# Query

```sql
SELECT content.* FROM content_fts
LEFT JOIN content ON content.rowid = content_fts.rowid
WHERE content_fts MATCH ('{text}: ' || ((:param0 || 'OR' || :param1 || ' *')))
ORDER BY RANK ASC, text
```

# Params

```json
{
  "param0": "\"cat\"",
  "param1": "\"dog\""
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
    "type": "text",
    "value": "dog",
    "loc": {
      "start": 7,
      "end": 10
    },
    "isEof": true
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
    "kind": "text",
    "value": "dog",
    "loc": {
      "start": 7,
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