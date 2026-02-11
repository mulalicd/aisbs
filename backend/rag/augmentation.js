/**
 * RAG Augmentation System - Template Interpolation & Data Validation
 * Combines prompts with user data
 */

/**
 * Augment prompt template with user data
 * @param {Object} prompt - Prompt object from retrieval
 * @param {Object} userData - User input data keyed by input1, input2, input3, etc
 * @returns {string} - Augmented prompt ready for LLM
 */
function augment(prompt, userData) {
  // Step 1: Validate user data against inputSchema
  const validation = validateUserData(userData, prompt.inputSchema);
  if (!validation.valid) {
    throw new Error(`Invalid user data: ${validation.errors.join(', ')}`);
  }

  let augmentedPrompt = prompt.promptCode;

  // Step 2: Interpolate input placeholders
  Object.keys(userData).forEach((inputKey) => {
    const placeholders = augmentedPrompt.match(/\[User:\s*Paste Data\]/g);
    
    if (placeholders && placeholders.length > 0) {
      // Replace first occurrence only (one per input)
      const formattedData = formatDataForPrompt(userData[inputKey]);
      augmentedPrompt = augmentedPrompt.replace(
        /\[User:\s*Paste Data\]/,
        formattedData
      );
    }
  });

  // Step 3: Add metadata header
  const header = buildExecutionContext(prompt);

  return header + '\n\n' + augmentedPrompt;
}

/**
 * Build execution context header
 */
function buildExecutionContext(prompt) {
  return `=== PROMPT EXECUTION CONTEXT ===
Prompt ID: ${prompt.id}
Title: ${prompt.title}
Version: ${prompt.version}
Role: ${prompt.role}
Severity: ${prompt.severity}
Execution Time: ${new Date().toISOString()}
Platform: User will select (ChatGPT/Claude/Gemini/etc)
================================`;
}

/**
 * Validate user data against input schema
 * @param {Object} userData - User provided data
 * @param {Object} inputSchema - Schema definition  
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateUserData(userData, inputSchema) {
  const errors = [];

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
