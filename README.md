# mcp-dati-it

dati.gov.it MCP — Italy's national open-data portal (CKAN API).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_datasets` | Search the dati.gov.it catalogue of Italian public-administration open data (CKAN package_search). Returns matching datasets with titles/descriptions (mostly Italian). Query may be Italian or English; Italian matches far more. |
| `dataset_details` | Full dataset record by id or slug (CKAN package_show), including its resources. Each resource carries a "url" you can fetch directly to download the data (CSV/JSON/etc.) — this portal has no datastore, so there is no row-level query API. |
| `list_organizations` | List the publishing organizations (ministries, regions, comuni, health agencies, etc.) on dati.gov.it (CKAN organization_list). Returns organization slugs; pass one to organization_details for the full record. |
| `organization_details` | Full record for one publishing organization by slug or id (CKAN organization_show): Italian display name, description, and dataset count. Get the slug from list_organizations or a dataset record. |
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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
