/**
 * RAG Augmentation System - Template Interpolation & Data Validation
 * Combines prompts with user data
 * Updated: 2026-02-14 - Added defensive type checking
 */

/**
 * Augment prompt template with user data
 * @param {Object} prompt - Prompt object from retrieval
 * @param {Object} userData - User input data keyed by input1, input2, input3, etc
 * @returns {string} - Augmented prompt ready for LLM
 */
/**
 * Augment prompt template with user data
 * @param {Object} prompt - Prompt object from retrieval
 * @param {Object} userData - User input data keyed by input1, input2, input3, etc
 * @param {Object} context - Optional context (chapter, problem)
 * @returns {string} - Augmented prompt ready for LLM
 */
function augment(prompt, userData, context = {}) {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  ⚡ AUGMENTATION STARTED                                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('[Augmentation] Function called');
  console.log('[Augmentation] Received prompt:', prompt ? 'YES' : 'NO');
  console.log('[Augmentation] Received userData:', userData ? 'YES' : 'NO');
  console.log('[Augmentation] Received context:', context ? 'YES' : 'NO');

  console.log('[Augmentation] Starting augmentation');
  console.log('[Augmentation] Prompt received:', {
    hasPrompt: !!prompt,
    promptType: typeof prompt,
    promptKeys: prompt ? Object.keys(prompt) : 'null'
  });
  console.log('[Augmentation] UserData received:', {
    hasUserData: !!userData,
    userDataType: typeof userData,
    userDataKeys: userData ? Object.keys(userData) : 'null'
  });
  console.log('[Augmentation] Context received:', {
    hasContext: !!context,
    contextType: typeof context,
    contextKeys: context ? Object.keys(context) : 'null'
  });

  const safeUserData = userData || {};

  // DEFENSIVE: Validation that prompt is valid
  if (!prompt || typeof prompt !== 'object') {
    console.error('[Augmentation] CRITICAL: Invalid prompt object');
    throw new Error('Invalid prompt object received in augmentation');
  }

  // Step 1: Validate user data against inputSchema
  const validation = validateUserData(safeUserData, prompt.inputSchema);
  if (!validation.valid) {
    throw new Error(`Invalid user data: ${validation.errors.join(', ')}`);
  }

  let augmentedPrompt = prompt.promptCode;

  // Step 2: Interpolate input placeholders
  Object.keys(safeUserData).forEach((inputKey) => {
    // Skip internal keys (starting with _)
    if (inputKey.startsWith('_')) return;
    const placeholders = augmentedPrompt.match(/\[User:\s*Paste Data\]/g);

    if (placeholders && placeholders.length > 0) {
      // Replace first occurrence only (one per input)
      const formattedData = formatDataForPrompt(safeUserData[inputKey]);
      augmentedPrompt = augmentedPrompt.replace(
        /\[User:\s*Paste Data\]/,
        formattedData
      );
    }
  });

  // Step 3: Add metadata header
  const header = buildExecutionContext(prompt, context);

  // Step 4: Append conversational context (if meaningful follow-up)
  if (safeUserData._followUp) {
    let historyStr = '';
    if (Array.isArray(safeUserData._context)) {
      historyStr = safeUserData._context
        .filter(msg => !msg.error && msg.content)
        .map(msg => {
          // Clean content (remove HTML tags for cleaner prompt context)
          const cleanContent = String(msg.content).replace(/<[^>]*>/g, '');
          return `${msg.role.toUpperCase()}: ${cleanContent.substring(0, 1000)}${cleanContent.length > 1000 ? '...' : ''}`;
        })
        .join('\n\n');
    }

    augmentedPrompt += `\n\n=== CONVERSATION HISTORY ===\n${historyStr}\n\n=== NEW USER QUESTION ===\n${safeUserData._followUp}`;
  }

  return header + '\n\n' + augmentedPrompt;
}

/**
 * Build execution context header
 */
function buildExecutionContext(prompt, context = {}) {
  console.log('[DEBUG] ========== buildExecutionContext START ==========');
  console.log('[DEBUG] Step 1: Checking prompt parameter');
  console.log('[DEBUG]   - prompt exists:', !!prompt);
  console.log('[DEBUG]   - prompt type:', typeof prompt);

  try {
    console.log('[DEBUG] Step 2: Attempting to get prompt keys');
    const promptKeys = prompt ? Object.keys(prompt) : [];
    console.log('[DEBUG]   - prompt keys:', promptKeys);

    console.log('[DEBUG] Step 3: Attempting to stringify prompt');
    const promptStr = JSON.stringify(prompt, null, 2);
    console.log('[DEBUG]   - prompt JSON length:', promptStr ? promptStr.length : 0);
    console.log('[DEBUG]   - prompt JSON preview:', promptStr ? promptStr.substring(0, 200) : 'null');

    console.log('[DEBUG] Step 4: Checking context parameter');
    console.log('[DEBUG]   - context exists:', !!context);
    console.log('[DEBUG]   - context type:', typeof context);
    const contextKeys = context ? Object.keys(context) : [];
    console.log('[DEBUG]   - context keys:', contextKeys);

    console.log('[DEBUG] Step 5: Creating safe variables');
    const safePrompt = prompt || {};
    const safeContext = context || {};
    console.log('[DEBUG]   - safePrompt created');
    console.log('[DEBUG]   - safeContext created');

    console.log('[DEBUG] Step 6: Extracting chapter and problem');
    const chapter = safeContext.chapter || {};
    const problem = safeContext.problem || {};
    console.log('[DEBUG]   - chapter extracted');
    console.log('[DEBUG]   - problem extracted');

    console.log('[DEBUG] Step 7: Building header string');
    // SIMPLIFIED: Minimal header without any optional fields
    const header = `=== PROMPT EXECUTION CONTEXT ===
Prompt ID: ${safePrompt.id || 'unknown'}
================================\n\n`;

    console.log('[DEBUG]   - header built successfully');
    console.log('[DEBUG] ========== buildExecutionContext END (SUCCESS) ==========');
    return header;

  } catch (error) {
    console.error('[CRITICAL] ========== buildExecutionContext FAILED ==========');
    console.error('[CRITICAL] Error message:', error.message);
    console.error('[CRITICAL] Error name:', error.name);
    console.error('[CRITICAL] Stack trace:', error.stack);
    console.error('[CRITICAL] Prompt parameter:', prompt);
    console.error('[CRITICAL] Context parameter:', context);
    console.error('[CRITICAL] ========== END ERROR DUMP ==========');

    // Return absolute minimal header
    return `=== PROMPT EXECUTION CONTEXT ===
Prompt ID: ERROR
Error: ${error.message}
================================\n\n`;
  }
}

/**
 * Validate user data against input schema
 * @param {Object} userData - User provided data
 * @param {Object} inputSchema - Schema definition  
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateUserData(userData, inputSchema) {
  const errors = [];

  // If no schema defined, accept all data
  if (!inputSchema || typeof inputSchema !== 'object' || Object.keys(inputSchema).length === 0) {
    return { valid: true, errors: [] };
  }

  // Check if all required inputs are provided
  Object.keys(inputSchema).forEach((inputKey) => {
    const schema = inputSchema[inputKey];
    const data = userData[inputKey];

    if (!data || (typeof data === 'string' && data.trim().length === 0)) {
      errors.push(`Missing required input: ${inputKey} (${schema.name})`);
      return;
    }

    // Validate required columns for CSV/Table inputs
    if (schema.requiredColumns && schema.requiredColumns.length > 0) {
      const dataKeys = extractDataKeys(data);
      const missingColumns = schema.requiredColumns.filter(col =>
        !dataKeys.some(dk => dk.toLowerCase() === col.toLowerCase())
      );

      if (missingColumns.length > 0) {
        errors.push(`Missing columns in ${inputKey}: ${missingColumns.join(', ')}`);
      }
    }

    // Validate format hints
    if (schema.requiredFormat) {
      const formatLower = schema.requiredFormat.toLowerCase();
      const dataLower = (typeof data === 'string' ? data : JSON.stringify(data)).toLowerCase();

      // Basic format checks
      if (formatLower.includes('csv') && !dataLower.includes(',') && data.length > 50) {
        errors.push(`${inputKey} appears not to be CSV format (missing commas)`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Extract column names from data
 */
function extractDataKeys(data) {
  if (Array.isArray(data) && data.length > 0) {
    return Object.keys(data[0]);
  }

  if (typeof data === 'string') {
    // Try to parse headers from CSV
    const lines = data.split('\n');
    if (lines.length > 0) {
      return lines[0].split(',').map(h => h.trim());
    }
  }

  if (typeof data === 'object') {
    return Object.keys(data);
  }

  return [];
}

/**
 * Format user data for inclusion in prompt
 * Handles arrays, objects, CSV strings, plain text
 */
function formatDataForPrompt(data) {
  if (data === null || data === undefined) return '';

  if (Array.isArray(data)) {
    // Convert array of objects to Markdown table
    return formatArrayAsTable(data);
  }

  if (typeof data === 'object') {
    // Convert object to YAML-like format
    return formatObjectAsYAML(data);
  }

  // Plain text - just trim and return
  return String(data).trim();
}

/**
 * Format array of objects as Markdown table
 */
function formatArrayAsTable(data) {
  if (data.length === 0) {
    return '(No data provided)';
  }

  const firstRow = data[0];
  if (typeof firstRow !== 'object') {
    // Array of primitives
    return data.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
  }

  const headers = Object.keys(firstRow);
  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = data.map(row => {
    const values = headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      return String(val).replace(/\|/g, '\\|'); // Escape pipes
    });
    return `| ${values.join(' | ')} |`;
  }).join('\n');

  return `\n${headerRow}\n${separatorRow}\n${dataRows}\n`;
}

/**
 * Format object as YAML-like format  
 */
function formatObjectAsYAML(obj) {
  if (!obj) return '';
  return Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `${key}:\n${formatObjectAsYAML(value).split('\n').map(l => '  ' + l).join('\n')}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');
}

/**
 * Create a test dataset for validation
 */
function createTestData(inputSchema) {
  const testData = {};

  Object.entries(inputSchema).forEach(([key, schema]) => {
    if (schema.example) {
      testData[key] = schema.example;
    } else if (schema.requiredColumns && schema.requiredColumns.length > 0) {
      // Create minimal CSV with headers
      const headers = schema.requiredColumns.join(',');
      const sampleRow = schema.requiredColumns.map(() => '[data]').join(',');
      testData[key] = `${headers}\n${sampleRow}`;
    } else {
      testData[key] = '[Paste your data here]';
    }
  });

  return testData;
}

/**
 * Generate augmentation instructions for the user
 */
function getInputInstructions(prompt) {
  const instructions = [];

  // If no schema, return empty instructions
  if (!prompt.inputSchema || typeof prompt.inputSchema !== 'object') {
    return instructions;
  }

  Object.entries(prompt.inputSchema).forEach(([key, schema]) => {
    instructions.push({
      inputKey: key,
      name: schema.name,
      systemSource: schema.systemSource || 'User Input',
      requiredFormat: schema.requiredFormat || 'Text',
      requiredColumns: schema.requiredColumns || [],
      example: schema.example || null,
      instructions: buildInputInstruction(schema)
    });
  });

  return instructions;
}

/**
 * Build specific instruction for an input
 */
function buildInputInstruction(schema) {
  let instruction = `Provide the ${schema.name}. Format: ${schema.requiredFormat}.`;

  if (schema.requiredColumns && schema.requiredColumns.length > 0) {
    instruction += ` Required columns: ${schema.requiredColumns.join(', ')}.`;
  }

  if (schema.systemSource) {
    instruction += ` Source: ${schema.systemSource}.`;
  }

  if (schema.example) {
    instruction += ` Example: ${schema.example}`;
  }

  return instruction;
}

module.exports = {
  augment,
  validateUserData,
  formatDataForPrompt,
  createTestData,
  getInputInstructions,
  extractDataKeys
};
