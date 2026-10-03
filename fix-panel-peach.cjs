const fs = require('fs');
let code = fs.readFileSync('client/src/components/dashboard/AnimalPanel.tsx', 'utf8');

// Change chart container background
code = code.replace(
  /<div style=\{\{background: 'rgba\\(255,255,255,0\\.05\\)', borderRadius: 16, padding: '20px', marginBottom: 12, border: '1px solid rgba\\(255,255,255,0\\.1\\)'\}\}>/,
  "<div style={{background: '#FFDAB9', borderRadius: 16, padding: '20px', marginBottom: 12, border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.5)'}}>"
);

// Change text colors in the score
code = code.replace(
  /<span style=\{\{fontSize: '2\\.5rem', fontWeight: 800, lineHeight: 1, color: '#ffffff'\}\}>\{displayScore\}<\/span>/,
  "<span style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#1f5a45'}}>{displayScore}</span>"
);
code = code.replace(
  /<span style=\{\{fontSize: '1rem', color: '#a3c4b3', fontWeight: 600\}\}>\/100<\/span>/,
  "<span style={{fontSize: '1rem', color: '#2c3e2e', fontWeight: 600}}>/100</span>"
);

// Change XAxis tick color
code = code.replace(
  /<XAxis \\n\\s*dataKey="day" \\n\\s*stroke="#a3c4b3" \\n\\s*fontSize=\{11\} \\n\\s*tickLine=\{false\} \\n\\s*axisLine=\{false\}\\n\\s*tick=\{\{fill: '#a3c4b3'\}\}\\n\\s*dy=\{10\}\\n\\s*\/>/m,
  "<XAxis \n                  dataKey=\"day\" \n                  stroke=\"#2c3e2e\" \n                  fontSize={11} \n                  tickLine={false} \n                  axisLine={false}\n                  tick={{fill: '#2c3e2e'}}\n                  dy={10}\n                />"
);

// wait, the XAxis replacement string might be brittle due to formatting, let me just do a generic replace on the stroke and tick fill for XAxis
code = code.replace(/<XAxis([^>]+)stroke="#a3c4b3"([^>]+)tick=\{\{fill: '#a3c4b3'\}\}([^>]+)\/>/g, '<XAxis="#2c3e2e"={{fill: \'#2c3e2e\'}}/>');

fs.writeFileSync('client/src/components/dashboard/AnimalPanel.tsx', code);
