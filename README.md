# mcp-dati-it

dati.gov.it MCP — Italy's national open-data portal (CKAN API).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 708+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_groups` | List thematic groups/categories (Italian themes like Agricoltura, Salute, Trasporti) on dati.gov.it (CKAN group_list, with full fields). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "dati-it": {
      "url": "https://gateway.pipeworx.io/dati-it/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 708+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Dati It data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
