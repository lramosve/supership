from pathlib import Path

exts = {'.ts', '.tsx', '.js', '.jsx', '.md'}
skip = {'node_modules', '.git', 'dist', '.vercel'}
files = 0
lines = 0
for p in Path('.').rglob('*'):
    if not p.is_file():
        continue
    if any(part in skip for part in p.parts):
        continue
    if p.suffix in exts:
        files += 1
        with open(p, 'r', encoding='utf-8', errors='ignore') as f:
            lines += sum(1 for _ in f)

print(f'files={files}')
print(f'lines={lines}')

tests = []
for p in Path('.').rglob('*test.*'):
    if p.is_file() and not any(part in skip for part in p.parts):
        tests.append(p)

print(f'test_files={len(tests)}')
for p in tests:
    print(p.as_posix())
