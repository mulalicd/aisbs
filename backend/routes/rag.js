/**
 * RAG API Routes - Express endpoints for prompt execution
 * Handles HTTP requests for RAG pipeline
 */

const express = require('express');
const router = express.Router();
const {
  executeRAG,
  validatePromptForExecution,
  getPromptInputRequirements,
  listAllPrompts,
  getProblemPrompts,
  searchPrompts,
  getExecutionStats
} = require('../rag/index');

/**
 * POST /api/execute
 * Execute RAG pipeline
 * Body: { promptId, userData, mode: 'mock'|'llm' }
 */
router.post('/execute', async (req, res) => {
  try {
    const { promptId, userData, mode = 'mock' } = req.body;

    // Validate inputs
    if (!promptId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: promptId'
      });
    }

    if (!userData || typeof userData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid userData'
      });
    }

    if (!['mock', 'llm'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mode. Use "mock" or "llm"'
      });
    }

    // Execute RAG pipeline
    const result = await executeRAG(promptId, userData, mode);

    // Return appropriate status code
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);

  } catch (error) {
    console.error('[API] /execute error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      type: error.constructor.name
    });
  }
});

/**
 * GET /api/prompts/validate/:promptId
 * Validate a prompt before execution
 */
router.get('/prompts/validate/:promptId', (req, res) => {
  try {
    const { promptId } = req.params;
    const validation = validatePromptForExecution(promptId);
    
    const statusCode = validation.valid ? 200 : 400;
    res.status(statusCode).json(validation);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prompts/:promptId/inputs
 * Get input requirements for a prompt
 */
router.get('/prompts/:promptId/inputs', (req, res) => {
  try {
    const { promptId } = req.params;
    const requirements = getPromptInputRequirements(promptId);
    res.status(requirements.error ? 400 : 200).json(requirements);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prompts/search
 * Search for prompts by keyword
 * Query: ?q=keyword
 */
router.get('/prompts/search', (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing search query parameter: q'
      });
    }

    const results = searchPrompts(q);
    res.status(results.success ? 200 : 404).json(results);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/prompts/index
 * Get all chapters and problems (navigation index)
 */
router.get('/prompts/index', (req, res) => {
  try {
    const index = listAllPrompts();
    res.status(200).json(index);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chapters
 * Get all chapters
 */
router.get('/chapters', (req, res) => {
  try {
    const index = listAllPrompts();
    const chapters = index.chapters.map(ch => ({
      id: ch.id,
      number: ch.number,
      title: ch.title,
      problemCount: ch.problemCount
    }));
    res.status(200).json(chapters);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chapters/:chapterNum/problems
 * Get all problems in a chapter
 */
router.get('/chapters/:chapterNum/problems', (req, res) => {
  try {
    const { chapterNum } = req.params;
    const index = listAllPrompts();
    
    const chapter = index.chapters.find(ch => ch.number === parseInt(chapterNum));
    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: `Chapter ${chapterNum} not found`
      });
    }

    res.status(200).json({
      chapter: {
        id: chapter.id,
        number: chapter.number,
        title: chapter.title
      },
      problems: chapter.problems
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chapters/:chapterNum/problems/:problemNum/prompts
 * Get all prompts for a specific problem
 */
router.get('/chapters/:chapterNum/problems/:problemNum/prompts', (req, res) => {
  try {
    const { chapterNum, problemNum } = req.params;
    const result = getProblemPrompts(parseInt(chapterNum), parseInt(problemNum));
    
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/stats
 * Get RAG system statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getExecutionStats();
    res.status(200).json(stats);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/batch-execute
 * Execute multiple prompts (batch mode)
 * Body: { executions: [{ promptId, userData, mode }, ...] }
 */
router.post('/batch-execute', async (req, res) => {
  try {
    const { executions } = req.body;

    if (!Array.isArray(executions) || executions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid executions array'
      });
    }

    // Execute all prompts in parallel
    const results = await Promise.all(
      executions.map(exec =>
        executeRAG(exec.promptId, exec.userData, exec.mode || 'mock')
      )
    );

    // Count successes and failures
    const succeeded = results.filter(r => r.success).length;
    const failed = results.length - succeeded;

    res.status(200).json({
      success: true,
      total: results.length,
      succeeded,
      failed,
      results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  try {
    const stats = getExecutionStats();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'RAG Pipeline',
      databases: {
        ustav: 'loaded'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;
