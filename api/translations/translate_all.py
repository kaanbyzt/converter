import json
import os
import urllib.request
import urllib.parse
import time
import sys

# Set encoding for output to prevent print errors
sys.stdout.reconfigure(encoding='utf-8')

# Config
LANGS = ["en", "de", "fr", "es", "ru", "ar", "zh"]
SOURCE_LANG = "tr"
BATCH_SIZE = 30
DELAY = 1.2  # delay in seconds between API requests

source_path = r"C:\Users\QUART\Desktop\converter-main\api\translations\extracted_tr.json"
cache_dir = r"C:\Users\QUART\Desktop\converter-main\api\translations\cache"
os.makedirs(cache_dir, exist_ok=True)

with open(source_path, "r", encoding="utf-8") as f:
    source_data = json.load(f)

print(f"Loaded {len(source_data)} keys from source.")

def get_cache_path(lang):
    return os.path.join(cache_dir, f"cache_{lang}.json")

def load_cache(lang):
    path = get_cache_path(lang)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_cache(lang, data):
    path = get_cache_path(lang)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def translate_single(text, target_lang):
    """Translate a single text string using Google Translate free API."""
    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": SOURCE_LANG,
        "tl": target_lang,
        "dt": "t",
        "q": text
    }
    query_string = urllib.parse.urlencode(params)
    req = urllib.request.Request(f"{url}?{query_string}", headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            # Google Translate returns a nested list of sentences
            result = ""
            if data and data[0]:
                for part in data[0]:
                    if part and part[0]:
                        result += part[0]
            return result.strip()
    except Exception as e:
        print(f"Error translating single string for {target_lang}: {e}")
        return None

def translate_batch(texts, target_lang):
    """Translate a batch of texts joined by newline."""
    joined_text = "\n".join(texts)
    result_text = translate_single(joined_text, target_lang)
    if not result_text:
        return None
    
    # Split back by newline
    # Note: Google translate sometimes replaces \n with space or slightly modifies it
    # We will split by newline. If it doesn't match the original length, we return None
    # so we can fall back to one-by-one translation.
    translated_lines = [line.strip() for line in result_text.split("\n")]
    
    # If the number of lines is close, let's see. But to be safe, we check if it is exact.
    if len(translated_lines) == len(texts):
        return translated_lines
    else:
        print(f"Batch mismatch: requested {len(texts)} lines, got {len(translated_lines)} lines for {target_lang}.")
        return None

# Translate for each language
for lang in LANGS:
    cache = load_cache(lang)
    print(f"\nProcessing language: {lang} (Currently cached: {len(cache)} / {len(source_data)})")
    
    # Find keys that need translation
    keys_to_translate = [k for k in source_data.keys() if k not in cache]
    
    if not keys_to_translate:
        print(f"All keys for {lang} are already translated.")
        continue
        
    print(f"Translating {len(keys_to_translate)} keys for {lang}...")
    
    # Process in batches
    for i in range(0, len(keys_to_translate), BATCH_SIZE):
        batch_keys = keys_to_translate[i:i+BATCH_SIZE]
        batch_texts = [source_data[k] for k in batch_keys]
        
        print(f"Translating batch {i // BATCH_SIZE + 1} ({len(batch_keys)} keys)...")
        
        translated_batch = None
        # Try batch translation first
        try:
            translated_batch = translate_batch(batch_texts, lang)
            time.sleep(DELAY)
        except Exception as e:
            print(f"Batch translation exception: {e}")
            
        if translated_batch:
            # Batch succeeded, save to cache
            for k, val in zip(batch_keys, translated_batch):
                cache[k] = val
            save_cache(lang, cache)
            print(f"Saved batch to cache. Total translated for {lang}: {len(cache)}")
        else:
            # Fallback to single translation
            print(f"Falling back to individual translation for this batch...")
            for k, text in zip(batch_keys, batch_texts):
                val = translate_single(text, lang)
                if val:
                    cache[k] = val
                    save_cache(lang, cache)
                time.sleep(DELAY)
            print(f"Completed individual translations for batch. Total translated: {len(cache)}")

print("\nTranslation script finished successfully!")
