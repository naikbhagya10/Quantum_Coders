import os
import re

base = 'frontend/src'
keys = set()
for root, _, files in os.walk(base):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            path = os.path.join(root, f)
            text = open(path, encoding='utf-8').read()
            for m in re.finditer(r"t\(\s*['\"]([A-Za-z0-9_]+)['\"]\s*\)", text):
                keys.add(m.group(1))
print('CODE_KEYS', len(keys))

text = open('frontend/src/i18n/translations.js', encoding='utf-8').read()
trans_keys = set(re.findall(r"\s*([A-Za-z0-9_]+):\s*['\"]", text))
print('TRANSLATION_KEYS', len(trans_keys))
missing = sorted([k for k in keys if k not in trans_keys])
print('MISSING_FROM_TRANSLATIONS', len(missing))
print(missing)
seen = {}
dups = []
for m in re.finditer(r"\s*([A-Za-z0-9_]+):\s*['\"]", text):
    k = m.group(1)
    if k in seen and k not in dups:
        dups.append(k)
    seen[k] = seen.get(k, 0) + 1
print('DUPLICATES', dups)
