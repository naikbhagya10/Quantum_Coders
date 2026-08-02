import re

with open('frontend/src/i18n/translations.js', encoding='utf-8') as f:
    text = f.read()

lang_blocks = re.findall(r"(English|Kannada|Hindi):\s*\{(.*?)\n\s*\},", text, flags=re.S)
for lang, block in lang_blocks:
    keys = []
    for m in re.finditer(r"^\s*([A-Za-z0-9_]+):", block, flags=re.M):
        keys.append(m.group(1))
    dupes = [k for k, count in ((k, keys.count(k)) for k in set(keys)) if count > 1]
    print(f'{lang} key count {len(keys)}, duplicates {len(dupes)}')
    if dupes:
        print(dupes)
