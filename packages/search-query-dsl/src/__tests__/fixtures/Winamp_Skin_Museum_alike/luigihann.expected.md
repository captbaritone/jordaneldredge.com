# Input: `luigihann`

# Warnings

None

# Results
```json
[
  null
]
```

# Query

```sql
SELECT skins.* FROM skin_search
LEFT JOIN skins ON skins.md5 = skin_search.skin_md5
WHERE skin_search MATCH ('{skin_md5 file_names readme_text}: ' || (:param0 || ' *'))
ORDER BY RANK ASC, skin_md5
```

# Params

```json
{
  "param0": "\"luigihann\""
}
```

# AST

```json
{
  "type": "text",
  "value": "luigihann",
  "loc": {
    "start": 0,
    "end": 9
  },
  "isEof": true
}
```

# Tokens
```json
[
  {
    "kind": "text",
    "value": "luigihann",
    "loc": {
      "start": 0,
      "end": 9
    }
  },
  {
    "kind": "eof",
    "loc": {
      "start": 9,
      "end": 9
    }
  }
]
```