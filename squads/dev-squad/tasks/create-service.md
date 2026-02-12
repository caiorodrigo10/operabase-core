# Create Service Task

> **Squad:** dev-squad
> **Skill:** @dev
> **Command:** `*create-service`

## Purpose

Create a new service using standardized templates. Generates consistent TypeScript service structures with proper configuration, testing, and documentation.

---

## Task Definition

```yaml
task: createService
skill: "@dev"
squad: dev-squad
responsible: Dex (Developer)
elicit: true

inputs:
  - field: service_name
    type: string
    required: true
    pattern: "^[a-z][a-z0-9-]*$"
    validation: Must be kebab-case, start with letter

  - field: service_type
    type: enum
    options: ["api-integration", "utility", "agent-tool"]
    required: true
    default: "utility"

  - field: has_auth
    type: boolean
    required: false
    default: false

  - field: description
    type: string
    required: true
    validation: Non-empty, max 200 characters

  - field: env_vars
    type: array
    required: false
    default: []

outputs:
  - field: service_directory
    type: directory
    location: "services/{service_name}/"

  - field: files_created
    type: array
```

---

## Interactive Elicitation Process

### Step 1: Service Name
```
What is the service name?
(Use kebab-case, e.g., "github-api", "file-processor", "auth-helper")
```

### Step 2: Service Type
```
What type of service is this?
1. api-integration - External API client with rate limiting and auth
2. utility - Internal helper/utility service
3. agent-tool - Tool for agents
```

### Step 3: Authentication
```
Does this service require authentication? (Yes/No)
```

### Step 4: Description
```
Brief description of the service (max 200 characters):
```

### Step 5: Environment Variables
```
What environment variables does this service need?
(Enter comma-separated list, or 'none')
```

---

## Implementation Steps

1. **Validate Inputs** - Check name format and uniqueness
2. **Load Templates** - Load service template files
3. **Prepare Context** - Build template context with naming conventions
4. **Generate Files** - Create all service files from templates
5. **Post-Generation** - Install dependencies, build, run tests

---

## Generated Files

```
{service_name}/
  README.md
  index.ts
  types.ts
  errors.ts
  client.ts (if api-integration)
  package.json
  tsconfig.json
  jest.config.js
  __tests__/index.test.ts
```

---

## Error Handling

| Error | Resolution |
|-------|------------|
| Service name exists | Prompt for different name |
| Template not found | Error with clear message |
| npm install fails | Warning, continue without deps |
| Build fails | Warning, show errors, continue |
| Invalid name format | Re-prompt with validation error |

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - service-generation
  - scaffolding
  - typescript
```
