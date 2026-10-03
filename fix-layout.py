import sys
import re

# 1. Update dashboard.css
with open('client/src/pages/dashboard/dashboard.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make graph area broader without making it look squished
css = re.sub(
    r'grid-template-columns:\s*1fr\s*360px;',
    'grid-template-columns: 1fr 440px;',
    css
)

with open('client/src/pages/dashboard/dashboard.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Update CooperativeDashboard.tsx
with open('client/src/pages/dashboard/CooperativeDashboard.tsx', 'r', encoding='utf-8') as f:
    tsx = f.read()

# Table side
tsx = tsx.replace(
    '''<div style={{flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 24}}>''',
    '''<div style={{flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 24}}>'''
)

# Graph aside
tsx = tsx.replace(
    '''<aside style={{width: 320, flexShrink: 0}}>''',
    '''<aside style={{flex: '1 1 440px', minWidth: 280, maxWidth: '100%'}}>'''
)

with open('client/src/pages/dashboard/CooperativeDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(tsx)

print("Done")
