# Composio Integration

> Configure Composio for external API integrations in Operabase.

## Overview

Composio unifies external API access (Meta Ads, Google, Notion, Slack, etc.) through MCP servers. When enabled in the Operabase installer, it generates the necessary `.mcp.json` configuration.

## Setup

### 1. Enable during installation

```bash
npx operabase init
# Select "Yes" when asked about Composio
```

### 2. Manual setup

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "composio": {
      "command": "npx",
      "args": ["@composio/mcp@latest"],
      "env": {
        "COMPOSIO_API_KEY": "${COMPOSIO_API_KEY}"
      }
    }
  }
}
```

### 3. Set API key

```bash
export COMPOSIO_API_KEY=your-key-here
```

## Tool Mapping per Squad

Each squad defines which Composio tools it needs in `squads/{squad}/config/composio-tools.yaml`:

```yaml
# Example: squads/media-buying-squad/config/composio-tools.yaml
tools:
  performance-analyst:
    read:
      - META_ADS_GET_INSIGHTS
      - POSTHOG_GET_EVENTS
    write:
      - NOTION_INSERT_ROW_DATABASE

  campaign-executor:
    read:
      - META_ADS_GET_CAMPAIGN
    write:
      - META_ADS_PAUSE_CAMPAIGN
      - META_ADS_UPDATE_CAMPAIGN
    requires_approval: true  # HITL for write operations
```

## Creating Tool Mappings for Your Squad

1. Create `squads/{your-squad}/config/composio-tools.yaml`
2. List tools per agent role
3. Mark `requires_approval: true` for write operations that need human approval
4. Reference Composio documentation for available tool names

## Security

- **Never** commit `COMPOSIO_API_KEY` to git
- Use environment variables or `.env` files
- Write operations should use `requires_approval: true`
- Each agent only sees tools mapped to their role
