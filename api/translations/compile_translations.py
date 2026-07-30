import json
import os
import sys

# Set encoding
sys.stdout.reconfigure(encoding='utf-8')

LANGS = ["tr", "en", "de", "fr", "es", "ru", "ar", "zh"]
source_path = r"C:\Users\QUART\Desktop\converter-main\api\translations\extracted_tr.json"
cache_dir = r"C:\Users\QUART\Desktop\converter-main\api\translations\cache"
pages_dir = r"C:\Users\QUART\Desktop\converter-main\api\translations\pages"

os.makedirs(pages_dir, exist_ok=True)

# Load Turkish originals
with open(source_path, "r", encoding="utf-8") as f:
    tr_data = json.load(f)

# Load translated caches
translations = {
    "tr": tr_data
}

for lang in LANGS:
    if lang == "tr":
        continue
    cache_path = os.path.join(cache_dir, f"cache_{lang}.json")
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            translations[lang] = json.load(f)
    else:
        translations[lang] = {}
        print(f"Warning: Cache for {lang} not found.")

# Group keys by page module
def get_page_module(key):
    if key.startswith("ai_tools"):
        return "ai_tools"
    elif key.startswith("pdf_") or key.startswith("img_to_pdf"):
        return "pdf_tools"
    elif key.startswith("convert_"):
        return "convert_tools"
    elif key.startswith("mk_"):
        return "mikrotik_tools"
    elif key.startswith("changelog"):
        return "changelog"
    else:
        return "misc_tools"

grouped_keys = {}
for key in tr_data.keys():
    module = get_page_module(key)
    if module not in grouped_keys:
        grouped_keys[module] = []
    grouped_keys[module].append(key)

# Generate python module files
for module, keys in grouped_keys.items():
    module_path = os.path.join(pages_dir, f"{module}.py")
    print(f"Generating {module_path} with {len(keys)} keys...")
    
    # Build PAGES dictionary structure
    pages_dict = {}
    for lang in LANGS:
        pages_dict[lang] = {}
        lang_trans = translations.get(lang, {})
        for key in keys:
            # Fallback to Turkish if translation is missing
            val = lang_trans.get(key, tr_data[key])
            pages_dict[lang][key] = val

    # Write as python module code
    with open(module_path, "w", encoding="utf-8") as f:
        f.write(f'"""Translations for {module} page group."""\n\n')
        f.write('PAGES = {\n')
        for lang in LANGS:
            f.write(f'    "{lang}": {{\n')
            for key in sorted(keys):
                val = pages_dict[lang][key]
                # Escape double quotes and backslashes for python string
                escaped_val = val.replace('\\', '\\\\').replace('"', '\\"')
                f.write(f'        "{key}": "{escaped_val}",\n')
            f.write('    },\n')
        f.write('}\n')

print("All translation modules generated successfully!")
