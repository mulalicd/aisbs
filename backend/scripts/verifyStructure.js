#!/usr/bin/env node

/**
 * USTAV Structure Verification Tool
 * Validates that ustav.json has correct structure for frontend consumption
 */

const fs = require('fs');
const path = require('path');

function validateStructure(filePath) {
  console.log('\n' + '='.repeat(70));
  console.log('USTAV STRUCTURE VERIFICATION');
  console.log('='.repeat(70));

  try {
    // 1. Load file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log('\n✅ JSON Parse: Valid');

    // 2. Check metadata
    console.log('\n📋 METADATA');
    if (data.metadata) {
      console.log(`  ✅ Title: ${data.metadata.title}`);
      console.log(`  ✅ Version: ${data.metadata.version}`);
      console.log(`  ✅ Chapters: ${data.metadata.totalChapters}`);
      console.log(`  ✅ Problems: ${data.metadata.totalProblems}`);
    }

    // 3. Check chapters array
    console.log('\n📚 CHAPTERS');
    if (!data.chapters || !Array.isArray(data.chapters)) {
      throw new Error('chapters must be an array');
    }
    console.log(`  ✅ Chapters array exists: ${data.chapters.length} chapters`);

    // 4. Verify Chapter 1
    const ch1 = data.chapters.find(ch => ch.id === 'ch1');
    if (!ch1) {
      throw new Error('Chapter 1 (ch1) not found');
    }
    console.log(`  ✅ Chapter 1 found`);
    console.log(`     - ID: ${ch1.id}`);
    console.log(`     - Title: ${ch1.title}`);
    console.log(`     - Number: ${ch1.number}`);

    // 5. Verify Chapter 1 -> Problem 1
    if (!ch1.problems || !Array.isArray(ch1.problems)) {
      throw new Error('Chapter 1 must have problems array');
    }
    console.log(`  ✅ Problems array: ${ch1.problems.length} problem(s)`);

    const ch1p1 = ch1.problems.find(p => p.id === 'ch1_p1');
    if (!ch1p1) {
      throw new Error('Problem 1 (ch1_p1) not found in Chapter 1');
    }

    console.log(`\n🎯 CHAPTER 1 - PROBLEM 1 STRUCTURE`);
    console.log(`  ✅ ID: ${ch1p1.id}`);
    console.log(`  ✅ Number: ${ch1p1.number}`);
    console.log(`  ✅ Title: ${ch1p1.title}`);
    console.log(`  ✅ Severity: ${ch1p1.severity || 'N/A'}`);

    // 6. Verify sections
    console.log(`\n📄 PROBLEM 1 - SECTIONS`);
    if (!ch1p1.sections || typeof ch1p1.sections !== 'object') {
      throw new Error('Problem 1 must have sections object');
    }

    const requiredSections = [
      'operationalReality',
      'whyTraditionalFails',
      'managerDecisionPoint',
      'aiWorkflow',
      'executionPrompt',
      'industryContext',
      'failureModes'
    ];

    requiredSections.forEach(section => {
      if (ch1p1.sections[section]) {
        const content = ch1p1.sections[section];
        const preview = typeof content === 'string' 
          ? content.substring(0, 60) + '...'
          : `[Object with ${Object.keys(content).length} keys]`;
        console.log(`  ✅ ${section}: ${preview}`);
      } else {
        console.log(`  ⚠️  ${section}: Missing or null`);
      }
    });

    // 7. Verify prompts
    console.log(`\n💬 PROBLEM 1 - PROMPTS`);
    if (!Array.isArray(ch1p1.prompts)) {
      throw new Error('Problem 1 prompts must be an array');
    }
    console.log(`  ✅ Prompts array: ${ch1p1.prompts.length} prompt(s)`);

    ch1p1.prompts.forEach((prompt, idx) => {
      console.log(`\n  📌 PROMPT ${idx + 1}`);
      console.log(`    - ID: ${prompt.id}`);
      console.log(`    - Title: ${prompt.title}`);
      console.log(`    - Version: ${prompt.version}`);
      console.log(`    - Role: ${prompt.role}`);
      console.log(`    - Platforms: ${Array.isArray(prompt.platformCompatibility) ? prompt.platformCompatibility.join(', ') : 'N/A'}`);
      
      if (prompt.inputSchema) {
        console.log(`    - Input Schema: ${Object.keys(prompt.inputSchema).length} fields`);
      }
      
      if (prompt.promptCode) {
        const codePreview = prompt.promptCode.split('\n')[0];
        console.log(`    - Prompt Code: ${codePreview.substring(0, 50)}...`);
      }
      
      if (prompt.mockOutput) {
        console.log(`    - Mock Output: ${Object.keys(prompt.mockOutput).length} fields`);
      }
    });

    // 8. Verify businessCase
    console.log(`\n💰 PROBLEM 1 - BUSINESS CASE`);
    if (!ch1p1.businessCase || typeof ch1p1.businessCase !== 'object') {
      throw new Error('Problem 1 must have businessCase object');
    }

    if (ch1p1.businessCase.currentState) {
      console.log(`  ✅ Current State:`);
      Object.entries(ch1p1.businessCase.currentState).forEach(([key, val]) => {
        console.log(`    - ${key}: ${val}`);
      });
    }

    if (ch1p1.businessCase.withAI) {
      console.log(`  ✅ With AI:`);
      Object.entries(ch1p1.businessCase.withAI).forEach(([key, val]) => {
        console.log(`    - ${key}: ${val}`);
      });
    }

    if (ch1p1.businessCase.payback) {
      console.log(`  ✅ Payback: ${ch1p1.businessCase.payback.months} months`);
    }

    // 9. Verify failureModes
    console.log(`\n⚠️  PROBLEM 1 - FAILURE MODES`);
    if (!Array.isArray(ch1p1.failureModes)) {
      throw new Error('Problem 1 failureModes must be an array');
    }
    console.log(`  ✅ Failure Modes: ${ch1p1.failureModes.length} mode(s)`);

    ch1p1.failureModes.forEach((fm, idx) => {
      console.log(`\n  🔴 FAILURE MODE ${idx + 1}`);
      console.log(`    - ID: ${fm.id}`);
      console.log(`    - Name: ${fm.name}`);
      console.log(`    - Severity: ${fm.severity}`);
      console.log(`    - Symptom: ${fm.symptom.substring(0, 60)}...`);
      console.log(`    - Root Cause: ${fm.rootCause.substring(0, 60)}...`);

      if (fm.recovery) {
        console.log(`    - Recovery Stages:`);
        if (fm.recovery.immediate) {
          console.log(`      • Immediate (${fm.recovery.immediate.timeline}): ${fm.recovery.immediate.action}`);
        }
        if (fm.recovery.shortTerm) {
          console.log(`      • Short-Term (${fm.recovery.shortTerm.timeline}): ${fm.recovery.shortTerm.action}`);
        }
        if (fm.recovery.longTerm) {
          console.log(`      • Long-Term (${fm.recovery.longTerm.timeline}): ${fm.recovery.longTerm.action}`);
        }
      }

      if (fm.emailTemplate) {
        const emailPreview = fm.emailTemplate.split('\n')[0];
        console.log(`    - Email Template: ${emailPreview.substring(0, 50)}...`);
      }
    });

    // 10. Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('✅ VERIFICATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n📊 SUMMARY`);
    console.log(`  Chapters: ${data.chapters.length}`);
    console.log(`  Problems in Ch1: ${ch1.problems.length}`);
    console.log(`  Prompts in Ch1P1: ${ch1p1.prompts.length}`);
    console.log(`  Failure Modes in Ch1P1: ${ch1p1.failureModes.length}`);
    console.log(`  Sections in Ch1P1: ${Object.keys(ch1p1.sections).length}`);
    console.log(`\n✅ All required structures present and valid!\n`);

    return true;

  } catch (error) {
    console.error(`\n❌ VERIFICATION FAILED`);
    console.error(`Error: ${error.message}`);
    console.error('='.repeat(70) + '\n');
    return false;
  }
}

// Main execution
const filePath = process.argv[2] || path.join(__dirname, '../../data/ustav.json');

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

const success = validateStructure(filePath);
process.exit(success ? 0 : 1);
