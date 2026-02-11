const express = require('express');
const multer = require('multer');
const { generate } = require('../rag/index');
const { buildPromptSchemas, validateInput } = require('../validation/schemas');

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const createApiRoutes = (ustav) => {
  const router = express.Router();

  // Build validation schemas
  const promptSchemas = buildPromptSchemas(ustav);

  /**
   * GET /api/ustav
   * Return full USTAV data
   */
  router.get('/ustav', (req, res) => {
    res.json(ustav);
  });

  /**
   * GET /api/chapters
   * List all chapters
   */
  router.get('/chapters', (req, res) => {
    const chapters = ustav.chapters.map((ch) => ({
      id: ch.id,
      number: ch.number,
      title: ch.title,
      intro: ch.intro,
      problemCount: ch.problems.length,
    }));
    res.json(chapters);
  });

  /**
   * GET /api/chapters/:chapterId
   * Get specific chapter with problems
   */
  router.get('/chapters/:chapterId', (req, res) => {
    const { chapterId } = req.params;
    const chapter = ustav.chapters.find((ch) => ch.id === chapterId);

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    res.json({
      ...chapter,
      problems: chapter.problems.map((p) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        promptCount: Array.isArray(p.prompts) ? p.prompts.length : 0,
      })),
    });
  });

  /**
   * GET /api/chapters/:chapterId/problems/:problemId
   * Get specific problem with full details
   */
  router.get('/chapters/:chapterId/problems/:problemId', (req, res) => {
    try {
      const { chapterId, problemId } = req.params;
      const chapter = ustav.chapters.find((ch) => ch.id === chapterId);

      if (!chapter) {
        return res.status(404).json({ error: 'Chapter not found' });
      }

      const problem = chapter.problems.find((p) => p.id === problemId);

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Ensure all required fields exist with defaults
      const safeProblem = {
        id: problem.id,
        number: problem.number,
        title: problem.title || 'Untitled Problem',
        sections: {
          operationalReality: problem.sections?.operationalReality || null,
          whyTraditionalFails: problem.sections?.whyTraditionalFails || null,
          managerDecisionPoint: problem.sections?.managerDecisionPoint || null,
          aiWorkflow: problem.sections?.aiWorkflow || null,
          executionPrompt: problem.sections?.executionPrompt || null,
          businessCase: problem.sections?.businessCase || null,
          industryContext: problem.sections?.industryContext || null,
          failureModes: problem.sections?.failureModes || null
        },
        prompts: Array.isArray(problem.prompts) ? problem.prompts : [],
        businessCase: problem.businessCase || {},
        failureModes: Array.isArray(problem.failureModes) ? problem.failureModes : []
      };

      console.log(`[API] Returning problem ${problemId}:`, {
        promptsCount: safeProblem.prompts.length,
        failureModesCount: safeProblem.failureModes.length,
        hasBusinessCase: Object.keys(safeProblem.businessCase).length > 0
      });

      res.json(safeProblem);

    } catch (error) {
      console.error('[API] Error fetching problem:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

  /**
   * POST /api/execute
   * Execute RAG simulation for a prompt
   */
  router.post('/execute', async (req, res) => {
    const { promptId, userData, mode } = req.body;

    if (!promptId) {
      return res.status(400).json({ message: 'promptId required' });
    }

    try {
      // Validate input against prompt schema
      const { valid, error, value } = validateInput(promptId, userData || {}, promptSchemas);

      if (!valid) {
        return res.status(422).json({
          message: 'Input validation failed',
          details: error,
        });
      }

      // Execute RAG generation
      const result = await generate(promptId, value, mode || 'mock', ustav);

      res.json(result);
    } catch (err) {
      console.error('Execution error:', err);
      res.status(400).json({
        message: err.message || 'Execution failed',
      });
    }
  });

  /**
   * POST /api/validate-upload
   * Validate file upload against prompt schema
   */
  router.post('/validate-upload', upload.single('file'), (req, res) => {
    const { promptId } = req.body;

    if (!promptId || !req.file) {
      return res.status(400).json({ message: 'promptId and file required' });
    }

    try {
      // Parse uploaded file (CSV/JSON)
      let data = {};
      const fileContent = req.file.buffer.toString('utf-8');

      if (req.file.mimetype === 'application/json') {
        data = JSON.parse(fileContent);
      } else if (req.file.mimetype === 'text/csv') {
        // Simple CSV parsing (can be enhanced)
        const lines = fileContent.trim().split('\n');
        const headers = lines[0].split(',');
        const row = lines[1]?.split(',');
        if (row) {
          headers.forEach((h, i) => {
            data[h.trim()] = row[i]?.trim();
          });
        }
      } else {
        return res.status(415).json({ message: 'Unsupported file type (use JSON or CSV)' });
      }

      // Validate against schema
      const { valid, error, value } = validateInput(promptId, data, promptSchemas);

      if (!valid) {
        return res.status(422).json({
          message: 'File validation failed',
          details: error,
        });
      }

      res.json({
        valid: true,
        message: 'File validation passed',
        data: value,
      });
    } catch (err) {
      console.error('File validation error:', err);
      res.status(400).json({
        message: `File parsing error: ${err.message}`,
      });
    }
  });

  /**
   * Health check
   */
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      chapters: ustav.chapters.length,
      problems: ustav.chapters.reduce((sum, ch) => sum + ch.problems.length, 0),
    });
  });

  return router;
};

module.exports = createApiRoutes;
