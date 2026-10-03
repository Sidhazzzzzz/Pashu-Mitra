const fs = require('fs');
let css = fs.readFileSync('client/src/pages/dashboard/dashboard.css', 'utf8');

css = css.replace('.coop-layout {\n  zoom: 0.75;\n  display: flex;', '.coop-layout {\n  display: flex;');

const zoomCss = \
@media (min-width: 901px) {
  .coop-layout {
    zoom: 0.75;
    min-height: 133.34vh;
  }
}
\;

css += zoomCss;

fs.writeFileSync('client/src/pages/dashboard/dashboard.css', css);
