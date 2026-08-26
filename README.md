# mcp-dati-it

dati.gov.it MCP — Italy's national open-data portal (CKAN API).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/dati-it/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Dati It data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
