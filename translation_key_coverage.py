import re

with open('frontend/src/i18n/translations.js', encoding='utf-8') as f:
    text = f.read()

blocks = re.findall(r"(English|Kannada|Hindi):\s*\{(.*?)\n\s*\},", text, flags=re.S)
keys_by_lang = {}
for lang, block in blocks:
    keys = [m.group(1) for m in re.finditer(r"^\s*([A-Za-z0-9_]+):", block, flags=re.M)]
    keys_by_lang[lang] = set(keys)
all_keys = set().union(*keys_by_lang.values())
for lang, keys in keys_by_lang.items():
    missing = sorted(all_keys - keys)
    print(f'{lang}: {len(keys)} keys, missing {len(missing)}')
    if missing:
        print(', '.join(missing[:20]))
        if len(missing) > 20:
            print('...')
