const fs = require('fs');
let code = fs.readFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', 'utf8');

// 1. AnimalsView
code = code.replace(
  '<header className="coop-header">\\n        <div className="coop-title-row">\\n          <h1>{data.extra.allAnimals}</h1>\\n        </div>\\n      </header>\\n      <section className="coop-priority-section">',
  '<header className="coop-header">\\n        <div className="coop-title-row">\\n          <h1>{data.extra.allAnimals}</h1>\\n        </div>\\n      </header>\\n      <div className="coop-stats-grid" style={{marginBottom: 24}}>\\n        <div className="coop-stat-card">\\n          <div className="coop-stat-icon" style={{background: \\'#e8f5e9\\', color: \\'#1f5a45\\'}}>\\n            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>\\n          </div>\\n          <div>\\n            <div className="coop-stat-value">{data.stats.totalCows}</div>\\n            <div className="coop-stat-sub">Total Monitored</div>\\n          </div>\\n        </div>\\n        <div className="coop-stat-card">\\n          <div className="coop-stat-icon" style={{background: \\'#fff3e0\\', color: \\'#e2ab5b\\'}}>\\n            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>\\n          </div>\\n          <div>\\n            <div className="coop-stat-value">{data.stats.highRiskCows}</div>\\n            <div className="coop-stat-sub">High Risk Flags</div>\\n          </div>\\n        </div>\\n      </div>\\n      <section className="coop-priority-section">'
);

// 2. AnimalsView table row fix
code = code.replace(
  /<td>\\s*<div style={{display: 'flex', alignItems: 'center', gap: 8}}>\\s*<div[^>]*>\\s*<\\/div>\\s*<div>\\s*<strong>{cow.name}<\\/strong>\\s*<div[^>]*>[^<]*<\\/div>\\s*<\\/div>\\s*<\\/div>\\s*<\\/td>/m,
  '<td>\\n                  <div style={{display: \\'flex\\', alignItems: \\'center\\', gap: 12}}>\\n                    <div className="coop-animal-avatar" style={{background: \\hsl(, 70%, 90%)\\, color: \\hsl(, 70%, 30%)\\}}>\\n                      {cow.name.substring(0, 2)}\\n                    </div>\\n                    <div>\\n                      <strong>{cow.name}</strong>\\n                      <div style={{color: \\'#8c9a8f\\', fontSize: \\'0.85rem\\'}}>\\n                        {cow.tag} • Batt: {cow.sensor.battery}%\\n                      </div>\\n                    </div>\\n                  </div>\\n                </td>'
);

// 3. FarmsView
code = code.replace(
  '<header className="coop-header">\\n        <div className="coop-title-row">\\n          <h1>{data.extra.allFarms}</h1>\\n        </div>\\n      </header>\\n      <section className="coop-priority-section">',
  '<header className="coop-header">\\n        <div className="coop-title-row">\\n          <h1>{data.extra.allFarms}</h1>\\n        </div>\\n      </header>\\n      <div className="coop-stats-grid" style={{marginBottom: 24}}>\\n        <div className="coop-stat-card">\\n          <div className="coop-stat-icon" style={{background: \\'#e8f5e9\\', color: \\'#1f5a45\\'}}>\\n            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>\\n          </div>\\n          <div>\\n            <div className="coop-stat-value">{farmsMap.size}</div>\\n            <div className="coop-stat-sub">Total Farms</div>\\n          </div>\\n        </div>\\n      </div>\\n      <section className="coop-priority-section">'
);

// 4. AlertsView
code = code.replace(
  '<header className="coop-header">\\n        <div className="coop-title-row">\\n          <h1>{data.ui.openAlerts}</h1>\\n        </div>\\n      </header>\\n      <section className="coop-priority-section">',
  '<header className="coop-header">\\n        <div className="coop-title-row">\\n          <h1>{data.ui.openAlerts}</h1>\\n        </div>\\n      </header>\\n      <div className="coop-stats-grid" style={{marginBottom: 24}}>\\n        <div className="coop-stat-card">\\n          <div className="coop-stat-icon" style={{background: \\'#fff3e0\\', color: \\'#e2ab5b\\'}}>\\n            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>\\n          </div>\\n          <div>\\n            <div className="coop-stat-value">{data.alerts.length}</div>\\n            <div className="coop-stat-sub">Active Alerts</div>\\n          </div>\\n        </div>\\n      </div>\\n      <section className="coop-priority-section">'
);

fs.writeFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', code);

