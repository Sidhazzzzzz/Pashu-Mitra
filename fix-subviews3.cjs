const fs = require('fs');
let code = fs.readFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', 'utf8');

const animalsStart = \<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.extra.allAnimals}</h1>
        </div>
      </header>
      <section className="coop-priority-section">\;

const animalsNewStart = \<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.extra.allAnimals}</h1>
        </div>
      </header>
      <div className="coop-stats-grid" style={{marginBottom: 24}}>
        <div className="coop-stat-card">
          <div className="coop-stat-icon" style={{background: '#e8f5e9', color: '#1f5a45'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div>
            <div className="coop-stat-value">{data.stats.totalCows}</div>
            <div className="coop-stat-sub">{data.extra.activeAnimals || "Active Animals"}</div>
          </div>
        </div>
        <div className="coop-stat-card">
          <div className="coop-stat-icon" style={{background: '#fff3e0', color: '#e2ab5b'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div>
            <div className="coop-stat-value">{data.stats.highRiskCows}</div>
            <div className="coop-stat-sub">{data.extra.subclinicalFlags || "High Risk Flags"}</div>
          </div>
        </div>
      </div>
      <div className="coop-dashboard-body">
        <section className="coop-priority-section">\;

code = code.split(animalsStart).join(animalsNewStart);

const farmsStart = \<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.extra.allFarms}</h1>
        </div>
      </header>
      <section className="coop-priority-section">\;

const farmsNewStart = \<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.extra.allFarms}</h1>
        </div>
      </header>
      <div className="coop-stats-grid" style={{marginBottom: 24}}>
        <div className="coop-stat-card">
          <div className="coop-stat-icon" style={{background: '#e8f5e9', color: '#1f5a45'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          </div>
          <div>
            <div className="coop-stat-value">{farmsMap.size}</div>
            <div className="coop-stat-sub">{data.extra.registeredFarms || "Total Farms"}</div>
          </div>
        </div>
      </div>
      <div className="coop-dashboard-body">
        <section className="coop-priority-section">\;

code = code.split(farmsStart).join(farmsNewStart);

const alertsStart = \<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.ui.openAlerts}</h1>
        </div>
      </header>
      <section className="coop-priority-section">\;

const alertsNewStart = \<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.ui.openAlerts}</h1>
        </div>
      </header>
      <div className="coop-dashboard-body">
        <section className="coop-priority-section">\;

code = code.split(alertsStart).join(alertsNewStart);

// Now, we must close the \</div>\ for these three views.
// We can find where the view ends.
const endTag = \          </tbody>
        </table>
      </section>
    </>\;
const newEndTag = \          </tbody>
        </table>
      </section>
      </div>
    </>\;

// There are exactly 3 tables that we need to close the div for (Animals, Farms, Alerts).
// And they all end with this exact string. Wait! Let's make sure.
let count = 0;
code = code.replace(new RegExp(endTag.replace(/[-\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&'), 'g'), (match) => {
  count++;
  if (count <= 3) {
    return newEndTag;
  }
  return match;
});

fs.writeFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', code);
console.log('Replaced count:', count);
