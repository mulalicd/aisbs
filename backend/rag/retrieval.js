/**
 * RAG Retrieval System - Prompt Lookup & Context Assembly
 * Retrieves prompts and context from USTAV database
 */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

// Load USTAV data
let ustavData = null;

function loadUSTAV() {
  if (ustavData) return ustavData;
  
  const ustavPath = path.join(__dirname, '../../data/ustav.json');
  try {
    const raw = fs.readFileSync(ustavPath, 'utf-8');
    ustavData = JSON.parse(raw);
    console.log('[RAG] USTAV data loaded successfully');
    return ustavData;
  } catch (error) {
    console.error('[RAG] Failed to load USTAV data:', error.message);
    return null;
  }
}

/**
 * Primary retrieval function that handles ID matching or keyword search
 * @param {string} query - Prompt ID (e.g., 'ch1_p1_pr1') or search query
 * @returns {Object} - { prompt, context } object
 */
function retrieve(query) {
  const ustav = loadUSTAV();
  if (!ustav) {
    throw new Error('USTAV database not available');
  }

  // Strategy 1: Direct ID match (e.g., ch1_p1_pr1)
  if (query.match(/^ch\d+_p\d+(_pr\d+)?$/)) {
    return retrieveByPromptId(query, ustav);
  }

  // Strategy 2: Keyword search
  return retrieveByKeyword(query, ustav);
}

/**
 * Retrieve by exact prompt ID
 */
function retrieveByPromptId(promptId, ustav) {
  // Parse ID: ch1_p1_pr1 → chapter 1, problem 1, prompt 1
  const match = promptId.match(/ch(\d+)_p(\d+)(?:_pr(\d+))?/);
  if (!match) {
    throw new Error(`Invalid prompt ID format: ${promptId}`);
  }

  const [, chNum, pNum, prNum] = match;
  const chapterIdx = parseInt(chNum) - 1;
  const problemIdx = parseInt(pNum) - 1;

  // Find chapter
  if (!ustav.chapters || chapterIdx >= ustav.chapters.length) {
    throw new Error(`Chapter ch${chNum} not found`);
  }
  const chapter = ustav.chapters[chapterIdx];

  // Find problem
  if (!chapter.problems || problemIdx >= chapter.problems.length) {
    throw new Error(`Problem ch${chNum}_p${pNum} not found`);
  }
  const problem = chapter.problems[problemIdx];

  // If specific prompt requested
  if (prNum) {
    const promptIdx = parseInt(prNum) - 1;
    if (!problem.prompts || promptIdx >= problem.prompts.length) {
      throw new Error(`Prompt ${promptId} not found`);
    }
    const prompt = problem.prompts[promptIdx];

    return {
      prompt,
      context: {
        chapter,
        problem,
        path: `Chapter ${chNum} > Problem ${pNum} > ${prompt.title}`
      }
    };
  }

  // If no specific prompt, return first prompt of problem
  if (problem.prompts && problem.prompts.length > 0) {
    return {
      prompt: problem.prompts[0],
      context: {
        chapter,
        problem,
        path: `Chapter ${chNum} > Problem ${pNum} > ${problem.prompts[0].title}`
      }
    };
  }

  throw new Error(`No prompts found for ${promptId}`);
}

/**
 * Retrieve by keyword search
 */
function retrieveByKeyword(query, ustav) {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  const matches = [];

  // Search across all chapters and problems
  ustav.chapters.forEach((chapter, chIdx) => {
    chapter.problems.forEach((problem, pIdx) => {
      // Search in problem title and description
      const searchText = `${chapter.title} ${problem.title} ${problem.sections?.operationalReality || ''}`.toLowerCase();
      const score = keywords.reduce((acc, keyword) => {
        return acc + (searchText.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > 0 && problem.prompts && problem.prompts.length > 0) {
        matches.push({
          score,
          prompt: problem.prompts[0],
          problem,
          chapter,
          chapterIdx: chIdx + 1,
          problemIdx: pIdx + 1,
          contextPath: `Chapter ${chIdx + 1} > Problem ${pIdx + 1}`
        });
      }
    });
  });

  if (matches.length === 0) {
    throw new Error(`No prompts found matching: "${query}"`);
  }

  // Return best match
  const bestMatch = _.maxBy(matches, 'score');

  return {
    prompt: bestMatch.prompt,
    context: {
      chapter: bestMatch.chapter,
      problem: bestMatch.problem,
      path: bestMatch.contextPath
    },
    searchScore: bestMatch.score
  };
}

/**
 * Get all prompts from a specific problem
 */
function getPromptsByProblem(chapterNum, problemNum) {
  const ustav = loadUSTAV();
  if (!ustav) throw new Error('USTAV database not available');

  const chapter = ustav.chapters[chapterNum - 1];
  if (!chapter) throw new Error(`Chapter ${chapterNum} not found`);

  const problem = chapter.problems[problemNum - 1];
  if (!problem) throw new Error(`Problem ${chapterNum}.${problemNum} not found`);

  return {
    prompts: problem.prompts || [],
    problem,
    chapter
  };
}

/**
 * Get all chapters and their problems (index/navigation)
 */
function getIndex() {
  const ustav = loadUSTAV();
  if (!ustav) throw new Error('USTAV database not available');

  return {
    metadata: ustav.metadata,
    chapters: ustav.chapters.map(ch => ({
      id: ch.id,
      number: ch.number,
      title: ch.title,
      problemCount: (ch.problems || []).length,
      problems: (ch.problems || []).map(p => ({
        id: p.id,
        number: p.number,
        title: p.title,
        promptCount: (p.prompts || []).length
      }))
    }))
  };
}

/**
 * Validate error conditions for prompt execution
 */
function validatePrompt(promptId) {
  try {
    const { prompt } = retrieve(promptId);

    const errors = [];

    // Check prompt code exists and isn't empty
    if (!prompt.promptCode || prompt.promptCode.trim().length === 0) {
      errors.push({
        field: 'promptCode',
        message: 'Prompt code is missing or empty'
      });
    }

    // Check input schema exists
    if (!prompt.inputSchema || Object.keys(prompt.inputSchema).length === 0) {
      errors.push({
        field: 'inputSchema',
        message: 'Input schema not defined'
      });
    }

    // Check output requirements
    if (!prompt.outputRequirements || prompt.outputRequirements.length === 0) {
      errors.push({
        field: 'outputRequirements',
        message: 'Output requirements not specified'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      prompt: prompt,
      message: errors.length === 0 ? 'Prompt is valid' : `Found ${errors.length} validation errors`
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{ message: error.message }],
      message: `Prompt not found: ${error.message}`
    };
  }
}

module.exports = {
  retrieve,
  retrieveByPromptId,
  getPromptsByProblem,
  getIndex,
  validatePrompt,
  loadUSTAV
};
