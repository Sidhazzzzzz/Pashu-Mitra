import sys

with open('client/src/components/dashboard/AnimalPanel.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix header text
code = code.replace(
    '''color: '#a3c4b3', marginBottom: 6''',
    '''color: '#6c7a6f', marginBottom: 6'''
)
code = code.replace(
    '''color: '#ffffff'}''',
    '''color: '#1f5a45'}'''
)
code = code.replace(
    '''color: '#a3c4b3'}''',
    '''color: '#6c7a6f'}'''
)

# Fix sensor tiles
code = code.replace(
    '''background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',''',
    '''background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)','''
)
# We already changed all instances of color: '#ffffff' to '#1f5a45' in the header.
# Wait, let's see if that replaced the sensor tiles too.
# The sensor tiles use: color: '#ffffff', lineHeight: 1}
# Our replace was color: '#ffffff'}, which wouldn't match.

code = code.replace(
    '''color: '#ffffff', lineHeight: 1''',
    '''color: '#1f5a45', lineHeight: 1'''
)

code = code.replace(
    '''color: '#a3c4b3', marginBottom: 2''',
    '''color: '#6c7a6f', marginBottom: 2'''
)

with open('client/src/components/dashboard/AnimalPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
