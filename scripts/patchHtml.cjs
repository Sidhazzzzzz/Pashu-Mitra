const fs = require('fs');
let html = fs.readFileSync('client/index.html', 'utf8');
html = html.replace('<link rel="icon" type="image/png" href="/logo.png" />', '<link rel="icon" type="image/svg+xml" href="/logo-square.svg" />');
fs.writeFileSync('client/index.html', html);
