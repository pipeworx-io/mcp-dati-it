interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * dati.gov.it MCP — Italy's national open-data portal (CKAN API).
 *
 * Auth: none (keyless). Docs: https://docs.ckan.org/en/latest/api/
 *
 * Notes for callers:
 * - This is the catalogue of Italian public administration (pubblica
 *   amministrazione) open data: datasets published by ministries, regions,
 *   provinces, comuni, ASL/ATS health agencies, etc. Metadata (dataset
 *   titles, descriptions, organization display names, group names) is in
 *   ITALIAN (UTF-8). Free-text `query`/`q` arguments may be passed in Italian
 *   or English; Italian matches a much larger subset. Records come back as
 *   UTF-8 JSON — no extra decoding.
 * - This CKAN instance is a metadata/catalogue harvester: it indexes dataset
 *   records and their resource download links, but the CKAN datastore is NOT
 *   enabled (datastore_search is unavailable). To read actual table rows,
 *   fetch the resource `url` returned by dataset_details directly.
 */


const BASE = 'https://www.dati.gov.it/opendata/api/3/action';
const UA = 'pipeworx-mcp-dati-it/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_datasets',
    description:
      'Search the dati.gov.it catalogue of Italian public-administration open data (CKAN package_search). Returns matching datasets with titles/descriptions (mostly Italian). Query may be Italian or English; Italian matches far more.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search terms, Italian or English. e.g. "trasporti", "salute", "bilancio", "health".' },
        fq: { type: 'string', description: 'Solr filter query, e.g. "organization:aci", "tags:turismo", or "res_format:CSV".' },
        rows: { type: 'number', description: 'Max results, 1-1000 (default 25).' },
        start: { type: 'number', description: '0-based offset for paging.' },
        sort: { type: 'string', description: 'Sort spec, e.g. "metadata_modified desc".' },
      },
      required: ['query'],
    },
  },
  {
    name: 'dataset_details',
    description:
      'Full dataset record by id or slug (CKAN package_show), including its resources. Each resource carries a "url" you can fetch directly to download the data (CSV/JSON/etc.) — this portal has no datastore, so there is no row-level query API.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Dataset id (UUID) or slug, e.g. "c9f94b63-f2c0-4e4c-99b1-6d431cde9521".' } },
      required: ['id'],
    },
  },
  {
    name: 'list_organizations',
    description:
      'List the publishing organizations (ministries, regions, comuni, health agencies, etc.) on dati.gov.it (CKAN organization_list). Returns organization slugs; pass one to organization_details for the full record.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'organization_details',
    description:
      'Full record for one publishing organization by slug or id (CKAN organization_show): Italian display name, description, and dataset count. Get the slug from list_organizations or a dataset record.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Organization slug or id, e.g. "aci" or "agenzia-delle-dogane-e-dei-monopoli".' } },
      required: ['id'],
    },
  },
  {
    name: 'list_groups',
    description: 'List thematic groups/categories (Italian themes like Agricoltura, Salute, Trasporti) on dati.gov.it (CKAN group_list, with full fields).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_datasets': {
      const params = new URLSearchParams({
        q: reqStr(args, 'query', '"trasporti" or "health"'),
        rows: String(clamp(args.rows, 25, 1, 1000)),
        start: String(Math.max(0, (args.start as number) ?? 0)),
      });
      if (args.fq) params.set('fq', String(args.fq));
      if (args.sort) params.set('sort', String(args.sort));
      return ckanGet(`/package_search?${params}`);
    }
    case 'dataset_details':
      return ckanGet(`/package_show?id=${encodeURIComponent(reqStr(args, 'id', '"c9f94b63-f2c0-4e4c-99b1-6d431cde9521"'))}`);
    case 'list_organizations':
      // all_fields=true returns HTTP 500 on this instance — plain list only (org slugs).
      return ckanGet(`/organization_list`);
    case 'organization_details':
      return ckanGet(`/organization_show?id=${encodeURIComponent(reqStr(args, 'id', '"aci"'))}`);
    case 'list_groups':
      return ckanGet(`/group_list?all_fields=true`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function ckanGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`dati.gov.it: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  const json = (await res.json()) as { success?: boolean; error?: { message?: string }; result?: unknown };
  if (json.success === false) throw new Error(`dati.gov.it: ${json.error?.message ?? 'request failed'}`);
  return json.result ?? json;
}

function clamp(v: unknown, dflt: number, lo: number, hi: number): number {
  const n = typeof v === 'number' ? v : dflt;
  return Math.min(hi, Math.max(lo, n));
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
