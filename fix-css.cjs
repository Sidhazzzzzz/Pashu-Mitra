const fs = require('fs');
let css = fs.readFileSync('client/src/pages/dashboard/dashboard.css', 'utf8');

css = css.replace(/body\.cooperative-mode \{[\s\S]*?\}/g, '');
css = css.replace(/\.coop-layout \{/, '.coop-layout {\n  zoom: 0.75;');

fs.writeFileSync('client/src/pages/dashboard/dashboard.css', css);
