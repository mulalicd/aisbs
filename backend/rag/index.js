/**
 * RAG Orchestrator - Complete Pipeline Integration
 * Coordinates retrieval, augmentation, and generation
 */

const { retrieve, validatePrompt, getPromptsByProblem, getIndex } = require('./retrieval');
const { augment, validateUserData, getInputInstructions } = require('./augmentation');
const { generate } = require('./generation');

/**
 * Execute complete RAG pipeline
 * @param {string} query - Prompt ID or search query
 * @param {Object} userData - User input data
 * @param {string} mode - 'mock' or 'llm'
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object>} - Complete RAG response
 */
async function executeRAG(query, userData, mode = 'mock', options = {}) {
  const executionStart = Date.now();

  try {
    console.log(`[RAG] Starting execution for query: ${query}`);

    // STEP 1: Retrieve
    console.log(`[RAG] Step 1/3: Retrieving prompt...`);
    const retrieval = retrieve(query);
    const { prompt, context } = retrieval;
    console.log(`[RAG]   ✓ Retrieved: ${prompt.title}`);

    // STEP 2: Augment
    console.log(`[RAG] Step 2/3: Augmenting prompt with user data...`);
    const augmentedPrompt = augment(prompt, userData);
    console.log(`[RAG]   ✓ Augmented (${augmentedPrompt.length} chars)`);

    // STEP 3: Generate
    console.log(`[RAG] Step 3/3: Generating output in ${mode} mode...`);
    const output = await generate(augmentedPrompt, prompt, mode, options);
    console.log(`[RAG]   ✓ Generation complete`);

    // Return complete response
    return {
      success: true,
      query,
      mode,
      executionTime: Date.now() - executionStart + 'ms',
      context: {
        chapter: context.chapter.title,
        problem: context.problem.title,
        prompt: prompt.title,
        path: context.path
      },
      metadata: {
        promptId: prompt.id,
        promptVersion: prompt.version,
        severity: prompt.severity,
        role: prompt.role
      },
      ...output
    };

  } catch (error) {
    console.error('[RAG] Execution failed:', error.message);
    return {
      success: false,
      query,
      mode,
      error: error.message,
      executionTime: Date.now() - executionStart + 'ms',
      errorType: error.constructor.name,
      suggestions: generateErrorSuggestions(error.message)
    };
  }
}

/**
 * Validate a prompt before execution
 */
function validatePromptForExecution(promptId) {
  return validatePrompt(promptId);
}

/**
 * Get input requirements for a prompt
 */
function getPromptInputRequirements(promptId) {
  try {
    const { prompt } = retrieve(promptId);
    return {
      promptId: prompt.id,
      title: prompt.title,
      inputs: getInputInstructions(prompt),
      validation: validatePrompt(promptId)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List all available prompts (for navigation)
 */
function listAllPrompts() {
  return getIndex();
}

/**
 * Get prompts for a specific problem
 */
function getProblemPrompts(chapterNum, problemNum) {
  try {
    const result = getPromptsByProblem(chapterNum, problemNum);
    return {
      success: true,
      prompts: result.prompts.map(p => ({
        id: p.id,
        title: p.title,
        version: p.version,
        severity: p.severity,
        inputCount: Object.keys(p.inputSchema || {}).length,
        promptability: p.promptability || 0
      })),
      problem: {
        id: result.problem.id,
        title: result.problem.title,
        description: result.problem.sections?.operationalReality?.substring(0, 200) || ''
      },
      chapter: {
        id: result.chapter.id,
        title: result.chapter.title
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Search for prompts by keyword
 */
function searchPrompts(keyword) {
  try {
    const result = retrieve(keyword);
    return {
      success: true,
      found: true,
      prompt: {
        id: result.prompt.id,
        title: result.prompt.title,
        severity: result.prompt.severity,
        inputCount: Object.keys(result.prompt.inputSchema || {}).length
      },
      context: result.context,
      searchScore: result.searchScore || null
    };
  } catch (error) {
    return {
      success: false,
      found: false,
      error: error.message,
      keyword
    };
  }
}

/**
 * Generate suggestions for common errors
 */
function generateErrorSuggestions(errorMessage) {
  const suggestions = [];

  if (errorMessage.includes('not found')) {
    suggestions.push('Check the prompt ID format (should be like ch1_p1_pr1)');
    suggestions.push('Try using a keyword search instead');
    suggestions.push('Browse available prompts using /api/prompts/index');
  }

  if (errorMessage.includes('Invalid user data')) {
    suggestions.push('Ensure all required inputs are provided');
    suggestions.push('Check that columns match the schema requirements');
    suggestions.push('Verify data format (CSV has commas, proper headers)');
  }

  if (errorMessage.includes('database not available')) {
    suggestions.push('USTAV data file may be missing or corrupted');
    suggestions.push('Ensure data/ustav.json exists in project root');
    suggestions.push('Check file permissions and JSON syntax');
  }

  if (errorMessage.includes('API key')) {
    suggestions.push('Set appropriate environment variable for your LLM provider');
    suggestions.push('Use mock mode for testing without API keys');
  }

  return suggestions;
}

/**
 * Get execution statistics (for monitoring)
 */
function getExecutionStats() {
  return {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    totalPrompts: getIndex().metadata.totalPrompts,
    totalProblems: getIndex().metadata.totalProblems,
    totalChapters: getIndex().metadata.totalChapters
  };
}

module.exports = {
  // Main pipeline
  executeRAG,
  
  // Utilities
  validatePromptForExecution,
  getPromptInputRequirements,
  listAllPrompts,
  getProblemPrompts,
  searchPrompts,
  getExecutionStats,
  generateErrorSuggestions
};
