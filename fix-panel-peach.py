import sys

with open('client/src/components/dashboard/AnimalPanel.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Chart wrapper background
code = code.replace(
    '''<div style={{background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px', marginBottom: 12, border: '1px solid rgba(255,255,255,0.1)'}}>''',
    '''<div style={{background: '#ffe4c4', borderRadius: 16, padding: '20px', marginBottom: 12, border: '1px solid rgba(0,0,0,0.05)'}}>'''
)

# 2. Score colors
code = code.replace(
    '''<span style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#ffffff'}}>{displayScore}</span>''',
    '''<span style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#1f5a45'}}>{displayScore}</span>'''
)
code = code.replace(
    '''<span style={{fontSize: '1rem', color: '#a3c4b3', fontWeight: 600}}>/100</span>''',
    '''<span style={{fontSize: '1rem', color: '#2c3e2e', fontWeight: 600}}>/100</span>'''
)

# 3. XAxis styling
code = code.replace(
    '''<XAxis 
                dataKey="day" 
                stroke="#a3c4b3" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tick={{fill: '#a3c4b3'}}
                dy={10}
              />''',
    '''<XAxis 
                dataKey="day" 
                stroke="#2c3e2e" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tick={{fill: '#2c3e2e'}}
                dy={10}
              />'''
)

# 4. Also CartesianGrid should be darker if it was white
code = code.replace(
    '''<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />''',
    '''<CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />'''
)

with open('client/src/components/dashboard/AnimalPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
