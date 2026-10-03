import sys
import re

with open('client/src/pages/dashboard/dashboard.css', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(
    r'background:\s*linear-gradient[^;]+;',
    'background: #fff0e6;',
    code
)

code = re.sub(
    r'\.coop-animal-panel\s*\{\s*background:\s*#fff0e6;\s*color:\s*white;',
    '.coop-animal-panel {\n  background: #fff0e6;\n  color: #111812;',
    code
)

with open('client/src/pages/dashboard/dashboard.css', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
