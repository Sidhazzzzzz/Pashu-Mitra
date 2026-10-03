const fs = require('fs');
let code = fs.readFileSync('client/src/components/dashboard/AnimalPanel.tsx', 'utf8');

code = code.replace(
  'export function AnimalPanel({ cow, getRiskForecast }: { cow: Cow | null, getRiskForecast: (history: number[]) => any }) {',
  'export function AnimalPanel({ cow, getRiskForecast, extra }: { cow: Cow | null, getRiskForecast: (history: number[]) => any, extra?: any, dynamicUi?: any, takeReading?: any }) {'
);

code = code.replace(
  '{data.extra.selectedAnimalTitle || "Selected Animal"}',
  '{(extra && extra.selectedAnimalTitle) || "Selected Animal"}'
);

fs.writeFileSync('client/src/components/dashboard/AnimalPanel.tsx', code);
