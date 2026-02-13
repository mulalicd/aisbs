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
  // Generate realistic, formatted output based on prompt type
  const mockOutput = generateRealisticMockOutput(promptMetadata);

  return {
    success: true,
    mode: 'mock',
    timestamp: new Date().toISOString(),
    promptId: promptMetadata.id,
    output: mockOutput,
    metadata: {
      executionTime: (Date.now() - startTime) + 'ms',
      model: 'Mock Deterministic Generator v2.0',
      status: 'SUCCESS',
      note: 'This is simulated output. Switch to "Production Mode" for real AI analysis.'
    }
  };
}

/**
 * Generate realistic mock output based on prompt context
 */
function generateRealisticMockOutput(prompt) {
  const title = prompt.title || 'Analysis';
  const content = (prompt.content || '') + (prompt.promptCode || '');
  const severity = prompt.severity || 'HIGH';

  // Advanced Context Detection
  const isFreightAudit = /freight|invoice|audit|carrier|logistics|shipping/i.test(content);
  const isContractReview = /clause|agreement|liability|indemnification|legal/i.test(content);
  const isDemand = /demand|forecast|signal/i.test(content);

  // Common Style
  const containerStyle = "font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1f2937; line-height: 1.6; max-width: 100%;";
  const sectionTitleStyle = "font-size: 14px; font-weight: 700; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin-top: 24px;";
  const highlightBoxStyle = "background: #f9fafb; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;";
  const tableStyle = "width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;";
  const thStyle = "text-align: left; padding: 8px 12px; background: #f3f4f6; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151;";
  const tdStyle = "padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;";

  let bodyHtml = '';
  let summaryText = '';

  // --- SCENARIO 1: FREIGHT AUDIT GOLDEN STANDARD ---
  if (isFreightAudit) {
    summaryText = "Executed full 5-Step Freight Audit. Identified $1,748 in immediate recovery opportunities (4.33% leakage).";

    bodyHtml = `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 6px; margin-bottom: 24px; color: #1e40af;">
        <strong>Simulation Mode Active:</strong> Executing full 5-Step Freight Audit using high-fidelity mockup data consistent with a $50M–$500M mid-market shipper.
      </div>

      <h3 style="${sectionTitleStyle}">STEP 1 — DATA INTEGRITY & BASELINE DIAGNOSTIC</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
        <div>
          <strong>Mock Dataset Scope:</strong><br>
          • 3 Carriers<br>
          • 12 Invoices<br>
          • 46 Line Items<br>
          • Total Audited Spend: <strong>$41,880</strong>
        </div>
        <div>
          <strong>Integrity Test Results:</strong><br>
          • Reconciled: 11 (91.7%)<br>
          • <span style="color: #dc2626; font-weight: bold;">Corrupt (Mismatch >$1): 1 (8.3%)</span>
        </div>
      </div>
      
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; font-size: 13px;">
        <strong>Corrupt Invoice Flagged (Excluded):</strong> INV-1047 (Delta Regional LTL) → $1,140 invoiced vs $1,168 summed lines.<br>
        <em>Status: Proceeding while excluding INV-1047 from recovery math.</em>
      </div>

      <h3 style="${sectionTitleStyle}">STEP 2 — RATE LOGIC VERIFICATION (Rate Creep Detection)</h3>
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Carrier</th>
            <th style="${thStyle} text-align: right;">Invoices Affected</th>
            <th style="${thStyle} text-align: right;">Avg Overcharge</th>
            <th style="${thStyle} text-align: right;">Total Variance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}">UPS Freight</td>
            <td style="${tdStyle} text-align: right;">3</td>
            <td style="${tdStyle} text-align: right;">+$42</td>
            <td style="${tdStyle} text-align: right;">$126</td>
          </tr>
          <tr>
            <td style="${tdStyle}">FedEx Freight</td>
            <td style="${tdStyle} text-align: right;">2</td>
            <td style="${tdStyle} text-align: right;">+$58</td>
            <td style="${tdStyle} text-align: right;">$116</td>
          </tr>
          <tr>
            <td style="${tdStyle}">Delta Regional LTL</td>
            <td style="${tdStyle} text-align: right;">1</td>
            <td style="${tdStyle} text-align: right;">+$35</td>
            <td style="${tdStyle} text-align: right;">$35</td>
          </tr>
          <tr style="background: #f9fafb; font-weight: bold;">
            <td style="${tdStyle}">TOTAL</td>
            <td style="${tdStyle} text-align: right;">6</td>
            <td style="${tdStyle}"></td>
            <td style="${tdStyle} text-align: right; color: #dc2626;">$277</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size: 13px; color: #4b5563;">
        <strong>Primary Cause:</strong> Unapproved 2024 GRI applied (3.9%–5.2%) not reflected in contract amendment.<br>
        <strong>Confidence Score:</strong> 10/10 (explicit contract mismatch)
      </p>

      <h3 style="${sectionTitleStyle}">STEP 3 — ACCESSORIAL & “GHOST CHARGE” AUDIT</h3>
      
      <div style="margin-bottom: 16px;">
        <strong style="color: #111827;">⛽ Fuel Surcharge Check</strong><br>
        <span style="font-size: 13px;">Approved: 18% | Observed: 19.8%–22.4%</span><br>
        <span style="font-weight: bold; color: #dc2626;">Fuel Leakage Identified: $424</span>
      </div>

      <div style="margin-bottom: 16px;">
        <strong style="color: #111827;">🏠 Residential Surcharge Scan</strong><br>
        <table style="${tableStyle} margin-top: 8px;">
          <tr>
            <td style="${tdStyle}">INV-1021</td>
            <td style="${tdStyle}">UPS Freight</td>
            <td style="${tdStyle}">$45</td>
            <td style="${tdStyle}">Warehouse delivery (B2B)</td>
          </tr>
          <tr>
            <td style="${tdStyle}">INV-1033</td>
            <td style="${tdStyle}">FedEx Freight</td>
            <td style="${tdStyle}">$52</td>
            <td style="${tdStyle}">Distribution Center</td>
          </tr>
        </table>
        <span style="font-weight: bold; color: #dc2626;">Residential Leakage: $97</span> (Confidence: 7/10)
      </div>

      <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
        <strong>⚠️ Duplicate Billing Detection</strong><br>
        Tracking #1Z8834 appeared on INV-1028 & INV-1029.<br>
        <span style="color: #b45309; font-weight: bold;">Flagged 100% Duplicate Billing ($1,280). Confidence: 10/10.</span>
      </div>

      <h3 style="${sectionTitleStyle}">STEP 4 — EXECUTIVE RECOVERY SUMMARY</h3>
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Carrier</th>
            <th style="${thStyle} text-align: right;">Total Audited</th>
            <th style="${thStyle} text-align: right;">Errors</th>
            <th style="${thStyle} text-align: right;">Recoverable</th>
            <th style="${thStyle} text-align: right;">Leakage %</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}">UPS Freight</td>
            <td style="${tdStyle} text-align: right;">$16,540</td>
            <td style="${tdStyle} text-align: right;">6</td>
            <td style="${tdStyle} text-align: right; color: #059669; font-weight: bold;">$1,006</td>
            <td style="${tdStyle} text-align: right;">6.08%</td>
          </tr>
          <tr>
            <td style="${tdStyle}">FedEx Freight</td>
            <td style="${tdStyle} text-align: right;">$14,880</td>
            <td style="${tdStyle} text-align: right;">4</td>
            <td style="${tdStyle} text-align: right; color: #059669; font-weight: bold;">$613</td>
            <td style="${tdStyle} text-align: right;">4.12%</td>
          </tr>
          <tr>
            <td style="${tdStyle}">Delta Regional</td>
            <td style="${tdStyle} text-align: right;">$8,940</td>
            <td style="${tdStyle} text-align: right;">2</td>
            <td style="${tdStyle} text-align: right; color: #059669; font-weight: bold;">$129</td>
            <td style="${tdStyle} text-align: right;">1.44%</td>
          </tr>
          <tr style="background: #ecfdf5; border-top: 2px solid #059669;">
            <td style="${tdStyle} font-weight: bold;">TOTAL</td>
            <td style="${tdStyle} text-align: right; font-weight: bold;">$40,360</td>
            <td style="${tdStyle} text-align: right; font-weight: bold;">12</td>
            <td style="${tdStyle} text-align: right; color: #059669; font-weight: 800; font-size: 15px;">$1,748</td>
            <td style="${tdStyle} text-align: right; font-weight: bold;">4.33%</td>
          </tr>
        </tbody>
      </table>

      <h3 style="${sectionTitleStyle}">STEP 5 — DETAILED DISPUTE LOG (CSV Ready)</h3>
      <div style="background: #f8fafc; padding: 12px; font-family: monospace; font-size: 11px; border: 1px solid #e2e8f0; overflow-x: auto;">
        Invoice_ID,Tracking_Number,Carrier,Error_Type,Invoiced,Contract,Variance,Conf<br>
        INV-1004,1Z8812,UPS Freight,Rate Error,$452,$410,$42,10<br>
        INV-1007,1Z8819,UPS Freight,Fuel Overcharge,$89,$74,$15,10<br>
        INV-1021,1Z8825,UPS Freight,Residential Error,$45,$0,$45,7<br>
        INV-1028,1Z8834,UPS Freight,Duplicate Billing,$1280,$0,$1280,10<br>
        INV-1033,7748829,FedEx Freight,Residential Error,$52,$0,$52,7<br>
        INV-1035,7748831,FedEx Freight,Rate Error,$468,$410,$58,10
      </div>

      <div style="${highlightBoxStyle} border-left-color: #7c3aed; background: #f5f3ff;">
        <h4 style="margin: 0 0 8px 0; color: #5b21b6;">💰 CFO TAKEAWAY</h4>
        <p style="margin: 0; font-size: 14px; color: #4c1d95;">
          You are currently leaking <strong>~4–6% of freight spend</strong> through preventable billing errors.<br>
          At $12M annual freight spend → <strong>$480k–$720k annual "Chaos Tax"</strong>.
        </p>
      </div>

      <h3 style="${sectionTitleStyle}">✉️ PROFESSIONAL DISPUTE EMAIL TEMPLATE</h3>
      <div style="background: #ffffff; border: 1px solid #d1d5db; padding: 20px; border-radius: 4px; font-size: 13px; color: #374151;">
        <strong>Subject:</strong> Formal Freight Invoice Dispute – Contract Rate & Accessorial Violations<br><br>
        Dear [Carrier Account Manager],<br><br>
        Following a detailed freight audit against our executed transportation agreement, we identified several discrepancies requiring correction.<br><br>
        <strong>1. Rate Mismatch (Section 3.2 – Contract Rate Table)</strong><br>
        Invoice INV-1004 reflects a billed base rate of $452. Per contract (LTL Std 501-1000 lb), the agreed rate is $410. <em>Variance: $42.</em><br><br>
        <strong>2. Duel Surcharge Overapplication</strong><br>
        Fuel applied at 21.3% versus contracted 18% cap (Section 5.1).<br><br>
        <strong>3. Duplicate Billing</strong><br>
        Tracking #1Z8834 appears on two invoices (INV-1028 & INV-1029). Kindly confirm voiding of the second invoice.<br><br>
        We request issuance of credit memos totaling <strong>$1,748</strong> within 10 business days.<br><br>
        Sincerely,<br>
        [Your Name]<br>
        Director of Logistics
      </div>
      
      <div style="margin-top: 24px; border-top: 1px dashed #d1d5db; padding-top: 16px; font-size: 13px; color: #6b7280;">
        <strong>Would you like next:</strong><br>
        • 90-Day Freight Recovery Roadmap<br>
        • Carrier Negotiation Strategy<br>
        • Automated Audit Architecture Blueprint
      </div>
    `;

    // --- SCENARIO 2: CONTRACT REVIEW GOLDEN STANDARD ---
  } else if (isContractReview) {
    // Similar high-quality structure for contracts
    summaryText = "Risk Analysis: Found 3 critical liability loopholes.";
    bodyHtml = `
      <h3 style="${sectionTitleStyle}">STEP 1 — CLAUSE EXTRACTION & RISK MAPPING</h3>
      <div style="${highlightBoxStyle} border-left-color: #ea580c; background: #fff7ed;">
        <strong>Risk Score: HIGH (8/10)</strong> | Jurisdiction: NY Information Law
      </div>
      ... (Detailed contract analysis would go here) ...
    `;

    // --- FALLBACK GENERIC GOLDEN STANDARD ---
  } else {
    // Generic
    summaryText = "Analysis complete.";
    bodyHtml = `
      <h3 style="${sectionTitleStyle}">STEP 1 — BASELINE DIAGNOSTIC</h3>
      <p>Analysis of input data matches standard industry patterns...</p>
      ... (Detailed generic analysis) ...
    `;
  }

  // Final Wrapper
  const finalHtml = `
    <div style="${containerStyle}">
      ${bodyHtml}
    </div>
  `;

  return {
    html: finalHtml,
    summary: summaryText,
    format: 'html',
    type: isFreightAudit ? 'audit' : 'analysis'
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
