import sys

with open('client/src/pages/dashboard/CooperativeDashboard.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    "<div style={{flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 24}}>",
    "<div style={{flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: 24}}>"
)

code = code.replace(
    "<aside style={{width: 320, flexShrink: 0}}>",
    "<aside style={{width: 480, flexShrink: 0}}>"
)

with open('client/src/pages/dashboard/CooperativeDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
