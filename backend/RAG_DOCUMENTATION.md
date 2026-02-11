# RAG System Documentation

## Overview
The RAG (Retrieval-Augmentation-Generation) system is a three-stage pipeline that powers the AISBS application. It retrieves business problem prompts, augments them with user data, and generates outputs via mock or LLM-based execution.

## Architecture

### Stage 1: Retrieval (`backend/rag/retrieval.js`)
Fetches prompts from the USTAV database and assembles supporting context.

**Functions:**
- `retrieve(query)` - Main entry point. Accepts prompt ID (e.g., `ch1_p1_pr1`) or keyword
- `getPromptsByProblem(chapterNum, problemNum)` - Get all prompts for a problem
- `getIndex()` - Get navigation structure (all chapters/problems)
- `validatePrompt(promptId)` - Check if prompt is valid

**Error Handling:**
- Throws if prompt not found
- Returns context including chapter, problem, and full prompt object

### Stage 2: Augmentation (`backend/rag/augmentation.js`)
Merges user-supplied data into prompt templates while validating data integrity.

**Functions:**
- `augment(prompt, userData)` - Main augmentation function
- `validateUserData(userData, inputSchema)` - Validates user input against schema
- `formatDataForPrompt(data)` - Formats data (CSV, JSON, text) for LLM consumption
- `getInputInstructions(prompt)` - Generates UI-friendly input instructions

**Validation Rules:**
- All required inputs must be provided
- Required columns must be present in dataset
- Format hints checked (CSV should have commas, etc)

### Stage 3: Generation (`backend/rag/generation.js`)
Produces output in mock or LLM mode with reproducible results.

**Functions:**
- `generate(augmentedPrompt, promptMetadata, mode)` - Main generation function
- `generateMock(promptMetadata)` - Returns mock output from prompt definition
- `generateLLM(augmentedPrompt, metadata, options)` - Calls external LLM API

**Supported Providers:**
- `anthropic` - Claude API (production)
- `openai` - GPT-4 API (production)
- `ollama` - Local inference (development)

### Orchestrator (`backend/rag/index.js`)
Coordinates the three stages and exposes convenience functions.

**Main Function:**
```javascript
const result = await executeRAG(
  'ch1_p1_pr1',           // Prompt ID
  { input1: '...', input2: '...' },  // User data
  'mock',                 // 'mock' or 'llm'
  {}                      // Options
);
```

## API Endpoints

### POST `/api/execute`
Execute a prompt immediately.
```json
{
  "promptId": "ch1_p1_pr1",
  "userData": {
    "input1": "CSV contract data...",
    "input2": "Invoice data...",
    "input3": "Surcharge rules..."
  },
  "mode": "mock"
}
```

**Response:** Prompt output with execution metadata

### GET `/api/prompts/validate/:promptId`
Validate a prompt before execution.

**Response:** `{ valid: boolean, errors: [...], prompt }`

### GET `/api/prompts/:promptId/inputs`
Get input requirements and instructions for a prompt.

**Response:** Array of input specifications with examples

### GET `/api/prompts/search?q=freight`
Search for prompts by keyword.

**Response:** Best matching prompt with context

### GET `/api/prompts/index`
Get complete navigation structure.

**Response:** All chapters, problems, and prompts in tree format

### GET `/api/chapters`
Get list of all chapters.

### GET `/api/chapters/:chapterNum/problems`
Get all problems in a chapter.

### GET `/api/chapters/:chapterNum/problems/:problemNum/prompts`
Get all prompts for a specific problem.

### POST `/api/batch-execute`
Execute multiple prompts in parallel.

### GET `/api/health`
Health check and system status.

## Data Structure

### Prompt Object
```javascript
{
  id: "ch1_p1_pr1",
  title: "Freight Leak Automated Audit",
  version: "1.1.v1",
  role: "Expert Freight Audit Specialist",
  severity: "LOW (8.8/10)",
  promptCode: "# PROMPT 1.1: ...",
  inputSchema: {
    input1: { name: "...", requiredColumns: [...], ... },
    input2: { ... },
    input3: { ... }
  },
  outputRequirements: [ { deliverable, name, priority, format } ],
  mockOutput: { executiveSummary: [...], detailedDispute: [...], ... },
  platformCompatibility: ["ChatGPT", "Claude", ...]
}
```

## Error Handling

### Retrieval Errors
```javascript
// Prompt not found
Error: "Prompt ch1_p1_pr99 not found"

// Invalid ID format
Error: "Invalid prompt ID format: badid"
```

### Augmentation Errors
```javascript
// Missing required input
Error: "Missing required input: input1 (Master Contract Rates)"

// Invalid columns
Error: "Missing columns in input1: Carrier_Name, Base_Rate"
```

### Generation Errors
```javascript
// No API key
Error: "No API key provided for anthropic"

// LLM timeout
Error: "LLM API timeout after 30 seconds"
```

## Usage Examples

### Basic Execution (Mock Mode)
```javascript
const rag = require('./backend/rag/index');

const result = await rag.executeRAG(
  'ch1_p1_pr1',
  {
    input1: 'carrier,rate\nABF,1.5\nXPO,1.6',
    input2: 'invoice_id,amount\nINV001,100\nINV002,150',
    input3: 'Fuel: 18%'
  },
  'mock'
);

console.log(result.output);  // Mock output for demonstration
```

### LLM Mode (Production)
```javascript
const result = await rag.executeRAG(
  'ch1_p1_pr1',
  {input1: '...', input2: '...', input3: '...'},
  'llm',
  {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    fallbackToMock: true
  }
);
```

### Via HTTP API
```bash
curl -X POST http://localhost:5000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "promptId": "ch1_p1_pr1",
    "userData": {
      "input1": "...",
      "input2": "...",
      "input3": "..."
    },
    "mode": "mock"
  }'
```

## Testing

### Unit Tests
```bash
npm test -- tests/rag.test.js
```

### Integration Tests
```bash
npm test -- tests/rag.integration.test.js
```

### Manual Testing
1. Start server: `npm run dev`
2. Test health: `curl http://localhost:5000/api/health`
3. Get prompts: `curl http://localhost:5000/api/prompts/index`
4. Execute: `curl -X POST ... (see example above)`

## Environment Configuration

### Required for Mock Mode
```bash
NODE_ENV=development
PORT=5000
```

### Required for LLM Mode
```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI
OPENAI_API_KEY=sk-...

# Or local Ollama
LLM_PROVIDER=ollama
OLLAMA_MODEL=neural-chat
```

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Retrieve | <1ms | Direct object lookup |
| Augment | 5-50ms | Data formatting |
| Generate (Mock) | <1ms | Returns static output |
| Generate (LLM) | 5-30s | Depends on model & API |

## Future Enhancements

1. **Caching:** Cache prompt results for identical inputs
2. **Streaming:** Support streaming LLM responses
3. **Custom Models:** Fine-tuned models for specific problem domains
4. **Analytics:** Track execution patterns and success rates
5. **Versioning:** Support multiple prompt versions
6. **Feedback Loop:** User feedback on output quality

## Support

For issues or questions:
- Check error messages and suggestions in response
- Review logs in `/logs` directory
- Verify data format matches schema requirements
- Ensure API keys are configured for LLM mode
- Contact team: support@aisbs.local
