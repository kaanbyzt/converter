import os
import re
import sys
import json

sys.path.append(r"c:\Users\QUART\Desktop\converter-main\api")

from translations import ALL_TRANSLATIONS

template_dir = r"c:\Users\QUART\Desktop\converter-main\api\templates"
# Regex matching calls to t('some_key')
pattern = re.compile(r"\b[t]\(\s*'([^']+)'\s*(?:,\s*.*?)?\)")

all_keys_in_templates = {}

for root, dirs, files in os.walk(template_dir):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                for line_idx, line in enumerate(f, 1):
                    matches = pattern.findall(line)
                    for m in matches:
                        if m not in all_keys_in_templates:
                            all_keys_in_templates[m] = []
                        all_keys_in_templates[m].append({
                            "file": file,
                            "line": line_idx,
                            "content": line.strip()
                        })

supported_langs = ["tr", "en", "de", "fr", "es", "ru", "ar", "zh"]
report = {
    "total_keys_found": len(all_keys_in_templates),
    "languages": {}
}

for lang in supported_langs:
    lang_translations = ALL_TRANSLATIONS.get(lang, {})
    missing = {}
    for key, occs in all_keys_in_templates.items():
        if key not in lang_translations:
            missing[key] = occs
    
    report["languages"][lang] = {
        "missing_count": len(missing),
        "missing_keys": sorted(list(missing.keys()))
    }

# Save JSON report to artifacts folder or local dir
report_path = r"C:\Users\QUART\.gemini\antigravity-ide\brain\dc21c738-e688-421e-b40e-eb56eca1f4a1\scratch\missing_keys_report.json"
os.makedirs(os.path.dirname(report_path), exist_ok=True)
with open(report_path, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"Report successfully saved to: {report_path}")
print(f"Total keys found in templates: {report['total_keys_found']}")
for lang, stats in report['languages'].items():
    print(f"  {lang}: {stats['missing_count']} missing keys")

