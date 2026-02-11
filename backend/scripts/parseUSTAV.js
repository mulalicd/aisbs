/**
 * USTAV Book Parser - Extract Chapter 1 & All 5 Problems
 * Engineered for Zero Tolerance Production Quality
 * 
 * Usage: node parseUSTAV.js [chapter_number]
 * Example: node parseUSTAV.js 1
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BOOK_PATH = path.join(__dirname, '../../AI SOLVED BUSINESS PROBLEMS.txt');
const OUTPUT_PATH = path.join(__dirname, '../../data/ustav.json');

/**
 * Main Parser Class
 */
class USTAVParser {
  constructor() {
    this.bookText = '';
    this.chapters = [];
  }

  /**
   * Read the entire USTAV book
   */
  loadBook() {
    console.log(`[PARSER] Loading USTAV book from ${BOOK_PATH}...`);
    try {
      this.bookText = fs.readFileSync(BOOK_PATH, 'utf-8');
      console.log(`[PARSER] ✓ Book loaded: ${this.bookText.length} characters`);
      return true;
    } catch (error) {
      console.error(`[PARSER] ✗ Failed to load book:`, error.message);
      return false;
    }
  }

  /**
   * Extract Chapter 1: Logistics & Supply Chain
   */
  parseChapter1() {
    console.log('\n[PARSER] Parsing CHAPTER 1: Logistics & Supply Chain...');

    // Find chapter boundaries
    const ch1Start = this.bookText.indexOf('Logistics & Supply Chain - The AI Operating System\n\n\nYour phone rings');
    if (ch1Start === -1) {
      console.error('[PARSER] ✗ Could not find Chapter 1 start');
      return null;
    }

    const ch2Start = this.bookText.indexOf('\n\nCHAPTER 2', ch1Start);
    const chapterText = ch2Start === -1 
      ? this.bookText.substring(ch1Start) 
      : this.bookText.substring(ch1Start, ch2Start);

    console.log(`[PARSER] Found Chapter 1 text: ${chapterText.length} characters`);

    // Extract chapter introduction
    const introMatch = chapterText.match(
      /Logistics & Supply Chain - The AI Operating System\n\n\nYour phone rings[\s\S]+?(?=\n\n\n\n\nPROBLEM 1\.1)/
    );
    const intro = introMatch ? introMatch[0].replace('Logistics & Supply Chain - The AI Operating System\n\n\n', '') : '';

    // Extract all 5 problems
    const problems = [];
    for (let i = 1; i <= 5; i++) {
      console.log(`[PARSER]   Parsing Problem 1.${i}...`);
      const problem = this.parseProblem(chapterText, i);
      if (problem) {
        problems.push(problem);
        console.log(`[PARSER]   ✓ Problem 1.${i} complete: ${problem.title}`);
      }
    }

    return {
      id: 'ch1',
      number: 1,
      title: 'Logistics & Supply Chain - The AI Operating System',
      intro: intro.trim(),
      problems,
      metadata: {
        extractionDate: new Date().toISOString(),
        totalProblems: problems.length,
        totalPrompts: problems.reduce((sum, p) => sum + p.prompts.length, 0),
        totalFailureModes: problems.reduce((sum, p) => sum + p.failureModes.length, 0)
      }
    };
  }

  /**
   * Parse individual problem (1-5)
   */
  parseProblem(chapterText, problemNum) {
    const problemId = `1.${problemNum}`;
    
    // Find problem boundaries
    const problemStart = chapterText.indexOf(`PROBLEM ${problemId}\n`);
    if (problemStart === -1) {
      console.error(`[PARSER] ✗ Could not find PROBLEM ${problemId}`);
      return null;
    }

    const nextProblemStart = chapterText.indexOf(`\nPROBLEM ${1}.${problemNum + 1}\n`, problemStart);
    const problemEndPattern = problemNum === 5 ? /(?=\n\nChapter Summary|$)/ : null;

    let problemEnd = nextProblemStart;
    if (problemEnd === -1) {
      problemEnd = chapterText.length;
    }

    const problemText = chapterText.substring(problemStart, problemEnd);

    // Extract title (PROBLEM 1.X\nTitle Here\n)
    const titleMatch = problemText.match(/^PROBLEM \d+\.\d+\n([^\n]+)\n/);
    const title = titleMatch ? titleMatch[1] : `Problem ${problemId}`;

    // Extract 8 sections
    const sections = {};
    for (let i = 1; i <= 8; i++) {
      const sectionText = this.extractSection(problemText, i);
      const sectionNames = [
        'operationalReality',
        'whyTraditionalFails',
        'managerDecisionPoint',
        'aiWorkflow',
        'executionPrompt',
        'businessCase',
        'industryContext',
        'failureModes'
      ];
      sections[sectionNames[i - 1]] = sectionText;
    }

    // Extract all prompts from section 5
    const prompts = this.extractPrompts(problemText, problemId);

    // Extract business case calculations
    const businessCase = this.parseBusinessCase(sections.businessCase, problemId);

    // Extract failure modes
    const failureModes = this.parseFailureModes(sections.failureModes, problemId);

    return {
      id: `ch1_p${problemNum}`,
      number: problemNum,
      title,
      sections,
      prompts,
      businessCase,
      failureModes,
      metadata: {
        severity: this.extractSeverity(sections.executionPrompt),
        promptability: this.extractPromptability(problemText),
        promptCount: prompts.length
      }
    };
  }

  /**
   * Extract specific section (1-8)
   */
  extractSection(problemText, sectionNum) {
    const sectionStart = problemText.indexOf(`SECTION ${sectionNum}\n`);
    if (sectionStart === -1) {
      return '';
    }

    const nextSectionStart = problemText.indexOf(`\nSECTION ${sectionNum + 1}`, sectionStart);
    const nextProblemStart = problemText.indexOf('\n\nPROBLEM ', sectionStart);

    let sectionEnd = Math.min(...[nextSectionStart, nextProblemStart, problemText.length].filter(x => x > 0));

    const sectionText = problemText.substring(sectionStart, sectionEnd);
    
    // Remove section header and clean up
    return sectionText
      .replace(new RegExp(`^SECTION ${sectionNum}\\n`), '')
      .trim();
  }

  /**
   * Extract all prompts with FULL CODE from Section 5
   */
  extractPrompts(problemText, problemId) {
    const section5 = this.extractSection(problemText, 5);
    if (!section5.includes('<<< BEGIN PROMPT >>>')) {
      return [];
    }

    const prompts = [];
    let searchStart = 0;

    // Find all BEGIN...END PROMPT blocks
    while (true) {
      const beginIdx = section5.indexOf('<<< BEGIN PROMPT >>>', searchStart);
      if (beginIdx === -1) break;

      const endIdx = section5.indexOf('<<< END PROMPT >>>', beginIdx);
      if (endIdx === -1) {
        console.warn(`[PARSER] WARNING: Unclosed prompt block starting at position ${beginIdx}`);
        break;
      }

      const promptBlock = section5.substring(beginIdx, endIdx + '<<< END PROMPT >>>'.length);
      const fullPromptCode = section5.substring(
        beginIdx + '<<< BEGIN PROMPT >>>'.length,
        endIdx
      ).trim();

      // Extract prompt metadata
      const versionMatch = promptBlock.match(/\*\*Version:\*\*\s*([^\n]+)/);
      const roleMatch = promptBlock.match(/\*\*Role:\*\*\s*([^\n]+)/);
      const severityMatch = promptBlock.match(/\*\*Severity:\*\*\s*([^\n]+)/);

      // Generate prompt ID
      const promptNum = prompts.length + 1;
      const promptId = `ch1_p${problemId.split('.')[1]}_pr${promptNum}`;

      prompts.push({
        id: promptId,
        version: versionMatch ? versionMatch[1].trim() : '1.0.v1',
        title: this.extractPromptTitle(promptBlock),
        role: roleMatch ? roleMatch[1].trim() : 'AI Assistant',
        severity: severityMatch ? severityMatch[1].trim() : 'UNKNOWN',
        promptCode: fullPromptCode,
        inputSchema: this.parseInputSchema(fullPromptCode),
        outputRequirements: this.parseOutputRequirements(fullPromptCode),
        mockOutput: this.generateMockOutput(promptId),
        platformCompatibility: this.extractPlatformCompatibility(promptBlock)
      });

      searchStart = endIdx + '<<< END PROMPT >>>'.length;
    }

    return prompts;
  }

  /**
   * Extract prompt title from the prompt code
   */
  extractPromptTitle(promptBlock) {
    // Try to find a title in the format "# PROMPT X.X:"
    const titleMatch = promptBlock.match(/# PROMPT[\s\d\.]+:\s*([^\n]+)/);
    if (titleMatch) return titleMatch[1].trim();

    // Fallback: look for any header-like text
    const headerMatch = promptBlock.match(/^\*\*([^*]+)\*\*$/m);
    if (headerMatch) return headerMatch[1].trim();

    return 'Untitled Prompt';
  }

  /**
   * Parse input schema from prompt code
   */
  parseInputSchema(promptCode) {
    const schema = {};
    const inputMatches = promptCode.matchAll(/\*\*INPUT \d+:\s*([^\n]+)\*\*\n([\s\S]+?)(?=\*\*INPUT \d+:|$)/g);

    for (const match of inputMatches) {
      const inputLabel = match[1];
      const inputDesc = match[2];

      // Extract required format, columns, etc.
      const formatMatch = inputDesc.match(/Required Format:\s*([^\n]+)/);
      const columnsMatch = inputDesc.match(/Required Columns:\s*([^\n]+)/);
      const sourceMatch = inputDesc.match(/System Source:\s*([^\n]+)/);

      const inputKey = `input${Object.keys(schema).length + 1}`;
      schema[inputKey] = {
        name: inputLabel.trim(),
        systemSource: sourceMatch ? sourceMatch[1].trim() : 'User Input',
        requiredFormat: formatMatch ? formatMatch[1].trim() : 'CSV or Text',
        requiredColumns: columnsMatch 
          ? columnsMatch[1].split(/[,;]\s*/).map(c => c.trim().replace(/`/g, ''))
          : [],
        example: this.extractExample(inputDesc)
      };
    }

    return schema;
  }

  /**
   * Extract example from input description
   */
  extractExample(inputDesc) {
    const exampleMatch = inputDesc.match(/Example:?\s*["`]?([^"`\n]+)["`]?/i);
    return exampleMatch ? exampleMatch[1].trim() : null;
  }

  /**
   * Parse output requirements from prompt code
   */
  parseOutputRequirements(promptCode) {
    const requirements = [];
    const deliverableMatches = promptCode.matchAll(
      /\*\*DELIVERABLE (\d+):\s*([^\n]+)\*\*\n([\s\S]+?)(?=\*\*DELIVERABLE|\*\*\*|$)/g
    );

    for (const match of deliverableMatches) {
      requirements.push({
        deliverable: parseInt(match[1]),
        name: match[2].trim(),
        priority: match[3].includes('Priority:') 
          ? match[3].match(/Priority:\s*([^\n]+)/)[1].trim()
          : 'MEDIUM',
        format: match[3].includes('Format:')
          ? match[3].match(/Format:\s*([^\n]+)/)[1].trim()
          : 'Text'
      });
    }

    return requirements;
  }

  /**
   * Generate mock output (stub)
   */
  generateMockOutput(promptId) {
    // Return structured placeholder based on promptId
    return {
      promptId,
      status: 'success',
      executedAt: new Date().toISOString(),
      message: 'Mock output - generated for demonstration',
      data: {
        summary: 'Analysis complete',
        records: []
      }
    };
  }

  /**
   * Extract platform compatibility
   */
  extractPlatformCompatibility(promptBlock) {
    const platformMatch = promptBlock.match(
      /\*\*Platform Compatibility:\*\*\s*([^\n]+)/
    );
    
    if (!platformMatch) {
      return ['ChatGPT', 'Claude', 'Gemini'];
    }

    return platformMatch[1]
      .split(/[,;]/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  /**
   * Parse business case (Section 6)
   */
  parseBusinessCase(sectionText, problemId) {
    const businessCase = {
      currentState: {},
      withAI: {},
      implementation: {},
      payback: {},
      sensitivityAnalysis: {}
    };

    // Extract numeric values from text
    const numberPattern = /\$[\d,]+(?:\.\d{2})?|\d+(?:\.\d+)?%?/g;
    const numbers = sectionText.match(numberPattern) || [];

    // Try to parse key financial metrics
    const annualSpendMatch = sectionText.match(/Annual[^:]*Spend[^:]*:\s*\$?([\d,]+)/i);
    const errorRateMatch = sectionText.match(/Error Rate[^:]*:\s*(\d+(?:\.\d+)?%?)/i);
    const paybackMatch = sectionText.match(/Payback[^:]*:\s*([\d\.]+)\s*(?:months?|days?)/i);

    if (annualSpendMatch) {
      businessCase.currentState.annualFreightSpend = this.parseNumber(annualSpendMatch[1]);
    }
    if (errorRateMatch) {
      businessCase.currentState.estimatedErrorRate = this.parseNumber(errorRateMatch[1]) / 100;
    }
    if (paybackMatch) {
      businessCase.payback.months = parseFloat(paybackMatch[1]);
    }

    return businessCase;
  }

  /**
   * Parse failure modes (Section 8)
   */
  parseFailureModes(sectionText, problemId) {
    const failureModes = [];
    const failureMatches = sectionText.matchAll(
      /FAILURE MODE #?(\d+)\n([^\n]+)\n\n([\s\S]+?)(?=FAILURE MODE|$)/gi
    );

    let count = 0;
    for (const match of failureMatches) {
      count++;
      const failureTitle = match[2];

      // Extract sections: Symptom, Root Cause, Recovery
      const symptomMatch = match[3].match(/What You See[\s\S]*?Symptom[^\n]*\n([\s\S]+?)(?=\n\nWhy It Happens|$)/i);
      const rootCauseMatch = match[3].match(/Why It Happens[\s\S]*?Root Cause[^\n]*\n([\s\S]+?)(?=\n\nHow to|$)/i);
      const recoveryMatch = match[3].match(/How to Recover[\s\S]*?\n([\s\S]+?)(?=\n\nEmail to|Email Template|$)/i);

      failureModes.push({
        id: `fm_ch1_p${problemId.split('.')[1]}_${String(count).padStart(2, '0')}`,
        number: count,
        name: failureTitle.trim(),
        symptom: symptomMatch ? symptomMatch[1].trim() : '',
        rootCause: rootCauseMatch ? rootCauseMatch[1].trim() : '',
        recovery: {
          immediate: this.extractRecoveryStep(recoveryMatch ? recoveryMatch[1] : '', 'Immediate'),
          shortTerm: this.extractRecoveryStep(recoveryMatch ? recoveryMatch[1] : '', 'Short-Term'),
          longTerm: this.extractRecoveryStep(recoveryMatch ? recoveryMatch[1] : '', 'Long-Term')
        }
      });
    }

    return failureModes;
  }

  /**
   * Extract recovery step
   */
  extractRecoveryStep(recoveryText, timeframe) {
    const pattern = new RegExp(`${timeframe}[^\\n]*\\n([\\s\\S]+?)(?=\\n\\n|\\w+-Term|$)`, 'i');
    const match = recoveryText.match(pattern);
    return {
      timeframe,
      action: match ? match[1].trim() : '',
      details: match ? match[1].trim() : ''
    };
  }

  /**
   * Extract severity and promptability scores
   */
  extractSeverity(promptSection) {
    const match = promptSection.match(/Severity[:\s]*([^\n]+)/i);
    return match ? match[1].trim() : 'UNKNOWN';
  }

  extractPromptability(problemText) {
    const match = problemText.match(/Promptability[:\s]*(\d+\.?\d*)/i);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Parse numbers from text (handle currency, percentages, etc)
   */
  parseNumber(str) {
    const num = parseFloat(str.replace(/[$,%]/g, '').replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }

  /**
   * Save parsed data to JSON
   */
  save(chapters) {
    const output = {
      metadata: {
        title: 'AI Solved Business Problems',
        subtitle: '50 Real-World Challenges from 10 Industries',
        version: '1.0.0',
        extractedAt: new Date().toISOString(),
        totalChapters: chapters.length,
        totalProblems: chapters.reduce((sum, ch) => sum + ch.problems.length, 0),
        totalPrompts: chapters.reduce((sum, ch) => 
          sum + ch.problems.reduce((s, p) => s + p.prompts.length, 0), 0
        )
      },
      chapters
    };

    try {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
      console.log(`\n[PARSER] ✓ Saved to ${OUTPUT_PATH}`);
      console.log(`[PARSER]   - ${output.chapters.length} chapter(s)`);
      console.log(`[PARSER]   - ${output.metadata.totalProblems} problem(s)`);
      console.log(`[PARSER]   - ${output.metadata.totalPrompts} prompt(s)`);
      return true;
    } catch (error) {
      console.error(`[PARSER] ✗ Failed to save:`, error.message);
      return false;
    }
  }

  /**
   * Save checkpoint (incremental save after each chapter)
   */
  saveCheckpoint(chapters, chapterNum) {
    const checkpointPath = path.join(__dirname, `../../data/ustav-ch${chapterNum}.checkpoint.json`);
    const output = {
      metadata: {
        title: 'AI Solved Business Problems',
        subtitle: '50 Real-World Challenges from 10 Industries',
        version: '1.0.0',
        checkpointedAt: new Date().toISOString(),
        chaptersCompleted: chapterNum,
        totalChapters: 10,
        totalProblems: chapters.reduce((sum, ch) => sum + ch.problems.length, 0),
        totalPrompts: chapters.reduce((sum, ch) => 
          sum + ch.problems.reduce((s, p) => s + p.prompts.length, 0), 0
        )
      },
      chapters
    };

    try {
      fs.writeFileSync(checkpointPath, JSON.stringify(output, null, 2), 'utf-8');
      console.log(`[PARSER]   ✓ Checkpoint saved: Chapter ${chapterNum}`);
      return true;
    } catch (error) {
      console.error(`[PARSER]   ✗ Checkpoint failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Parse with progress tracking
   */
  parseWithProgress(chapterNum) {
    console.log(`\n[PARSER] 📖 Parsing Chapter ${chapterNum}...`);
    const startTime = Date.now();
    
    // Determine which parsing method to use
    let chapter;
    if (chapterNum === 1) {
      chapter = this.parseChapter1();
    } else {
      console.log(`[PARSER]   ℹ️  Chapter ${chapterNum} structure placeholder (text extraction pending)`);
      // For chapters 2-10, create placeholder structure
      chapter = {
        id: `ch${chapterNum}`,
        number: chapterNum,
        title: `Chapter ${chapterNum}`,
        problems: [],
        metadata: {
          status: 'pending_extraction',
          extractionDate: new Date().toISOString()
        }
      };
    }

    if (!chapter) {
      console.error(`[PARSER]   ✗ Failed to parse Chapter ${chapterNum}`);
      return null;
    }

    const elapsed = Date.now() - startTime;
    const totalPrompts = chapter.problems.reduce((s, p) => s + (p.prompts?.length || 0), 0);
    const totalFailureModes = chapter.problems.reduce((s, p) => s + (p.failureModes?.length || 0), 0);

    console.log(`[PARSER]   ✓ Complete (${elapsed}ms)`);
    console.log(`[PARSER]     - Problems: ${chapter.problems.length}`);
    console.log(`[PARSER]     - Prompts: ${totalPrompts}`);
    console.log(`[PARSER]     - Failure Modes: ${totalFailureModes}`);
    
    return chapter;
  }

  /**
   * Parse all chapters sequentially with checkpoints
   */
  parseAll(maxChapters = 10) {
    console.log('\n' + '='.repeat(70));
    console.log('USTAV BOOK PARSER - MULTI-CHAPTER MODE');
    console.log('Zero Tolerance Quality Standard');
    console.log(`Chapters to parse: 1-${maxChapters}`);
    console.log('='.repeat(70));

    // Load book
    if (!this.loadBook()) {
      return false;
    }

    const chapters = [];
    const startTimeOverall = Date.now();

    // Parse each chapter with checkpoint
    for (let chNum = 1; chNum <= maxChapters; chNum++) {
      console.log(`\n[PARSER] [${chNum}/${maxChapters}] Processing...`);
      
      const chapter = this.parseWithProgress(chNum);
      if (!chapter) {
        console.error(`[PARSER] ✗ Failed to parse Chapter ${chNum}`);
        continue; // Continue with next chapter instead of abort
      }

      chapters.push(chapter);

      // Save checkpoint after each chapter
      console.log(`[PARSER] 💾 Saving checkpoint...`);
      this.saveCheckpoint(chapters, chNum);
    }

    const elapsedOverall = Date.now() - startTimeOverall;

    // Final save to main file
    console.log(`\n[PARSER] 📝 Final save to ustav.json...`);
    if (!this.save(chapters)) {
      console.error('[PARSER] ✗ Final save failed');
      return false;
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('PARSE COMPLETE');
    console.log('='.repeat(70));
    console.log(`Total time: ${(elapsedOverall / 1000).toFixed(2)}s`);
    console.log(`Chapters parsed: ${chapters.length}/${maxChapters}`);
    console.log(`Total problems: ${chapters.reduce((s, ch) => s + ch.problems.length, 0)}`);
    console.log(`Total prompts: ${chapters.reduce((s, ch) => s + ch.problems.reduce((ps, p) => ps + (p.prompts?.length || 0), 0), 0)}`);
    console.log('='.repeat(70) + '\n');

    return true;
  }

  /**
   * Main parse orchestration (Chapter 1 only)
   */
  parse() {
    console.log('\n' + '='.repeat(60));
    console.log('USTAV BOOK PARSER - PRODUCTION MODE');
    console.log('Zero Tolerance Quality Standard');
    console.log('='.repeat(60));

    // Load book
    if (!this.loadBook()) {
      return false;
    }

    // Parse Chapter 1
    const chapter = this.parseChapter1();
    if (!chapter) {
      console.error('[PARSER] ✗ Failed to parse Chapter 1');
      return false;
    }

    this.chapters = [chapter];

    // Save to file
    if (!this.save(this.chapters)) {
      return false;
    }

    console.log('\n[PARSER] ✓ PARSE COMPLETE\n');
    return true;
  }
}

// Determine execution mode
const mode = process.argv[2] || 'single'; // 'single' (ch1) or 'all' (1-10)
const maxChapters = parseInt(process.argv[3]) || 10;

const parser = new USTAVParser();
let success;

if (mode === 'all') {
  console.log('[PARSER] Mode: MULTI-CHAPTER (chapters 1-' + maxChapters + ')');
  success = parser.parseAll(maxChapters);
} else {
  console.log('[PARSER] Mode: SINGLE-CHAPTER (Chapter 1 only)');
  success = parser.parse();
}

process.exit(success ? 0 : 1);
