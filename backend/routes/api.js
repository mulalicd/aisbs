const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { executeRAG: generate } = require('../rag/index');
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
   * GET /api/search-index
   * Return the search index for client-side search
   */
  router.get('/search-index', (req, res) => {
    try {
      const indexPath = path.join(__dirname, '../../data/searchIndex.json');
      if (fs.existsSync(indexPath)) {
        const indexData = fs.readFileSync(indexPath, 'utf8');
        res.json(JSON.parse(indexData));
      } else {
        res.status(404).json({ message: 'Search index not found. Please run the build script.' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/chapters
   * List all chapters
   */
  router.get('/chapters', (req, res) => {
    const chapters = ustav.chapters.map((ch) => ({
      id: ch.id || `ch${ch.number}`,
      number: ch.number,
      title: ch.title,
      intro: ch.intro || '',
      problemCount: (ch.problems || []).length,
    }));
    res.json(chapters);
  });

  /**
   * GET /api/chapters/:chapterId
   * Get specific chapter with problems
   */
  router.get('/chapters/:chapterId', (req, res) => {
    const { chapterId } = req.params;
    // Handle both id-based and number-based lookups
    let chapter = ustav.chapters.find((ch) => ch.id === chapterId);
    if (!chapter && /^ch\d+$/.test(chapterId)) {
      const num = parseInt(chapterId.substring(2), 10);
      chapter = ustav.chapters.find((ch) => ch.number === num);
    }
    if (!chapter) {
      const num = parseInt(chapterId, 10);
      chapter = ustav.chapters.find((ch) => ch.number === num);
    }

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    res.json({
      ...chapter,
      id: chapter.id || `ch${chapter.number}`,
      problems: (chapter.problems || []).map((p) => ({
        id: p.id || `${chapter.number}.${p.number}`,
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
      // Handle both id-based and number-based chapter lookups
      let chapter = ustav.chapters.find((ch) => ch.id === chapterId);
      if (!chapter && /^ch\d+$/.test(chapterId)) {
        const num = parseInt(chapterId.substring(2), 10);
        chapter = ustav.chapters.find((ch) => ch.number === num);
      }
      if (!chapter) {
        const num = parseInt(chapterId, 10);
        chapter = ustav.chapters.find((ch) => ch.number === num);
      }

      if (!chapter) {
        return res.status(404).json({ error: 'Chapter not found' });
      }

      // Find problem by id or by construct from chapter.problemNumber
      let problem = (chapter.problems || []).find((p) => p.id === problemId);
      if (!problem && /^\d+\.\d+$/.test(problemId)) {
        // Try numeric format like "1.1"
        problem = (chapter.problems || []).find((p) => p.id === problemId);
      }

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Handle both old structure (object sections) and new structure (array sections)
      let sectionContent = '';
      if (Array.isArray(problem.sections) && problem.sections.length > 0) {
        // New parser format: sections is array, combine all text
        sectionContent = problem.sections.map((s) => s.content || '').join('\n\n');
      } else if (typeof problem.sections === 'object' && problem.sections) {
        // Old format: sections as object, extract content
        sectionContent = Object.values(problem.sections).filter((v) => v).join('\n\n');
      }

      // Helper: wrap string as object if needed
      const wrapSection = (value) => {
        if (!value) return null;
        if (typeof value === 'string') return { content: value };
        if (typeof value === 'object' && !Array.isArray(value)) return value;
        return null;
      };

      // Map data fields to expected frontend fields
      const s = problem.sections || {};

      const safeProblem = {
        id: problem.id,
        number: problem.number,
        title: problem.title || 'Untitled Problem',
        sections: {
          operationalReality: wrapSection(s.operationalReality),
          whyTraditionalFails: wrapSection(s.whyTraditionalFails || s.whyTraditionalMethodsFail),
          managerDecisionPoint: wrapSection(s.managerDecisionPoint),
          aiWorkflow: wrapSection(s.aiWorkflow),
          executionPrompt: wrapSection(s.executionPrompt),
          businessCase: wrapSection(s.businessCase),
          industryContext: wrapSection(s.industryContext)
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
   * GET /api/admin/reparse
   * EMERGENCY: Trigger re-parsing of MD to JSON
   */
  router.get('/admin/reparse', (req, res) => {
    try {
      const parserPath = path.join(__dirname, '../scripts/fullParser.js');

      // Step 1: Run the parser
      delete require.cache[require.resolve(parserPath)];
      require(parserPath);

      // Step 2: HOT RELOAD the server's ustav data
      const ustavPath = path.join(__dirname, '../../data/ustav.json');
      const ustavData = fs.readFileSync(ustavPath, 'utf-8');
      const newUstav = JSON.parse(ustavData);

      // Update the reference held by the closure
      Object.assign(ustav, newUstav);

      // Step 3: Invalidate the RAG system cache
      const { reloadUSTAV } = require('../rag/retrieval');
      reloadUSTAV();

      res.json({
        message: 'Reparsing triggered and all caches hot-reloaded successfully',
        metadata: ustav.metadata,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Reparse error:', err);
      res.status(500).json({ error: err.message, stack: err.stack });
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
