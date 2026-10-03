import sys

with open('client/src/pages/dashboard/CooperativeDashboard.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

animals_start = '''<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.extra.allAnimals}</h1>
        </div>
      </header>
      <section className="coop-priority-section">'''

animals_new_start = '''<header className="coop-header">
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
        <section className="coop-priority-section">'''

code = code.replace(animals_start, animals_new_start)

farms_start = '''<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.extra.allFarms}</h1>
        </div>
      </header>
      <section className="coop-priority-section">'''

farms_new_start = '''<header className="coop-header">
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
        <section className="coop-priority-section">'''

code = code.replace(farms_start, farms_new_start)


alerts_start = '''<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.ui.openAlerts}</h1>
        </div>
      </header>
      <section className="coop-priority-section">'''

alerts_new_start = '''<header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.ui.openAlerts}</h1>
        </div>
      </header>
      <div className="coop-dashboard-body">
        <section className="coop-priority-section">'''

code = code.replace(alerts_start, alerts_new_start)

end_tag = '''          </tbody>
        </table>
      </section>
    </>'''

new_end_tag = '''          </tbody>
        </table>
      </section>
      </div>
    </>'''

code = code.replace(end_tag, new_end_tag, 3)

with open('client/src/pages/dashboard/CooperativeDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
