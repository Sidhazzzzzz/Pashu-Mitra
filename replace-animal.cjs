const fs = require('fs');
let code = fs.readFileSync('client/src/components/dashboard/AnimalPanel.tsx', 'utf8');

code = code.split('>Selected Animal</div>').join('>{data.extra.selectedAnimalTitle || "Selected Animal"}</div>');
fs.writeFileSync('client/src/components/dashboard/AnimalPanel.tsx', code);
