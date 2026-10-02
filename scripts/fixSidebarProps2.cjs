const fs = require('fs');
let dash = fs.readFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', 'utf8');

dash = dash.replace(
  '<Sidebar\\n',
  '<Sidebar\\n        activeAlertsCount={data.alerts.filter(a => a.validation === \\\'active\\\').length}\\n        extra={data.extra}\\n'
);

dash = dash.replace(
  '<Sidebar\r\n',
  '<Sidebar\r\n        activeAlertsCount={data.alerts.filter(a => a.validation === \'active\').length}\r\n        extra={data.extra}\r\n'
);

dash = dash.replace(
  '<Sidebar\n',
  '<Sidebar\n        activeAlertsCount={data.alerts.filter(a => a.validation === \'active\').length}\n        extra={data.extra}\n'
);

fs.writeFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', dash);
