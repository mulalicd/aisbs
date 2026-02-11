#!/usr/bin/env node

/**
 * USTAV Metrics Generator
 * Analyze and report on USTAV database content
 * 
 * Usage:
 *   node metrics.js                           # Report on data/ustav.json
 *   node metrics.js data/ustav-ch1.checkpoint # Report on specific file
 *   node metrics.js --json                    # Output JSON format
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate comprehensive metrics from USTAV data
 */
function generateMetrics(ustav) {
  const metrics = {
    metadata: {
      title: ustav.metadata?.title || 'Unknown',
      version: ustav.metadata?.version || '0.0.0',
      finalizedAt: ustav.metadata?.finalized || ustav.metadata?.extractedAt || 'Unknown',
      analyzedat: new Date().toISOString()
    },
    summary: {
      totalChapters: 0,
      totalProblems: 0,
      totalPrompts: 0,
      totalFailureModes: 0,
      totalBusinessCases: 0,
      totalPromptLines: 0
    },
    chapters: [],
    prompts: {
      totalLines: 0,
      averageLength: 0,
      shortestLength: Infinity,
      longestLength: 0,
      byPlatform: {}
    },
    failureModes: {
      total: 0,
      withRecovery: 0,
      byType: {}
    },
    financials: {
      totalROI: 0,
      totalPayback: 0,
      estimatedTotalBenefit: 0,
      problems: []
    }
  };

  // Process chapters
  if (!ustav.chapters || ustav.chapters.length === 0) {
    return metrics;
  }

  metrics.summary.totalChapters = ustav.chapters.length;

  ustav.chapters.forEach(chapter => {
    const chapterMetrics = {
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      problems: 0,
      prompts: 0,
      failureModes: 0,
      businessCases: 0
    };

    if (!chapter.problems) {
      metrics.chapters.push(chapterMetrics);
      return;
    }

    chapter.problems.forEach(problem => {
      metrics.summary.totalProblems++;
      chapterMetrics.problems++;

      // Count prompts
      if (problem.prompts && Array.isArray(problem.prompts)) {
        metrics.summary.totalPrompts += problem.prompts.length;
        chapterMetrics.prompts += problem.prompts.length;

        // Analyze prompt content
        problem.prompts.forEach(prompt => {
          const promptLines = prompt.promptCode ? prompt.promptCode.split('\n').length : 0;
          metrics.prompts.totalLines += promptLines;
          metrics.summary.totalPromptLines += promptLines;

          // Track length statistics
          metrics.prompts.shortestLength = Math.min(metrics.prompts.shortestLength, promptLines);
          metrics.prompts.longestLength = Math.max(metrics.prompts.longestLength, promptLines);

          // Track by platform
          if (prompt.platformCompatibility) {
            prompt.platformCompatibility.forEach(platform => {
              if (!metrics.prompts.byPlatform[platform]) {
                metrics.prompts.byPlatform[platform] = 0;
              }
              metrics.prompts.byPlatform[platform]++;
            });
          }
        });
      }

      // Count business cases
      if (problem.businessCase || problem.businessCaseMetrics) {
        metrics.summary.totalBusinessCases++;
        chapterMetrics.businessCases++;

        // Extract financial metrics
        if (problem.businessCaseMetrics) {
          const metrics_obj = problem.businessCaseMetrics;
          let roi = 0;
          let payback = 0;
          let benefit = 0;

          if (metrics_obj.aiOutcome) {
            const outcome = metrics_obj.aiOutcome;
            // Extract ROI percentage
            if (outcome.roi && typeof outcome.roi === 'string') {
              roi = parseInt(outcome.roi);
            }
            if (outcome.paybackMonths) {
              payback = outcome.paybackMonths;
            }
            if (outcome.yearOneNet) {
              benefit = outcome.yearOneNet;
            }
          }

          if (roi > 0 || benefit > 0) {
            metrics.financials.problems.push({
              id: problem.id,
              title: problem.title,
              roi: roi,
              paybackMonths: payback,
              benefit: benefit
            });
            metrics.financials.totalROI += roi;
            metrics.financials.totalPayback += payback;
            metrics.financials.estimatedTotalBenefit += benefit;
          }
        }
      }

      // Count failure modes
      if (problem.failureModes && Array.isArray(problem.failureModes)) {
        metrics.summary.totalFailureModes += problem.failureModes.length;
        chapterMetrics.failureModes += problem.failureModes.length;
        metrics.failureModes.total += problem.failureModes.length;

        problem.failureModes.forEach(fm => {
          const fmName = fm.name || fm.id || 'Unknown';
          if (!metrics.failureModes.byType[fmName]) {
            metrics.failureModes.byType[fmName] = 0;
          }
          metrics.failureModes.byType[fmName]++;

          // Check if has recovery playbook
          if (fm.recovery) {
            metrics.failureModes.withRecovery++;
          }
        });
      }
    });

    metrics.chapters.push(chapterMetrics);
  });

  // Calculate averages
  if (metrics.summary.totalPrompts > 0) {
    metrics.prompts.averageLength = Math.round(
      metrics.prompts.totalLines / metrics.summary.totalPrompts
    );
  }

  // Handle no data edge case
  if (metrics.prompts.shortestLength === Infinity) {
    metrics.prompts.shortestLength = 0;
  }

  return metrics;
}

/**
 * Format metrics for console output
 */
function formatMetricsReport(metrics) {
  const lines = [];

  lines.push('\n' + '='.repeat(70));
  lines.push('USTAV DATABASE METRICS REPORT');
  lines.push('='.repeat(70));

  // Metadata
  lines.push(`\n📊 METADATA`);
  lines.push(`  Title: ${metrics.metadata.title}`);
  lines.push(`  Version: ${metrics.metadata.version}`);
  lines.push(`  Finalized: ${metrics.metadata.finalizedAt}`);
  lines.push(`  Analyzed: ${metrics.metadata.analyzedat}`);

  // Summary
  lines.push(`\n📚 CONTENT SUMMARY`);
  lines.push(`  Chapters: ${metrics.summary.totalChapters}`);
  lines.push(`  Problems: ${metrics.summary.totalProblems}`);
  lines.push(`  Prompts: ${metrics.summary.totalPrompts}`);
  lines.push(`  Failure Modes: ${metrics.summary.totalFailureModes}`);
  lines.push(`  Business Cases: ${metrics.summary.totalBusinessCases}`);

  // Chapter breakdown
  if (metrics.chapters.length > 0) {
    lines.push(`\n📖 CHAPTER BREAKDOWN`);
    metrics.chapters.forEach(ch => {
      lines.push(`  Ch${ch.number}: ${ch.title}`);
      lines.push(`    - Problems: ${ch.problems} | Prompts: ${ch.prompts} | Failure Modes: ${ch.failureModes}`);
    });
  }

  // Prompt analysis
  lines.push(`\n💬 PROMPT ANALYSIS`);
  lines.push(`  Total Prompt Lines: ${metrics.prompts.totalLines.toLocaleString()}`);
  lines.push(`  Average Length: ${metrics.prompts.averageLength} lines`);
  lines.push(`  Shortest: ${metrics.prompts.shortestLength} lines`);
  lines.push(`  Longest: ${metrics.prompts.longestLength} lines`);

  if (Object.keys(metrics.prompts.byPlatform).length > 0) {
    lines.push(`  Platform Compatibility:`);
    Object.entries(metrics.prompts.byPlatform).forEach(([platform, count]) => {
      lines.push(`    - ${platform}: ${count} prompts`);
    });
  }

  // Failure modes
  lines.push(`\n⚠️  FAILURE MODES`);
  lines.push(`  Total: ${metrics.failureModes.total}`);
  lines.push(`  With Recovery Playbooks: ${metrics.failureModes.withRecovery}`);

  if (Object.keys(metrics.failureModes.byType).length > 0) {
    lines.push(`  By Type:`);
    Object.entries(metrics.failureModes.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        lines.push(`    - ${type}: ${count}`);
      });
  }

  // Financial metrics
  lines.push(`\n💰 FINANCIAL METRICS`);
  lines.push(`  Total Combined ROI: ${metrics.financials.totalROI}%`);
  lines.push(`  Average Payback: ${metrics.financials.totalPayback > 0 ? (metrics.financials.totalPayback / metrics.financials.problems.length).toFixed(1) : 0} months`);
  lines.push(`  Estimated Total Benefit: $${metrics.financials.estimatedTotalBenefit.toLocaleString()}`);

  if (metrics.financials.problems.length > 0) {
    lines.push(`  Top 3 ROI Opportunities:`);
    metrics.financials.problems
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 3)
      .forEach(prob => {
        lines.push(`    - ${prob.title}: ${prob.roi}% ROI (${prob.paybackMonths} mo payback, $${prob.benefit?.toLocaleString() || 0} benefit)`);
      });
  }

  // Quality assessment
  lines.push(`\n✅ QUALITY ASSESSMENT`);
  const coverage = metrics.summary.totalBusinessCases / metrics.summary.totalProblems;
  const recoveryRate = metrics.failureModes.withRecovery / metrics.failureModes.total;
  lines.push(`  Business Case Coverage: ${(coverage * 100).toFixed(1)}%`);
  lines.push(`  Failure Mode Recovery Coverage: ${(recoveryRate * 100).toFixed(1)}%`);
  lines.push(`  Zero Tolerance Ready: ${coverage > 0.9 && recoveryRate > 0.8 ? '✅ YES' : '⚠️  PARTIAL'}`);

  lines.push('\n' + '='.repeat(70) + '\n');

  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const jsonFormat = args.includes('--json');
  
  // Determine file to analyze
  let filePath = path.join(__dirname, '../../data/ustav.json');
  
  if (args.length > 0 && !args[0].startsWith('--')) {
    filePath = path.isAbsolute(args[0])
      ? args[0]
      : path.join(__dirname, '../../', args[0]);
  }

  // Load file
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const metrics = generateMetrics(data);

    if (jsonFormat) {
      console.log(JSON.stringify(metrics, null, 2));
    } else {
      console.log(formatMetricsReport(metrics));
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(`   File: ${filePath}`);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { generateMetrics, formatMetricsReport };

// Run if called directly
if (require.main === module) {
  main();
}
