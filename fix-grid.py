import sys

with open('client/src/pages/dashboard/dashboard.css', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    'grid-template-columns: 1fr 360px;',
    'grid-template-columns: 1fr 480px;'
)

with open('client/src/pages/dashboard/dashboard.css', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
