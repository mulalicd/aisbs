#!/usr/bin/env python3
"""
USTAV Book Parser - Extract Chapter 1 & All 5 Problems
Engineered for Zero Tolerance Production Quality
"""

import json
import re
import os
from datetime import datetime
from pathlib import Path

class USTAVParser:
    def __init__(self):
        self.book_text = ""
        self.project_root = Path(__file__).parent.parent.parent
        self.book_path = self.project_root / "AI SOLVED BUSINESS PROBLEMS.txt"
        self.output_path = self.project_root / "data" / "ustav.json"
        
    def load_book(self):
        """Read the entire USTAV book"""
        print(f"[PARSER] Loading USTAV book from {self.book_path}...")
        try:
            with open(self.book_path, 'r', encoding='utf-8') as f:
                self.book_text = f.read()
            print(f"[PARSER] ✓ Book loaded: {len(self.book_text):,} characters")
            return True
        except Exception as e:
            print(f"[PARSER] ✗ Failed to load book: {e}")
            return False
    
    def parse_chapter_1(self):
        """Extract Chapter 1: Logistics & Supply Chain"""
        print("\n[PARSER] Parsing CHAPTER 1: Logistics & Supply Chain...")
        
        # Find chapter boundaries
        ch1_start = self.book_text.find("Logistics & Supply Chain - The AI Operating System")
        if ch1_start == -1:
            print("[PARSER] ✗ Could not find Chapter 1 start")
            return None
        
        # Find the actual chapter content (skip to the detailed intro)
        detailed_start = self.book_text.find("Your phone rings at 2:00 AM. It's not a security alarm", ch1_start)
        if detailed_start == -1:
            print("[PARSER] ✗ Could not find Chapter 1 detailed content")
            return None
        
        # Find Chapter 2 start
        ch2_start = self.book_text.find("\n\nCHAPTER", ch1_start + 100)
        if ch2_start == -1:
            ch2_start = len(self.book_text)
        
        chapter_text = self.book_text[detailed_start:ch2_start]
        print(f"[PARSER] Found Chapter 1 text: {len(chapter_text):,} characters")
        
        # Extract chapter introduction
        intro_end = chapter_text.find("PROBLEM 1.1")
        intro = chapter_text[:intro_end].strip() if intro_end > 0 else ""
        
        # Extract all 5 problems
        problems = []
        for i in range(1, 6):
            print(f"[PARSER]   Parsing Problem 1.{i}...")
            problem = self.parse_problem(chapter_text, i)
            if problem:
                problems.append(problem)
                print(f"[PARSER]   ✓ Problem 1.{i} complete: {problem['title']}")
            else:
                print(f"[PARSER]   ✗ Failed to parse Problem 1.{i}")
        
        return {
            "id": "ch1",
            "number": 1,
            "title": "Logistics & Supply Chain - The AI Operating System",
            "intro": intro,
            "problems": problems,
            "metadata": {
                "extractionDate": datetime.now().isoformat(),
                "totalProblems": len(problems),
                "totalPrompts": sum(len(p.get('prompts', [])) for p in problems),
                "totalFailureModes": sum(len(p.get('failureModes', [])) for p in problems)
            }
        }
    
    def parse_problem(self, chapter_text, problem_num):
        """Parse individual problem (1-5)"""
        problem_id = f"1.{problem_num}"
        
        # Find problem boundaries
        problem_start = chapter_text.find(f"PROBLEM {problem_id}\n")
        if problem_start == -1:
            return None
        
        # Find next problem or end
        next_problem = chapter_text.find(f"\n\nPROBLEM 1.{problem_num + 1}", problem_start)
        problem_end = next_problem if next_problem > 0 else len(chapter_text)
        
        problem_text = chapter_text[problem_start:problem_end]
        
        # Extract title
        title_match = re.search(r"^PROBLEM \d+\.\d+\n([^\n]+)\n", problem_text)
        title = title_match.group(1) if title_match else f"Problem {problem_id}"
        
        # Extract sections
        sections = {}
        for i in range(1, 9):
            section_text = self.extract_section(problem_text, i)
            section_names = [
                "operationalReality",
                "whyTraditionalFails",
                "managerDecisionPoint",
                "aiWorkflow",
                "executionPrompt",
                "businessCase",
                "industryContext",
                "failureModes"
            ]
            sections[section_names[i-1]] = section_text
        
        # Extract prompts from section 5
        prompts = self.extract_prompts(problem_text, problem_id)
        
        # Extract business case
        business_case = self.parse_business_case(sections["businessCase"], problem_id)
        
        # Extract failure modes
        failure_modes = self.parse_failure_modes(sections["failureModes"], problem_id)
        
        return {
            "id": f"ch1_p{problem_num}",
            "number": problem_num,
            "title": title,
            "sections": sections,
            "prompts": prompts,
            "businessCase": business_case,
            "failureModes": failure_modes,
            "metadata": {
                "severity": self.extract_severity(sections["executionPrompt"]),
                "promptCount": len(prompts),
                "failureModeCount": len(failure_modes)
            }
        }
    
    def extract_section(self, problem_text, section_num):
        """Extract specific section (1-8)"""
        start_pattern = f"\nSECTION {section_num}\n"
        start_pos = problem_text.find(start_pattern)
        
        if start_pos == -1:
            return ""
        
        # Remove the section header
        start_pos += len(start_pattern)
        
        # Find next section
        next_section = problem_text.find(f"\nSECTION {section_num + 1}", start_pos)
        next_problem = problem_text.find("\n\nPROBLEM", start_pos)
        
        # Determine end position
        if next_section > 0 and (next_problem == -1 or next_section < next_problem):
            end_pos = next_section
        elif next_problem > 0:
            end_pos = next_problem
        else:
            end_pos = len(problem_text)
        
        return problem_text[start_pos:end_pos].strip()
    
    def extract_prompts(self, problem_text, problem_id):
        """Extract all prompts with FULL CODE from Section 5"""
        prompts = []
        problem_num = problem_id.split('.')[1]
        
        # Find all BEGIN...END PROMPT blocks
        begin_marker = "<<< BEGIN PROMPT >>>"
        end_marker = "<<< END PROMPT >>>"
        
        search_start = 0
        prompt_count = 0
        
        while True:
            begin_idx = problem_text.find(begin_marker, search_start)
            if begin_idx == -1:
                break
            
            end_idx = problem_text.find(end_marker, begin_idx)
            if end_idx == -1:
                break
            
            prompt_count += 1
            
            # Extract full prompt code
            full_prompt_code = problem_text[begin_idx + len(begin_marker):end_idx].strip()
            
            # Extract metadata from before the BEGIN PROMPT marker
            section_start = max(0, begin_idx - 500)
            context = problem_text[section_start:begin_idx]
            
            # Extract version, role, severity
            version_match = re.search(r"\*\*Version:\*\*\s*([^\n]+)", context)
            role_match = re.search(r"\*\*Role:\*\*\s*([^\n]+)", context)
            severity_match = re.search(r"\*\*Severity:\*\*\s*([^\n]+)", context)
            
            prompt_id = f"ch1_p{problem_num}_pr{prompt_count}"
            
            prompts.append({
                "id": prompt_id,
                "version": version_match.group(1).strip() if version_match else "1.0.v1",
                "title": self.extract_prompt_title(full_prompt_code),
                "role": role_match.group(1).strip() if role_match else "AI Assistant",
                "severity": severity_match.group(1).strip() if severity_match else "UNKNOWN",
                "promptCode": full_prompt_code,
                "inputSchema": self.parse_input_schema(full_prompt_code),
                "outputRequirements": self.parse_output_requirements(full_prompt_code),
                "mockOutput": self.generate_mock_output(prompt_id),
                "platformCompatibility": self.extract_platform_compatibility(context)
            })
            
            search_start = end_idx + len(end_marker)
        
        return prompts
    
    def extract_prompt_title(self, prompt_code):
        """Extract prompt title"""
        # Try to find a title in the format "# PROMPT X.X:"
        title_match = re.search(r"# PROMPT[\s\d\.]+:\s*([^\n]+)", prompt_code)
        if title_match:
            return title_match.group(1).strip()
        
        # Fallback: look for role assignment
        role_match = re.search(r"You are an?\s*\*?\*?([^\.]+)", prompt_code)
        if role_match:
            return role_match.group(1).strip()[:80]
        
        return "Untitled Prompt"
    
    def parse_input_schema(self, prompt_code):
        """Parse input schema from prompt code"""
        schema = {}
        input_num = 1
        
        input_pattern = r"\*\*INPUT (\d+):\s*([^\n]+)\*\*\n([\s\S]+?)(?=\*\*INPUT \d+:|$)"
        
        for match in re.finditer(input_pattern, prompt_code):
            input_label = match.group(2)
            input_desc = match.group(3)
            
            # Extract required fields
            format_match = re.search(r"Required Format:\s*([^\n]+)", input_desc)
            columns_match = re.search(r"Required Columns:\s*([^\n]+)", input_desc)
            source_match = re.search(r"System Source:\s*([^\n]+)", input_desc)
            
            input_key = f"input{input_num}"
            
            schema[input_key] = {
                "name": input_label.strip(),
                "systemSource": source_match.group(1).strip() if source_match else "User Input",
                "requiredFormat": format_match.group(1).strip() if format_match else "CSV or Text",
                "requiredColumns": [c.strip().replace('`', '') 
                                   for c in re.split(r'[,;]\s*', columns_match.group(1))
                                   if c.strip()] if columns_match else []
            }
            
            input_num += 1
        
        return schema
    
    def parse_output_requirements(self, prompt_code):
        """Parse output requirements"""
        requirements = []
        
        deliverable_pattern = r"\*\*DELIVERABLE (\d+):\s*([^\n]+)\*\*\n([\s\S]+?)(?=\*\*DELIVERABLE|\*\*\*|$)"
        
        for match in re.finditer(deliverable_pattern, prompt_code):
            req_text = match.group(3)
            priority_match = re.search(r"Priority:\s*([^\n]+)", req_text)
            format_match = re.search(r"Format:\s*([^\n]+)", req_text)
            
            requirements.append({
                "deliverable": int(match.group(1)),
                "name": match.group(2).strip(),
                "priority": priority_match.group(1).strip() if priority_match else "MEDIUM",
                "format": format_match.group(1).strip() if format_match else "Text"
            })
        
        return requirements
    
    def generate_mock_output(self, prompt_id):
        """Generate mock output placeholder"""
        return {
            "promptId": prompt_id,
            "status": "success",
            "executedAt": datetime.now().isoformat(),
            "message": "Mock output - generated for demonstration",
            "data": {
                "summary": "Analysis complete",
                "records": []
            }
        }
    
    def extract_platform_compatibility(self, context):
        """Extract platform compatibility"""
        compat_match = re.search(r"\*\*Platform Compatibility:\*\*\s*([^\n]+)", context)
        
        if not compat_match:
            return ["ChatGPT", "Claude", "Gemini"]
        
        platforms = [p.strip() for p in re.split(r'[,;]', compat_match.group(1))]
        return [p for p in platforms if p]
    
    def parse_business_case(self, section_text, problem_id):
        """Parse business case (Section 6)"""
        business_case = {
            "currentState": {},
            "withAI": {},
            "implementation": {},
            "payback": {},
            "sensitivityAnalysis": {}
        }
        
        # Extract key numbers
        annual_spend_match = re.search(r"Annual[^\n]*Spend[^\n]*:\s*\$?([\d,]+)", section_text, re.IGNORECASE)
        error_rate_match = re.search(r"Error Rate[^\n]*:\s*(\d+(?:\.\d+)?%?)", section_text, re.IGNORECASE)
        payback_match = re.search(r"Payback[^\n]*:\s*([\d\.]+)\s*(?:months?|days?)", section_text, re.IGNORECASE)
        
        if annual_spend_match:
            business_case["currentState"]["annualFramightSpend"] = int(annual_spend_match.group(1).replace(',', ''))
        
        if error_rate_match:
            rate_str = error_rate_match.group(1).replace('%', '')
            business_case["currentState"]["estimatedErrorRate"] = float(rate_str) / 100
        
        if payback_match:
            business_case["payback"]["months"] = float(payback_match.group(1))
        
        return business_case
    
    def parse_failure_modes(self, section_text, problem_id):
        """Parse failure modes (Section 8)"""
        failure_modes = []
        problem_num = problem_id.split('.')[1]
        
        failure_pattern = r"FAILURE MODE #?(\d+)\n([^\n]+)\n\n([\s\S]+?)(?=FAILURE MODE|$)"
        
        for match in re.finditer(failure_pattern, section_text, re.IGNORECASE):
            failure_title = match.group(2)
            failure_content = match.group(3)
            
            # Extract sections
            symptom_match = re.search(r"What You See[\s\S]*?Symptom[^\n]*\n([\s\S]+?)(?=\n\nWhy It Happens|$)", 
                                    failure_content, re.IGNORECASE)
            root_cause_match = re.search(r"Why It Happens[\s\S]*?Root Cause[^\n]*\n([\s\S]+?)(?=\n\nHow to|$)",
                                       failure_content, re.IGNORECASE)
            recovery_match = re.search(r"How to Recover[\s\S]*?\n([\s\S]+?)(?=\n\nEmail|$)",
                                     failure_content, re.IGNORECASE)
            
            failure_modes.append({
                "id": f"fm_ch1_p{problem_num}_{str(len(failure_modes) + 1).zfill(2)}",
                "name": failure_title.strip(),
                "symptom": symptom_match.group(1).strip() if symptom_match else "",
                "rootCause": root_cause_match.group(1).strip() if root_cause_match else "",
                "recovery": {
                    "immediate": self.extract_recovery_step(recovery_match.group(1) if recovery_match else "", "Immediate"),
                    "shortTerm": self.extract_recovery_step(recovery_match.group(1) if recovery_match else "", "Short-Term"),
                    "longTerm": self.extract_recovery_step(recovery_match.group(1) if recovery_match else "", "Long-Term")
                }
            })
        
        return failure_modes
    
    def extract_recovery_step(self, recovery_text, timeframe):
        """Extract recovery step"""
        pattern = f"{timeframe}[^\n]*\n([\\s\\S]+?)(?=\n\n|\\w+-Term|$)"
        match = re.search(pattern, recovery_text, re.IGNORECASE)
        return {
            "timeframe": timeframe,
            "action": match.group(1).strip() if match else "",
            "details": match.group(1).strip() if match else ""
        }
    
    def extract_severity(self, prompt_section):
        """Extract severity"""
        match = re.search(r"Severity[:\s]*([^\n]+)", prompt_section, re.IGNORECASE)
        return match.group(1).strip() if match else "UNKNOWN"
    
    def save(self, chapters):
        """Save parsed data to JSON"""
        output = {
            "metadata": {
                "title": "AI Solved Business Problems",
                "subtitle": "50 Real-World Challenges from 10 Industries",
                "version": "1.0.0",
                "extractedAt": datetime.now().isoformat(),
                "totalChapters": len(chapters),
                "totalProblems": sum(len(ch.get('problems', [])) for ch in chapters),
                "totalPrompts": sum(len(p.get('prompts', [])) 
                                  for ch in chapters 
                                  for p in ch.get('problems', []))
            },
            "chapters": chapters
        }
        
        try:
            # Ensure output directory exists
            self.output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(self.output_path, 'w', encoding='utf-8') as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
            
            print(f"\n[PARSER] ✓ Saved to {self.output_path}")
            print(f"[PARSER]   - {output['metadata']['totalChapters']} chapter(s)")
            print(f"[PARSER]   - {output['metadata']['totalProblems']} problem(s)")
            print(f"[PARSER]   - {output['metadata']['totalPrompts']} prompt(s)")
            return True
        except Exception as e:
            print(f"[PARSER] ✗ Failed to save: {e}")
            return False
    
    def parse(self):
        """Main parse orchestration"""
        print("\n" + "="*60)
        print("USTAV BOOK PARSER - PRODUCTION MODE")
        print("Zero Tolerance Quality Standard")
        print("="*60 + "\n")
        
        # Load book
        if not self.load_book():
            return False
        
        # Parse Chapter 1
        chapter = self.parse_chapter_1()
        if not chapter:
            print("[PARSER] ✗ Failed to parse Chapter 1")
            return False
        
        chapters = [chapter]
        
        # Save to file
        if not self.save(chapters):
            return False
        
        print("\n[PARSER] ✓ PARSE COMPLETE\n")
        return True

# Run parser
if __name__ == "__main__":
    parser = USTAVParser()
    success = parser.parse()
    exit(0 if success else 1)
