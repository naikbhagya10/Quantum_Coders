import re

text = open('frontend/src/i18n/translations.js', encoding='utf-8').read()
blocks = re.findall(r"(English|Kannada|Hindi):\s*\{(.*?)\n\s*\},", text, flags=re.S)
keys = {}
for lang, block in blocks:
    ks = [m.group(1) for m in re.finditer(r"^\s*([A-Za-z0-9_]+):", block, flags=re.M)]
    keys[lang] = ks
all_keys = set(keys['English'])
for lang in ['Kannada', 'Hindi']:
    missing = [k for k in keys['English'] if k not in keys[lang]]
    print(lang, len(missing))
    for k in missing:
        print(k)
    print()
