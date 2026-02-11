const fs = require('fs');
const path = require('path');

// Write Chapter 1 Logistics & Supply Chain data
const data = {
  "metadata": {
    "title": "AI Solved Business Problems",
    "subtitle": "50 Real-World Challenges from 10 Industries",
    "version": "1.0.0",
    "finalized": "2026-02-10",
    "totalChapters": 1,
    "totalProblems": 1,
    "totalPrompts": 1,
    "note": "Chapter 1 finalized with complete Problem 1.1: Freight Invoice Audit with 3 failure modes and recovery playbooks"
  },
  "chapters": [{
    "id": "ch1",
    "number": 1,
    "title": "Logistics & Supply Chain - The AI Operating System",
    "introduction": "Your phone rings at 2:00 AM. It's the Port of Long Beach. Your priority containers are stuck. By 8:00 AM, CFO asks why freight costs are rising. By 10:00 AM, board wants answers. Decision Gap: 14.2 hours from port strike to operational reroute.",
    "problems": [{
      "id": "ch1_p1",
      "number": 1,
      "title": "The Freight Leak (Automated Audit & Dispute)",
      "severity": "CRITICAL",
      "promptability": 9.5,
      "sections": {
        "operationalReality": "AP department spot-checks 10% of freight invoices. 6% error rate. $12M spend × 6% = $720K annual loss. Team drowning in PDFs, missing systematic overcharges ($80 residential surcharges on warehouse transfers, $150 unapproved detention fees).",
        "whyTraditionalFails": "3rd-party audit firms take 25% cut. Rule-based systems break on surcharge name changes. Consultants miss root cause. Traditional methods assume clean data; yours isn't—your planners spend 60% as human macros bridging gaps between TMS and ERP.",
        "managerDecisionPoint": "Option 1: Status Quo—keep losing $500K+. Option 2: 3rd-party audit—high cost, no fix. Option 3: AI-Augmented Contract-to-Invoice Auditor—100% coverage, 3-5% recovery ($350K+), pre-written disputes. WINNER: Option 3.",
        "aiWorkflow": "Monday 9:15 AM: AP clerk opens Dispute Dashboard. AI ingested contracts & invoices over weekend. Carrier X charged Residential Surcharge on 42 shipments to commercial warehouse. AI drafted dispute citing Contract Section 7.2, includes warehouse GPS coordinates. Clerk reviews 42 items in 15 minutes, hits 'Approve All.'",
        "executionPrompt": "# FREIGHT INVOICE AUDIT AGENT - PROMPT 1.1\n## Role: Expert freight audit specialist (15+ years logistics contract analysis)\n## Objective: Identify billing errors by comparing invoices to carrier contracts\n\n## INPUTS\n**INPUT 1: Carrier Contracts** - PDF/markdown, sections: rates, surcharges, zones, terms\n**INPUT 2: Invoice CSV** - columns: invoice, date, carrier, dest_zip, dest_type, base, surcharges, fuel, total  \n**INPUT 3: Business Rules** - pre-approval requirements, zone mappings, auth surcharges\n\n## PROCESS\n1. Parse contract: surcharge types, zone definitions, exclusions\n2. Validate each invoice line: ZIP in correct zone? Type matches? Surcharge authorized? Pre-approved? Rate in range?\n3. Identify errors: zone mismatch, type mismatch, unauthorized, missing approval, calc error, rate drift\n4. Draft disputes: cite contract clause, invoice line, reason, resolution request, email\n\n## OUTPUT\nJSON: report_id, audit_date, invoices_reviewed, disputed_items, total_amount, recovery_rate, disputes[], summaries\n\n## QUALITY\n- 99% precision (false disputes damage relationships)\n- Confidence threshold: ≥0.85 only\n- 2-min review time per dispute\n- Legal: cite specific clauses\n\n## EDGE CASES\n- Blurry PDF: confidence <0.7, manual review flag\n- Ambiguous: defer to carrier unless clearly improper\n- Fuel: dispute if >10% above range\n- Zones: defer unless documented clear\n\nDesigned for: ChatGPT-4, Claude 3.5, Gemini 2.0, Ollama (Llama 13B+)\nCost per invoice batch: ~$0.15 (1000-invoice runs)\nPilot: Start single carrier (most consistency)\nBatch: Weekly (Friday evening, Monday morning review)",
        "businessCase": "Current: $12M spend, 6% error = $720K loss. AI: 100% coverage, 3.5% recovery = $420K. Costs: $45K setup, $24K/year ops. Year 1: +$351K net. ROI: 281%. Payback: 1.2 months. Break-even: 0.58% recovery rate.",
        "industryContext": "Widespread problem. Aberdeen: <$50M companies waste 8-12%, >$500M waste 4-6% due to scale. Carrier ransom (rates up 34% since 2021, service flat) accelerated issue. CSCMP 2024 benchmark confirms trend.",
        "failureModes": "See detailed failure modes below"
      },
      "prompts": [{
        "id": "ch1_p1_pr1",
        "title": "Freight Invoice Audit Agent",
        "version": "1.0.0",
        "role": "Expert freight audit specialist",
        "severity": "CRITICAL",
        "platformCompatibility": ["ChatGPT-4", "Claude 3.5 Sonnet", "Gemini 2.0", "Ollama Llama13B+"],
        "inputSchema": {
          "input1": {"name": "Carrier Contracts", "format": "PDF/markdown", "sections": ["Surcharges", "Zones", "Rates"]},
          "input2": {"name": "Invoice Data", "format": "CSV", "columns": ["invoice", "carrier", "dest_zip", "charges"]},
          "input3": {"name": "Business Rules", "format": "Text", "items": ["Pre-approvals", "Zone mappings", "Authorized surcharges"]}
        },
        "mockOutput": {
          "reportId": "AUDIT-2025-02-10-001",
          "auditDate": "2025-02-10",
          "totalInvoicesReviewed": 142,
          "totalLineItems": 1247,
          "disputedLineItems": 34,
          "totalDisputedAmount": "$8,450.00",
          "recoveryRate": "2.8%",
          "disputes": [
            {"invoiceId": "XPO-INV-00002", "chargeType": "Residential Surcharge", "amount": "$85", "reason": "Zone A is commercial-only per Section 4.1", "confidence": 0.99, "severity": "high"},
            {"invoiceId": "XPO-INV-00003", "chargeType": "Detention Fee", "amount": "$150", "reason": "Missing pre-approval documentation", "confidence": 0.94, "severity": "high"}
          ],
          "summary": "34 disputed charges. Categories: zone mismatches (18), unauthorized (8), missing approvals (5), rate errors (3). Conservative recovery (70%): $5,915"
        }
      }],
      "failureModes": [
        {
          "id": "fm_ch1_p1_01",
          "number": 1,
          "name": "PDF OCR Hallucination",
          "symptom": "False dispute: AI flags surcharge as unauthorized, but it IS in contract. Confidence 0.95→0.42 when clerk validates original PDF.",
          "rootCause": "Blurry/faxed PDF misread by OCR. 'F-Surcharge' becomes 'F_charge'. LLM can't find it in contract (even though it exists under different formatting).",
          "recovery": {
            "immediate": "Confidence Filtering: Disputes ≥0.85 only. <0.7 marked manual review. Filters ~15-20% edge cases.",
            "shortTerm": "Contract Standardization: Request digital format. Create canonical surcharge list mapping variations. 2-week timeline.",
            "longTerm": "Contract Repository: Implement system (Apptio/custom) with surcharge metadata. LLM queries database vs PDFs. 6-8 weeks."
          },
          "solution": "Implement confidence thresholds + contract version control + digital-first procurement"
        },
        {
          "id": "fm_ch1_p1_02",
          "number": 2,
          "name": "Carrier Relationship Damage",
          "symptom": "200+ disputes sent in one week (all valid). Carrier account manager calls CFO: 'Re-evaluating relationship.' Threatens slower service tier. You lose dispute capability 6 months due to politics.",
          "rootCause": "'Being right' ≠ 'winning.' Carriers operate on relationships. 200 disputes read as 'audit aggression' vs. relief. Even if the $3,500 is real, their pride/perception matters more.",
          "recovery": {
            "immediate": "Dispute Prioritization: >$500 items first, systemic errors (>10 shipments) next, defer <$50 to monthly batch. Reduce Week 1 from 200→30-40.",
            "shortTerm": "Call each carrier BEFORE disputes: 'Improving audit process, partnership approach.' Set up weekly calls instead of dispute emails. Reframe as collaboration.",
            "longTerm": "Shared P&L: Propose 'split upside of better auditing. Reduce invalid charges, split savings 50/50.' Top carriers often accept. 2-3 month timeline."
          },
          "solution": "Prioritize high-value + systemic errors, proactive carrier communication, shared incentive model"
        },
        {
          "id": "fm_ch1_p1_03",
          "number": 3,
          "name": "Contract Amendment Blind Spot",
          "symptom": "Dispute $3,200 Hazmat Surcharge (certain it's not in contract). Carrier responds: 'Amendment 4, March 2025, page 2.' Your PDF has v1 only. You look foolish. Affects 12% of contracts updated in past 18mo.",
          "rootCause": "Amendments transmitted separately (email, portal). Never reach master contract library. AI audits stale terms v1 while reality is v1+Amendment4.",
          "recovery": {
            "immediate": "Amendment Flag: Before sending disputes, search for 'amendment/addendum/modification' within 6mo. Flag as 'pending amendment verification.' Don't send until Procurement confirms latest version.",
            "shortTerm": "Version Control Repo: Work with Procurement. Mandatory folder system. Every contract: 'Master Copy' date label. Every amendment filed WITH original. LLM queries both. 2-3 weeks.",
            "longTerm": "Auto-Update: TMS/portal auto-alerts when carriers submit amendments. Auto-updates PDF for next audit cycle. Requires TMS upgrade. 8-12 weeks."
          },
          "solution": "Implement amendment verification gate + centralized contract versioning + automated update triggers"
        }
      ]
    }]
  }]
};

const output = path.join(__dirname, '../../data/ustav.json');
fs.writeFileSync(output, JSON.stringify(data, null, 2), 'utf-8');
console.log('[USTAV] ✓ Chapter 1 finalized and written to ustav.json');
console.log('[USTAV]   - Title: Logistics & Supply Chain');
console.log('[USTAV]   - Problem: Freight Invoice Audit');
console.log('[USTAV]   - Failure Modes: 3');
console.log('[USTAV]   - Status: READY FOR TESTING');
