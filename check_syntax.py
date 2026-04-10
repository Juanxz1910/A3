import re
from pathlib import Path
text = Path('A3.html').read_text(encoding='utf-8')
m = re.search(r'<script[^>]*type=["\']text/babel["\'][^>]*>(.*?)</script>', text, re.S)
if not m:
    print('NO SCRIPT FOUND')
    raise SystemExit(1)
code = m.group(1)
print('SCRIPT LENGTH', len(code))
pairs = {'(':')','[':']','{':'}'}
stack=[]
quote=None
escape=False
i=0
error=None
while i < len(code):
    ch=code[i]
    if quote:
        if escape:
            escape=False
        elif ch=='\\':
            escape=True
        elif ch==quote:
            quote=None
    else:
        if ch in ('"',"'",'`'):
            quote=ch
        elif ch=='/' and i+1 < len(code) and code[i+1]=='/':
            j = code.find('\n', i+2)
            i = len(code) if j==-1 else j
        elif ch=='/' and i+1 < len(code) and code[i+1]=='*':
            j = code.find('*/', i+2)
            if j==-1:
                error='unclosed comment'
                break
            code = code[:i] + ' '*(j+2-i) + code[j+2:]
        elif ch in pairs:
            stack.append((ch,i))
        elif ch in pairs.values():
            if not stack:
                error=f'unmatched closing {ch} at {i}'
                break
            op,oi = stack.pop()
            if pairs[op] != ch:
                error=f'mismatched {op} {ch} at {i}'
                break
    i += 1
if error:
    print(error)
elif stack:
    print('unmatched open', stack[-1])
else:
    print('balanced')
