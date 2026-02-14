
sections = ['INDEX OF TERMS', 'MASTER BIBLIOGRAPHY', 'PREFACE', 'AI SOLVED BUSINESS PROBLEMS', 'AFTERWORD']
with open('C:/PRIVATE/AI/AISBS/AI SOLVED BUSINESS PROBLEMS PREFACE.txt', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        for s in sections:
            if s in line:
                print(f"{s} (Line {i+1}): {line.strip()}")
