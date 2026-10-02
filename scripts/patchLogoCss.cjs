const fs = require('fs');
let css = fs.readFileSync('client/src/pages/dashboard/dashboard.css', 'utf8');

const oldCss = `.coop-sidebar-logo img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}`;

const newCss = `.coop-sidebar-logo img {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  object-fit: contain;
  background-color: white;
  padding: 4px;
}`;

css = css.replace(oldCss, newCss);
fs.writeFileSync('client/src/pages/dashboard/dashboard.css', css);
