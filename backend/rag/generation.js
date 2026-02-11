/**
 * RAG Generation System - Output Generation (Mock or LLM)
 * Produces execution results
 */

/**
 * Generate response (mock or LLM-based)
 * @param {string} augmentedPrompt - Prompt ready for execution
 * @param {Object} promptMetadata - Original prompt object
 * @param {string} mode - 'mock' or 'llm'
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object>} - Generated output
 */
async function generate(augmentedPrompt, promptMetadata, mode = 'mock', options = {}) {
  const startTime = Date.now();

  try {
    if (mode === 'mock') {
      return generateMock(promptMetadata, startTime);
    } else if (mode === 'llm') {
      return await generateLLM(augmentedPrompt, promptMetadata, startTime, options);
    } else {
      throw new Error(`Invalid generation mode: ${mode}. Use 'mock' or 'llm'.`);
    }
  } catch (error) {
    // Return error response
    return {
      success: false,
      mode,
      timestamp: new Date().toISOString(),
      promptId: promptMetadata.id,
      error: error.message,
      metadata: {
        executionTime: Date.now() - startTime + 'ms',
        status: 'FAILED'
      }
    };
  }
}

/**
 * Generate mock output from prompt metadata
 */
function generateMock(promptMetadata, startTime) {
  return {
    success: true,
    mode: 'mock',
    timestamp: new Date().toISOString(),
    promptId: promptMetadata.id,
    output: promptMetadata.mockOutput || {
      message: 'Mock output generated',
      status: 'success',
      executedAt: new Date().toISOString(),
      data: {}
    },
    metadata: {
      executionTime: (Date.now() - startTime) + 'ms',
      model: 'Mock Deterministic Generator',
      status: 'SUCCESS'
    }
  };
}

/**
 * Generate using LLM API
 */
async function generateLLM(augmentedPrompt, promptMetadata, startTime, options = {}) {
  const apiProvider = options.provider || process.env.LLM_PROVIDER || 'anthropic';
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(`No API key provided for ${apiProvider}. Set ${apiProvider.toUpperCase()}_API_KEY environment variable.`);
  }

  let response;
  let model;

  try {
    if (apiProvider === 'anthropic') {
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey });

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: augmentedPrompt
        }]
      });

      response = message.content[0].type === 'text' ? message.content[0].text : '';
      model = 'claude-3-5-sonnet';

    } else if (apiProvider === 'openai') {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{
          role: 'user',
          content: augmentedPrompt
        }],
        max_tokens: 4096,
        temperature: 0.7
      });

      response = completion.choices[0].message.content;
      model = 'gpt-4-turbo';

    } else if (apiProvider === 'ollama') {
      // Local Ollama for development/testing
      const fetch = require('node-fetch');
      
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.model || 'neural-chat',
          prompt: augmentedPrompt,
          stream: false
        })
      });

      const data = await res.json();
      response = data.response;
      model = options.model || 'neural-chat';

    } else {
      throw new Error(`Unsupported LLM provider: ${apiProvider}`);
    }

    // Parse structured output if possible
    let parsedOutput;
    try {
      // Look for JSON blocks
      const jsonMatch = response.match(/```json\n([\s\S]+?)\n```/);
      if (jsonMatch) {
        parsedOutput = JSON.parse(jsonMatch[1]);
      } else {
        parsedOutput = { rawText: response };
      }
    } catch (e) {
      parsedOutput = { rawText: response };
    }

    return {
      success: true,
      mode: 'llm',
      timestamp: new Date().toISOString(),
      promptId: promptMetadata.id,
      output: parsedOutput,
      metadata: {
        executionTime: (Date.now() - startTime) + 'ms',
        model,
        provider: apiProvider,
        status: 'SUCCESS',
        tokenEstimate: Math.ceil(response.split(/\s+/).length / 0.75) // Rough estimation
      }
    };

  } catch (error) {
    console.error('[RAG] LLM generation failed:', error.message);
    
    // Fallback to mock for demo purposes
    if (options.fallbackToMock) {
      console.log('[RAG] Falling back to mock mode');
      return generateMock(promptMetadata, startTime);
    }

    throw error;
  }
}

/**
 * Validate LLM response structure
 */
function validateResponse(response) {
  const issues = [];

  if (!response.output) {
    issues.push('Response missing output field');
  }

  if (!response.timestamp) {
    issues.push('Response missing timestamp');
  }

  if (!response.metadata) {
    issues.push('Response missing metadata');
  } else {
    if (!response.metadata.executionTime) {
      issues.push('Metadata missing executionTime');
    }
    if (!response.metadata.model) {
      issues.push('Metadata missing model information');
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Compare mock vs LLM output structure
 */
function compareOutputFormats(mockOutput, llmOutput) {
  const comparison = {
    mockKeys: Object.keys(mockOutput),
    llmKeys: Object.keys(llmOutput),
    matching: [],
    missingInLLM: [],
    extraInLLM: []
  };

  // Check for matching keys
  comparison.mockKeys.forEach(key => {
    if (comparison.llmKeys.includes(key)) {
      comparison.matching.push(key);
    } else {
      comparison.missingInLLM.push(key);
    }
  });

  // Check for extra keys
  comparison.llmKeys.forEach(key => {
    if (!comparison.mockKeys.includes(key)) {
      comparison.extraInLLM.push(key);
    }
  });

  return comparison;
}

/**
 * Generate execution summary for UI display
 */
function generateExecutionSummary(response) {
  return {
    status: response.success ? 'SUCCESS' : 'FAILED',
    mode: response.mode,
    promptId: response.promptId,
    executedAt: response.timestamp,
    executionTime: response.metadata?.executionTime || 'Unknown',
    model: response.metadata?.model || 'Unknown',
    errorMessage: response.error || null,
    outputPreview: truncateOutput(response.output, 200)
  };
}

/**
 * Truncate output for preview
 */
function truncateOutput(output, maxLength = 200) {
  if (!output) return '(No output)';

  let text;
  if (typeof output === 'string') {
    text = output;
  } else if (typeof output === 'object') {
    text = JSON.stringify(output, null, 2);
  } else {
    text = String(output);
  }

  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '... (truncated)';
  }

  return text;
}

module.exports = {
  generate,
  generateMock,
  generateLLM,
  validateResponse,
  compareOutputFormats,
  generateExecutionSummary
};
