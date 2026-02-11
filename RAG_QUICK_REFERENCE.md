# RAG System Quick Reference

## Installation & Startup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

---

## Quick API Reference

### 1. Health Check
```bash
GET /api/health
Response: { status: "ok", uptime: X, service: "RAG Pipeline" }
```

### 2. List All Prompts
```bash
GET /api/prompts/index
Response: { chapters[], metadata }
```

### 3. Search Prompts
```bash
GET /api/prompts/search?q=freight
Response: Best matching prompt with context
```

### 4. Get Prompt Input Requirements
```bash
GET /api/prompts/ch1_p1_pr1/inputs
Response: Input schema with instructions
```

### 5. Validate Prompt
```bash
GET /api/prompts/validate/ch1_p1_pr1
Response: { valid: true/false, errors: [...] }
```

### 6. Execute Prompt
```bash
POST /api/execute
Body: {
  "promptId": "ch1_p1_pr1",
  "userData": { "input1": "...", "input2": "...", "input3": "..." },
  "mode": "mock" | "llm"
}
Response: { success, output, metadata, ... }
```

### 7. Batch Execute
```bash
POST /api/batch-execute
Body: {
  "executions": [
    { "promptId": "...", "userData": {...}, "mode": "mock" },
    { "promptId": "...", "userData": {...}, "mode": "mock" }
  ]
}
```

---

## Code Usage Examples

### JavaScript

```javascript
const rag = require('./backend/rag/index');

// Execute a prompt
const result = await rag.executeRAG(
  'ch1_p1_pr1',
  {
    input1: 'CSV contract data',
    input2: 'Invoice data',
    input3: 'Surcharge rules'
  },
  'mock'
);

console.log(result.output);

// List all available prompts
const index = rag.listAllPrompts();
console.log(index.chapters);

// Search for prompts
const search = rag.searchPrompts('freight audit');
console.log(search.prompt);

// Get problem prompts
const prompts = rag.getProblemPrompts(1, 1);
console.log(prompts.prompts);
```

### cURL

```bash
# Get health
curl http://localhost:5000/api/health

# Search
curl "http://localhost:5000/api/prompts/search?q=freight"

# Execute
curl -X POST http://localhost:5000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "promptId": "ch1_p1_pr1",
    "userData": {
      "input1": "Carrier,Rate\nABF,1.5\nXPO,1.6",
      "input2": "Invoice,Amount\nINV001,100\nINV002,150",
      "input3": "Fuel: 18%"
    },
    "mode": "mock"
  }'
```

---

## Data File Format

### USTAV JSON Structure
```json
{
  "metadata": {
    "title": "AI Solved Business Problems",
    "totalChapters": 1,
    "totalProblems": 5,
    "totalPrompts": 5
  },
  "chapters": [
    {
      "id": "ch1",
      "number": 1,
      "title": "Logistics & Supply Chain",
      "problems": [
        {
          "id": "ch1_p1",
          "number": 1,
          "title": "Problem Title",
          "sections": {
            "operationalReality": "...",
            "whyTraditionalFails": "...",
            "managerDecisionPoint": "...",
            "aiWorkflow": "...",
            "executionPrompt": "...",
            "businessCase": "...",
            "industryContext": "...",
            "failureModes": "..."
          },
          "prompts": [
            {
              "id": "ch1_p1_pr1",
              "title": "Prompt Title",
              "promptCode": "# Full prompt code...",
              "inputSchema": { "input1": {}, "input2": {}, ... },
              "mockOutput": { ... }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue: "Prompt not found"
**Solution:** Check prompt ID format (should be `ch1_p1_pr1`)
```bash
# List all available
curl http://localhost:5000/api/prompts/index
```

### Issue: "Invalid user data"
**Solution:** Ensure all required inputs provided with correct format
```bash
# Check requirements
curl http://localhost:5000/api/prompts/ch1_p1_pr1/inputs
```

### Issue: "USTAV database not available"
**Solution:** Verify `data/ustav.json` exists and is valid JSON
```bash
# Restart server
npm run dev
```

### Issue: LLM timeout
**Solution:** Use mock mode or check API credentials
```javascript
// Fallback to mock
const result = await rag.executeRAG(id, data, 'mock');
```

---

## Environment Variables

```bash
# Development
NODE_ENV=development
PORT=5000

# LLM Integration
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
LLM_PROVIDER=anthropic  # or openai
```

---

## Performance Expectations

| Operation | Typical Time | Notes |
|-----------|-------------|-------|
| Retrieve | <1ms | Direct lookup |
| Validate User Data | <10ms | Schema check |
| Augment | 5-50ms | Data formatting |
| Generate (Mock) | <1ms | Predefined |
| Generate (LLM) | 5-30s | API dependent |
| **Total (Mock)** | <100ms | Fast feedback |
| **Total (LLM)** | 5-35s | Depends on provider |

---

## Monitoring

### Check System Status
```bash
curl http://localhost:5000/api/stats
Response: {
  "timestamp": "2026-02-10T...",
  "uptime": 1234.56,
  "totalPrompts": 5,
  "totalProblems": 5,
  "totalChapters": 1
}
```

### View Logs
```bash
# Server logs appear in console (npm run dev)
# Look for [RAG] prefixed messages
```

---

## Testing Workflow

### 1. Start Server
```bash
npm run dev
```

### 2. Health Check
```bash
curl http://localhost:5000/api/health
# Should see: { status: "ok", ... }
```

### 3. List Chapters
```bash
curl http://localhost:5000/api/chapters
# Should see array of chapters
```

### 4. Execute Sample Prompt
```bash
curl -X POST http://localhost:5000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "promptId": "ch1_p1_pr1",
    "userData": {"input1":"test","input2":"test","input3":"test"},
    "mode": "mock"
  }'
# Should see execution result with output
```

### 5. Try LLM Mode (with API key)
```bash
export ANTHROPIC_API_KEY=sk-ant-...
# Then POST with "mode": "llm"
```

---

## Troubleshooting Checklist

- [ ] Server running on port 5000?
- [ ] USTAV data file exists at `data/ustav.json`?
- [ ] JSON valid? (Check with `npm test`)
- [ ] Using correct prompt ID format?
- [ ] All required inputs provided?
- [ ] Mock mode working before trying LLM?
- [ ] API key set for LLM mode?

---

## Next Steps

1. **Verify Server:** `curl http://localhost:5000/api/health`
2. **Check Data:** `curl http://localhost:5000/api/prompts/index`
3. **Test Execution:** `curl -X POST .../api/execute` (see examples)
4. **Integrate Frontend:** Add React components for prompt selection & execution
5. **Add Chapters:** Use parser scripts to extract Chapters 2-10

---

## Support & Documentation

- **Full Docs:** See `backend/RAG_DOCUMENTATION.md`
- **Completion Report:** See `PHASE_1_2_COMPLETION.md`
- **API Examples:** See above
- **Code:** Check `backend/rag/*.js` files

---

**RAG System Ready for Testing & Integration**  
Generated: February 10, 2026
