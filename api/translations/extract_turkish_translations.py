import subprocess
import re
import os
import json

def get_git_diff():
    # Run git diff without context to get exact replacements, read as bytes
    res = subprocess.run(
        ["git", "diff", "-U0", "api/templates"],
        capture_output=True,
        cwd=r"c:\Users\QUART\Desktop\converter-main"
    )
    # Decode as UTF-8 with replace/ignore for any non-utf8 parts
    return res.stdout.decode('utf-8', errors='replace')

def parse_diff(diff_text):
    # Regex to find t('key') or t('key')|tojson or t('key')|safe
    key_regex = re.compile(r"t\(\s*'([^']+)'\s*(?:,\s*.*?)?\)")
    
    file_mappings = {}
    current_file = None
    
    hunks = []
    current_hunk = {"deleted": [], "added": []}
    
    lines = diff_text.splitlines()
    for line in lines:
        if line.startswith("diff --git"):
            if hunks and current_file:
                file_mappings[current_file] = hunks
                hunks = []
            # Extract file path
            m = re.search(r"b/(api/templates/\S+)", line)
            if m:
                current_file = m.group(1)
            else:
                current_file = None
        elif line.startswith("@@"):
            if current_hunk["deleted"] or current_hunk["added"]:
                hunks.append(current_hunk)
                current_hunk = {"deleted": [], "added": []}
        elif line.startswith("-") and not line.startswith("---"):
            current_hunk["deleted"].append(line[1:])
        elif line.startswith("+") and not line.startswith("+++"):
            current_hunk["added"].append(line[1:])
            
    if current_hunk["deleted"] or current_hunk["added"]:
        hunks.append(current_hunk)
    if hunks and current_file:
        file_mappings[current_file] = hunks

    # Now extract keys and map to original Turkish strings
    key_to_tr = {}
    
    for filename, file_hunks in file_mappings.items():
        for hunk in file_hunks:
            deleted = hunk["deleted"]
            added = hunk["added"]
            
            # If the number of deleted and added lines matches, we try to align them line-by-line
            if len(deleted) == len(added):
                for del_line, add_line in zip(deleted, added):
                    # Find all key references in the added line
                    keys = key_regex.findall(add_line)
                    if not keys:
                        continue
                    
                    # If there's exactly one key reference in the line, try to extract the original text
                    if len(keys) == 1:
                        key = keys[0]
                        # Replace the t('key') pattern in the added line with a regex group to match anything
                        t_call_match = key_regex.search(add_line)
                        if t_call_match:
                            start, end = t_call_match.span()
                            prefix = add_line[:start]
                            suffix = add_line[end:]
                            
                            val = extract_value(del_line, add_line, key)
                            if val:
                                key_to_tr[key] = val
            else:
                # If they don't match, let's see if we can do some simple matches
                # e.g., if there's only one deleted line and one added line with a translation key
                if len(deleted) == 1 and len(added) == 1:
                    keys = key_regex.findall(added[0])
                    if len(keys) == 1:
                        val = extract_value(deleted[0], added[0], keys[0])
                        if val:
                            key_to_tr[keys[0]] = val

    return key_to_tr

def extract_value(del_line, add_line, key):
    # We want to find the value of key in del_line that corresponds to t('key') in add_line.
    jinja_pattern = r"\{\{\s*t\(\s*'" + re.escape(key) + r"'\s*(?:,\s*.*?)?\)(?:\|[a-z]+)?\s*\}\}"
    m = re.search(jinja_pattern, add_line)
    if m:
        escaped_add = re.escape(add_line)
        escaped_match = re.escape(m.group(0))
        pattern = "^" + escaped_add.replace(escaped_match, "(.*)") + "$"
        pattern = pattern.replace(r"\ ", r"\s*")
        try:
            match = re.match(pattern, del_line)
            if match:
                return match.group(1).strip()
        except Exception:
            pass
            
    js_pattern = r"\bt\(\s*'" + re.escape(key) + r"'\s*\)"
    m = re.search(js_pattern, add_line)
    if m:
        escaped_add = re.escape(add_line)
        escaped_match = re.escape(m.group(0))
        pattern = "^" + escaped_add.replace(escaped_match, r"(['\"`])(.*)\1") + "$"
        pattern = pattern.replace(r"\ ", r"\s*")
        try:
            match = re.match(pattern, del_line)
            if match:
                return match.group(2).strip()
        except Exception:
            pass
            
    # Clean tags fallback
    clean_del = re.sub(r"<[^>]+>", "", del_line).strip()
    clean_add = re.sub(r"<[^>]+>", "", add_line).strip()
    if clean_add.startswith("{{") and clean_add.endswith("}}"):
        if key in clean_add:
            return clean_del

    return None

if __name__ == "__main__":
    diff_text = get_git_diff()
    key_to_tr = parse_diff(diff_text)
    print(f"Extracted {len(key_to_tr)} Turkish translations from git diff!")
    
    # Save to a json file
    output_path = r"C:\Users\QUART\Desktop\converter-main\api\translations\extracted_tr.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(key_to_tr, f, ensure_ascii=False, indent=2)
    print(f"Saved to: {output_path}")
