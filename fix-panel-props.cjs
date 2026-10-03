const fs = require('fs');
let code = fs.readFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', 'utf8');

code = code.replace(/<AnimalPanel cow=\{selectedCow\} getRiskForecast=\{data\.getRiskForecast\} dynamicUi=\{data\.dynamicUi\} \n*takeReading=\{data\.takeReading\} \/>/g, '<AnimalPanel cow={selectedCow} getRiskForecast={data.getRiskForecast} extra={data.extra} dynamicUi={data.dynamicUi} takeReading={data.takeReading} />');
code = code.replace(/<AnimalPanel cow=\{selectedCow\} getRiskForecast=\{data\.getRiskForecast\} dynamicUi=\{data\.dynamicUi\} takeReading=\{data\.takeReading\} \/>/g, '<AnimalPanel cow={selectedCow} getRiskForecast={data.getRiskForecast} extra={data.extra} dynamicUi={data.dynamicUi} takeReading={data.takeReading} />');

fs.writeFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', code);
