import sys

with open('client/src/pages/dashboard/dashboard.css', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    '''background: linear-gradient(160deg, #1a4f3d 0%, #1f5a45 40%, #245e4a 100%);
    color: white;''',
    '''background: #fff0e6;
    color: #2c3e2e;'''
)

code = code.replace(
    '''box-shadow: 0 4px 20px rgba(31, 90, 69, 0.3);''',
    '''box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);'''
)

with open('client/src/pages/dashboard/dashboard.css', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
