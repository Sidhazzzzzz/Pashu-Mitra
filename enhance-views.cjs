const fs = require('fs'); let code = fs.readFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', 'utf8');

// AnimalsView enhancement
code = code.replace(
  '        <header className="coop-header">',
          <header className="coop-header">\n          <div className="coop-title-row">\n            <h1>{data.extra.allAnimals}</h1>\n          </div>\n        </header>\n\n        <div className="coop-stats-grid" style={{marginBottom: 24}}>\n          <div className="coop-stat-card">\n            <div className="coop-stat-icon" style={{background: '#e8f5e9', color: '#1f5a45'}}>\n              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>\n            </div>\n            <div>\n              <div className="coop-stat-value">{data.stats.totalCows}</div>\n              <div className="coop-stat-sub">Total Monitored</div>\n            </div>\n          </div>\n          <div className="coop-stat-card">\n            <div className="coop-stat-icon" style={{background: '#fff3e0', color: '#e2ab5b'}}>\n              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>\n            </div>\n            <div>\n              <div className="coop-stat-value">{data.stats.highRiskCows}</div>\n              <div className="coop-stat-sub">High Risk</div>\n            </div>\n          </div>\n        </div>\n\n        <!-- OLD HEADER WAS HERE -->
);

// We need to clean up the double header
code = code.replace(
  '        <header className="coop-header">\n          <div className="coop-title-row">\n            <h1>{data.extra.allAnimals}</h1>\n          </div>\n        </header>\n\n        <!-- OLD HEADER WAS HERE -->\n        <header className="coop-header">',
  '        <header className="coop-header">'
); // Wait, this regex approach is messy. I will rewrite the functions directly.

