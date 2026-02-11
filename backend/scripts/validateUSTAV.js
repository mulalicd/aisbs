#!/usr/bin/env node

/**
 * USTAV JSON Validator
 * Validates the structure and completeness of the ustav.json file
 * 
 * Usage: node validateUSTAV.js [path/to/ustav.json]
 */

const fs = require('fs');
const path = require('path');

// Default path
const USTAV_PATH = process.argv[2] || path.join(__dirname, '../../data/ustav.json');

/**
 * Validator Class
 */
class USTAVValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = null;
    this.errors = [];
    this.warnings = [];
    this.stats = {
      chapters: 0,
      problems: 0,
      prompts: 0,
      failureModes: 0,
      fileSize: 0
    };
  }

  /**
   * Main validation
   */
  validate() {
    console.log('\n' + '='.repeat(70));
    console.log('USTAV JSON STRUCTURE VALIDATOR');
    console.log('='.repeat(70));

    // Step 1: Load file
    if (!this.loadFile()) {
      return false;
    }

    // Step 2: Validate structure
    if (!this.validateStructure()) {
      return false;
    }

    // Step 3: Validate content
    if (!this.validateContent()) {
      return false;
    }

    // Step 4: Report
    this.report();

    return this.errors.length === 0;
  }

  /**
   * Load and parse JSON file
   */
  loadFile() {
    console.log(`\n[VALIDATOR] Loading ${this.filePath}...`);
    try {
      const rawData = fs.readFileSync(this.filePath, 'utf-8');
      this.stats.fileSize = (rawData.length / 1024).toFixed(2);
      
      this.data = JSON.parse(rawData);
      console.log(`[VALIDATOR] ✓ JSON parsed successfully (${this.stats.fileSize} KB)`);
      return true;
    } catch (error) {
      console.error(`[VALIDATOR] ✗ Failed to load: ${error.message}`);
      this.errors.push(`File load error: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate overall structure
   */
  validateStructure() {
    console.log('\n[VALIDATOR] Validating structure...');

    // Check metadata
    if (!this.data.metadata) {
      this.errors.push('Missing metadata object');
      return false;
    }

    const required = ['title', 'version', 'totalChapters'];
    for (const field of required) {
      if (!this.data.metadata[field]) {
        this.errors.push(`Missing metadata.${field}`);
      }
    }

    // Check chapters array
    if (!Array.isArray(this.data.chapters)) {
      this.errors.push('chapters must be an array');
      return false;
    }

    if (this.data.chapters.length === 0) {
      this.errors.push('chapters array is empty');
      return false;
    }

    this.stats.chapters = this.data.chapters.length;
    console.log(`[VALIDATOR] ✓ Metadata valid`);
    console.log(`[VALIDATOR] ✓ Found ${this.stats.chapters} chapter(s)`);

    return true;
  }

  /**
   * Validate content completeness
   */
  validateContent() {
    console.log('\n[VALIDATOR] Validating content...');

    for (let chIdx = 0; chIdx < this.data.chapters.length; chIdx++) {
      const chapter = this.data.chapters[chIdx];

      // Check chapter fields
      const chapterFields = ['id', 'number', 'title', 'problems'];
      for (const field of chapterFields) {
        if (!chapter[field]) {
          this.errors.push(`Chapter ${chIdx}: Missing ${field}`);
        }
      }

      // Check problems
      if (!Array.isArray(chapter.problems)) {
        this.errors.push(`Chapter ${chIdx}: problems must be array`);
        continue;
      }

      this.stats.problems += chapter.problems.length;

      for (let pIdx = 0; pIdx < chapter.problems.length; pIdx++) {
        const problem = chapter.problems[pIdx];

        // Check problem fields
        const problemFields = ['id', 'number', 'title'];
        for (const field of problemFields) {
          if (!problem[field]) {
            this.errors.push(`Chapter ${chIdx}, Problem ${pIdx}: Missing ${field}`);
          }
        }

        // Check prompts
        if (Array.isArray(problem.prompts)) {
          this.stats.prompts += problem.prompts.length;

          for (let prIdx = 0; prIdx < problem.prompts.length; prIdx++) {
            const prompt = problem.prompts[prIdx];
            if (!prompt.id) {
              this.errors.push(`Ch${chIdx}/P${pIdx}/Pr${prIdx}: Missing promptId`);
            }
            if (!prompt.inputSchema) {
              this.warnings.push(`Ch${chIdx}/P${pIdx}/Pr${prIdx}: No inputSchema`);
            }
          }
        }

        // Check failure modes
        if (Array.isArray(problem.failureModes)) {
          this.stats.failureModes += problem.failureModes.length;

          for (let fmIdx = 0; fmIdx < problem.failureModes.length; fmIdx++) {
            const fm = problem.failureModes[fmIdx];
            if (typeof fm === 'object' && !fm.id) {
              this.warnings.push(`Ch${chIdx}/P${pIdx}/FM${fmIdx}: No failureModeId`);
            }
          }
        }
      }
    }

    console.log(`[VALIDATOR] ✓ Content validation complete`);
    console.log(`[VALIDATOR]   - Problems: ${this.stats.problems}`);
    console.log(`[VALIDATOR]   - Prompts: ${this.stats.prompts}`);
    console.log(`[VALIDATOR]   - Failure Modes: ${this.stats.failureModes}`);

    return true;
  }

  /**
   * Generate validation report
   */
  report() {
    console.log('\n' + '='.repeat(70));
    console.log('VALIDATION REPORT');
    console.log('='.repeat(70));

    // Summary
    console.log(`\nFile: ${this.filePath}`);
    console.log(`Size: ${this.stats.fileSize} KB`);
    console.log(`Chapters: ${this.stats.chapters}`);
    console.log(`Problems: ${this.stats.problems}`);
    console.log(`Prompts: ${this.stats.prompts}`);
    console.log(`Failure Modes: ${this.stats.failureModes}`);

    // Errors
    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.errors.length}):`);
      for (const error of this.errors) {
        console.log(`   - ${error}`);
      }
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      for (const warning of this.warnings) {
        console.log(`   - ${warning}`);
      }
    }

    // Result
    console.log('\n' + '='.repeat(70));
    if (this.errors.length === 0) {
      console.log('✓ VALIDATION PASSED - JSON is valid and complete');
      console.log('Ready for production use');
    } else {
      console.log('✗ VALIDATION FAILED - Fix errors before using');
    }
    console.log('='.repeat(70) + '\n');
  }
}

// Run validator
const validator = new USTAVValidator(USTAV_PATH);
const success = validator.validate();
process.exit(success ? 0 : 1);
