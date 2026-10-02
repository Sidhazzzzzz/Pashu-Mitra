import { useState, useMemo } from "react";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { TopBar } from "../../components/dashboard/TopBar";
import { AnimalPanel } from "../../components/dashboard/AnimalPanel";
import { useCooperativeData } from "../../hooks/useCooperativeData";
import "./dashboard.css";
import type { Cow } from "../../lib/dashboard-data";

export function CooperativeDashboard() {
  const data = useCooperativeData();
  const [activeView, setActiveView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [sortRisk, setSortRisk] = useState(false);
  const [selectedCowId, setSelectedCowId] = useState<string | null>(null);
  const [reviewingRow, setReviewingRow] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  // Apply search and sort for dashboard priority list and full animals list
  const filteredCows = useMemo(() => {
    let result = [...data.cows];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.tag.toLowerCase().includes(q) || 
        c.farm.toLowerCase().includes(q)
      );
    }
    if (sortRisk) {
      const weight = { high: 0, medium: 1, low: 2 };
      result.sort((a, b) => weight[a.risk] - weight[b.risk]);
    }
    return result;
  }, [data.cows, search, sortRisk]);

  const selectedCow = useMemo(() => {
    if (!selectedCowId) return null;
    return data.cows.find(c => c.id === selectedCowId) || null;
  }, [data.cows, selectedCowId]);

  const userName = "Coop Admin";
  const deskName = "District 4 Cooperative";

  // Views
  const renderDashboardView = () => (
    <>
      <header className="coop-header">
        <span className="coop-kicker">Cooperative Field Desk</span>
        <div className="coop-title-row">
          <h1>{data.dynamicUi.welcomeBack}</h1>
          <span className="coop-week-label">{data.stats.weekLabel}</span>
        </div>
        <p className="coop-subtitle">
          A clear picture across Sita Devi's Dairy and nearby farms 
          <span className="coop-phase-label" style={{marginLeft: 12}}>Phase 2 roadmap - cooperative rollout</span>
        </p>
      </header>

      <div className="coop-info-strip">
        <div className="coop-info-item">
          <span className="coop-info-label">District Desk</span>
          <span className="coop-info-value">{deskName}</span>
        </div>
        <div className="coop-info-item">
          <span className="coop-info-label">{data.ui.registeredFarms}</span>
          <span className="coop-info-value">{data.stats.totalFarms}</span>
        </div>
        <div className="coop-info-item">
          <span className="coop-info-label">{data.ui.activeAnimals}</span>
          <span className="coop-info-value">{data.stats.totalCows}</span>
        </div>
        <div className="coop-info-item">
          <span className="coop-info-label">{data.dynamicUi.syncRateLabel || "Telemetry Sync Rate (Connected sensors reporting)"}</span>
          <span className="coop-info-value">{data.stats.syncRate}%</span>
        </div>
        <div className="coop-info-item">
          <span className="coop-info-label">Subclinical Flags</span>
          <span className="coop-info-value">{data.stats.highRiskCows}</span>
        </div>
        <div className="coop-info-item" style={{marginLeft: 'auto'}}>
          <button 
            className="coop-btn coop-btn-primary" 
            onClick={() => data.takeReading()}
            disabled={data.isReading}
          >
            {data.isReading ? data.extra.checking : data.extra.checkCowsNow}
          </button>
        </div>
      </div>

      <div className="coop-stats-grid">
        <div className="coop-stat-card">
          <h3>{data.copy.animals}</h3>
          <div className="coop-stat-value">{data.stats.totalCows}</div>
          <div className="coop-stat-sub">+12 this month</div>
        </div>
        <div className="coop-stat-card">
          <h3>{data.copy.farmsFlagged}</h3>
          <div className="coop-stat-value">{new Set(data.cows.filter(c => c.risk === 'high').map(c => c.farm)).size}</div>
          <div className="coop-stat-sub">Needs follow-up</div>
        </div>
        <div className="coop-stat-card">
          <h3>{data.extra.confirmedCasesMonth}</h3>
          <div className="coop-stat-value">{data.cows.filter(c => c.treatmentStatus === 'under-treatment').length}</div>
          <div className="coop-stat-sub">Treated early</div>
        </div>
        <div className="coop-stat-card">
          <h3>Reading completion</h3>
          <div className="coop-stat-value">{data.stats.syncRate}%</div>
          <div className="coop-stat-sub">{data.extra.acrossFarms(data.stats.totalFarms)}</div>
        </div>
      </div>

      <div className="coop-dashboard-body">
        <section className="coop-priority-section">
          <div className="coop-priority-header">
            <h2>{data.extra.animalsToReview}</h2>
            <div className="coop-priority-controls">
              <input 
                type="text" 
                placeholder={data.extra.searchPlaceholder} 
                className="coop-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <label style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem'}}>
                <input 
                  type="checkbox" 
                  checked={sortRisk}
                  onChange={e => setSortRisk(e.target.checked)}
                />
                {data.extra.sortByRisk}
              </label>
            </div>
          </div>
          
          <table className="coop-table">
            <thead>
              <tr>
                <th>{data.extra.animal}</th>
                <th>{data.extra.farm}</th>
                <th>{data.extra.risk}</th>
                <th>{data.extra.lastReading}</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCows.filter(c => c.risk !== 'low').map(cow => (
                <tr 
                  key={cow.id} 
                  onClick={() => { setSelectedCowId(cow.id); setActiveView('cow-detail'); }}
                  style={{cursor: 'pointer'}}
                >
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <div 
                        title={cow.sensor.state === 'stale' ? 'Offline' : cow.sensor.state === 'low-battery' ? 'Low Battery' : 'Connected'}
                        style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: cow.sensor.state === 'stale' ? '#c86b5e' : cow.sensor.state === 'low-battery' ? '#d99c30' : '#8c9a8f'
                        }} 
                      />
                      <div>
                        <strong>{cow.name}</strong>
                        <div style={{color: '#8c9a8f', fontSize: '0.85rem'}}>
                          {cow.tag} • Batt: {cow.sensor.battery}%
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{cow.farm}</td>
                  <td>
                    <span className={`coop-risk-badge ${cow.risk}`}>{cow.risk}</span>
                    <div style={{fontSize: '0.75rem', color: '#6c7a6f', marginTop: 4}}>{data.getReasonForCow(cow)}</div>
                  </td>
                  <td>{cow.checked}</td>
                  <td>
                    <div className="coop-action-group">
                      {reviewingRow === cow.id ? (
                        <>
                          <button 
                            className="coop-btn coop-btn-primary"
                            onClick={(e) => { e.stopPropagation(); data.resolveVetReview(cow.id, "confirmed"); setReviewingRow(null); }}
                            disabled={data.vetLoadingId !== null}
                          >{data.extra.confirmAlertBtn}</button>
                          <button 
                            className="coop-btn coop-btn-danger"
                            onClick={(e) => { e.stopPropagation(); data.resolveVetReview(cow.id, "false-alarm"); setReviewingRow(null); }}
                            disabled={data.vetLoadingId !== null}
                          >{data.extra.falseAlarmBtn}</button>
                          <button 
                            className="coop-btn coop-btn-outline"
                            onClick={(e) => { e.stopPropagation(); setReviewingRow(null); }}
                          >{data.extra.cancelBtn}</button>
                        </>
                      ) : (
                        <button 
                          className="coop-btn coop-btn-outline"
                          onClick={(e) => { e.stopPropagation(); setReviewingRow(cow.id); }}
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCows.filter(c => c.risk !== 'low').length === 0 && (
                <tr>
                  <td colSpan={5} style={{textAlign: "center", color: "#8c9a8f", padding: "40px 0"}}>
                    {search.trim() ? "No animals match your search." : data.dynamicUi.healthyHerd}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <aside>
          <AnimalPanel cow={selectedCow} getRiskForecast={data.getRiskForecast} dynamicUi={data.dynamicUi} takeReading={data.takeReading} />
        </aside>
      </div>
    </>
  );

  const renderAnimalsView = () => (
    <>
      <header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.extra.allAnimals}</h1>
        </div>
      </header>
      <section className="coop-priority-section">
        <div className="coop-priority-header">
          <div className="coop-priority-controls">
            <input 
              type="text" 
              placeholder={data.extra.searchPlaceholder} 
              className="coop-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <label style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem'}}>
              <input 
                type="checkbox" 
                checked={sortRisk}
                onChange={e => setSortRisk(e.target.checked)}
              />
              {data.extra.sortByRisk}
            </label>
          </div>
        </div>
        
        <table className="coop-table">
          <thead>
            <tr>
              <th>{data.extra.animal}</th>
              <th>{data.extra.farm}</th>
              <th>{data.extra.breed}</th>
              <th>{data.extra.risk}</th>
              <th>{data.extra.lastReading}</th>
            </tr>
          </thead>
          <tbody>
                          {filteredCows.map(cow => (
                <tr 
                  key={cow.id}
                  onClick={() => { setSelectedCowId(cow.id); setActiveView('cow-detail'); }}
                  style={{cursor: 'pointer'}}
                >
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <div 
                        title={cow.sensor.state === 'stale' ? 'Offline' : cow.sensor.state === 'low-battery' ? 'Low Battery' : 'Connected'}
                        style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: cow.sensor.state === 'stale' ? '#c86b5e' : cow.sensor.state === 'low-battery' ? '#d99c30' : '#8c9a8f'
                        }} 
                      />
                      <div>
                        <strong>{cow.name}</strong>
                        <div style={{color: '#8c9a8f', fontSize: '0.85rem'}}>
                          {cow.tag} • Batt: {cow.sensor.battery}%
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{cow.farm}</td>
                <td>{cow.breed}</td>
                <td><span className={`coop-risk-badge ${cow.risk}`}>{cow.risk}</span></td>
                <td>{cow.checked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );

  const renderCowDetailView = () => {
    if (!selectedCow) return <div style={{padding: 24}}>{data.extra.noAnimalSelected}</div>;
    const animalAlerts = data.alerts.filter(a => a.cowId === selectedCow.id);
    const hasActiveAlert = animalAlerts.some(a => a.validation === 'active');
    
    return (
      <div style={{display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap'}}>
        <div style={{flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 24}}>
          <header className="coop-header">
            <button onClick={() => setActiveView('dashboard')} className="coop-btn coop-btn-outline" style={{marginBottom: 16, width: 'fit-content'}}>
              &larr; Back
            </button>
            <div className="coop-title-row">
              <h1>{selectedCow.name} <span style={{fontSize: '1.2rem', color: '#6c7a6f', fontWeight: 'normal'}}>#{selectedCow.tag}</span></h1>
            </div>
            <p className="coop-subtitle">{selectedCow.farm} &middot; {selectedCow.breed}</p>
          </header>

          <div className="coop-stat-card" style={{borderLeft: `4px solid var(--coop-${selectedCow.risk})`}}>
            <h3 style={{fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8, margin: 0}}>
              {data.extra.currentStatus}: <span className={`coop-risk-badge ${selectedCow.risk}`}>{selectedCow.risk} Risk</span>
            </h3>
            <p style={{margin: '8px 0 0 0', color: 'var(--coop-fg)', fontSize: '1rem'}}>
              {data.getReasonForCow(selectedCow)}
            </p>
          </div>
          
          <div className="coop-stats-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
            <div className="coop-stat-card">
              <h3>{data.dynamicUi.ecLabel || 'Electrical Conductivity'}</h3>
              <div className="coop-stat-value">{selectedCow.sensor.ec}</div>
              <div className="coop-stat-sub">Real Model Input</div>
            </div>
            <div className="coop-stat-card">
              <h3>{data.dynamicUi.tempLabel || 'Temperature'}</h3>
              <div className="coop-stat-value">{selectedCow.sensor.temperature}°C</div>
              <div className="coop-stat-sub">Real Model Input</div>
            </div>
          </div>

          <section className="coop-priority-section">
            <div className="coop-priority-header">
              <h2>{data.extra.alertHistoryFor(selectedCow.name)}</h2>
              {hasActiveAlert && (
                <div className="coop-action-group">
                  <button 
                    className="coop-btn coop-btn-primary"
                    onClick={() => data.resolveVetReview(selectedCow.id, "confirmed", animalAlerts.find(a => a.validation === 'active')?.id)}
                    disabled={data.vetLoadingId !== null}
                  >{data.extra.confirmAlertBtn}</button>
                  <button 
                    className="coop-btn coop-btn-danger"
                    onClick={() => data.resolveVetReview(selectedCow.id, "false-alarm", animalAlerts.find(a => a.validation === 'active')?.id)}
                    disabled={data.vetLoadingId !== null}
                  >{data.extra.falseAlarmBtn}</button>

                  <button 
                    className="coop-btn coop-btn-outline"
                    style={{marginLeft: 'auto'}}
                    onClick={() => setContactOpen(true)}
                  >
                    {data.dynamicUi.callVet || 'Call Vet'}
                  </button>
                </div>
              )}
            </div>
            <table className="coop-table">
              <thead>
                <tr>
                  <th>{data.extra.date}</th>
                  <th>{data.extra.time}</th>
                  <th>{data.extra.title}</th>
                  <th>{data.extra.status}</th>
                </tr>
              </thead>
              <tbody>
                {animalAlerts.length > 0 ? animalAlerts.map(alert => (
                  <tr key={alert.id}>
                    <td>{alert.date}</td>
                    <td>{alert.time}</td>
                    <td><strong>{alert.title}</strong></td>
                    <td>
                      <span className={`coop-risk-badge ${alert.validation === 'active' ? 'high' : alert.validation === 'resolved' ? 'low' : alert.validation === 'confirmed' ? 'medium' : 'low'}`}>
                        {alert.validation}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{textAlign: "center", color: "#8c9a8f", padding: "20px 0"}}>No alerts for this animal.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
        <aside style={{width: 320, flexShrink: 0}}>
          <AnimalPanel cow={selectedCow} getRiskForecast={data.getRiskForecast} dynamicUi={data.dynamicUi} takeReading={data.takeReading} />
        </aside>
      </div>
    );
  };

  const renderProfileView = () => {
    const reviewsDone = data.alerts.filter(a => a.validation !== 'active').length;
    return (
      <>
        <header className="coop-header">
          <div className="coop-title-row">
            <h1>{userName}</h1>
          </div>
          <p className="coop-subtitle">{data.dynamicUi.profileTitle} &middot; {deskName}</p>
        </header>
        <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="coop-stat-card">
            <h3>{data.dynamicUi.contactInfo}</h3>
          </div>
          <div className="coop-stat-card">
            <h3 style={{fontSize: '1.2rem', color: 'var(--coop-primary)', margin: 0}}>{data.dynamicUi.reviewsCompleted(reviewsDone)}</h3>
            <p style={{margin: '4px 0 0 0', color: '#6c7a6f'}}>Thank you for helping keep the herds healthy.</p>
          </div>
          
        </div>
      </>
    );
  };

  const renderFarmsView = () => {
    // Group cows by farm
    const farmsMap = new Map<string, { total: number, flagged: number }>();
    data.cows.forEach(cow => {
      if (!farmsMap.has(cow.farm)) farmsMap.set(cow.farm, { total: 0, flagged: 0 });
      const f = farmsMap.get(cow.farm)!;
      f.total++;
      if (cow.risk === "high") f.flagged++;
    });
    
    return (
      <>
        <header className="coop-header">
          <div className="coop-title-row">
            <h1>{data.extra.allFarms}</h1>
          </div>
        </header>
        <section className="coop-priority-section">
          <table className="coop-table">
            <thead>
              <tr>
                <th>{data.extra.farmName}</th>
                <th>{data.extra.totalAnimals}</th>
                <th>{data.extra.flaggedAnimals}</th>
              </tr>
            </thead>
            <tbody>
                              {Array.from(farmsMap.entries()).map(([farmName, stats]) => (
                  <tr 
                    key={farmName}
                    onClick={() => { setSearch(farmName); setActiveView('animals'); }}
                    style={{cursor: 'pointer'}}
                  >
                  <td><strong>{farmName}</strong></td>
                  <td>{stats.total}</td>
                  <td>{stats.flagged > 0 ? <span className="coop-risk-badge high">{stats.flagged} needs attention</span> : <span className="coop-risk-badge low">0</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </>
    );
  };

  const renderAlertsView = () => (
    <>
      <header className="coop-header">
        <div className="coop-title-row">
          <h1>{data.ui.openAlerts}</h1>
        </div>
      </header>
      <section className="coop-priority-section">
        <table className="coop-table">
          <thead>
            <tr>
              <th>{data.extra.date}</th>
              <th>{data.extra.time}</th>
              <th>{data.extra.animal} ID</th>
              <th>{data.extra.title}</th>
              <th>{data.extra.status}</th>
            </tr>
          </thead>
          <tbody>
            {data.alerts.map(alert => (
              <tr 
                key={alert.id}
                onClick={() => { setSelectedCowId(alert.cowId); setActiveView('cow-detail'); }}
                style={{cursor: 'pointer'}}
              >
                <td>{alert.date}</td>
                <td>{alert.time}</td>
                <td>{alert.cowId}</td>
                <td><strong>{alert.title}</strong><br/><span style={{fontSize: '0.85rem', color: '#6c7a6f'}}>{alert.body}</span></td>
                <td>
                  <span className={`coop-risk-badge ${alert.validation === 'active' ? 'high' : alert.validation === 'resolved' ? 'low' : alert.validation === 'confirmed' ? 'medium' : 'low'}`}>
                    {alert.validation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );

const renderHowItWorksView = () => {
    const ui = data.ui;
    return (
      <>
        <header className="coop-header">
          <div className="coop-title-row">
            <h1>{ui.impactTechnologyRoadmap}</h1>
          </div>
          <p className="coop-subtitle">{ui.subclinicalIntelligenceEconomicProtection}</p>
        </header>
        
        <div style={{padding: 24, maxWidth: 1000}}>
          <p style={{fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 32}}>{ui.pitchIntro}</p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'stretch'}}>
            {/* Card 1 */}
            <div className="coop-stat-card" style={{height: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                <div style={{color: 'var(--coop-primary)'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <span style={{background: '#e4e2d8', padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, color: 'var(--coop-primary)'}}>{ui.card1Badge}</span>
              </div>
              <h3 style={{fontSize: '1.1rem', marginBottom: 8, color: 'var(--coop-fg)'}}>{ui.card1Title}</h3>
              <p style={{color: '#6c7a6f', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5, flex: 1}}>{ui.card1Body}</p>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#6c7a6f', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto'}}>
                <li style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}><span style={{color: 'var(--coop-status-green)', marginTop: 2}}>✓</span> <span style={{lineHeight: 1.4}}>{ui.card1Bullet1}</span></li>
                <li style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}><span style={{color: 'var(--coop-status-green)', marginTop: 2}}>✓</span> <span style={{lineHeight: 1.4}}>{ui.card1Bullet2}</span></li>
                <li style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}><span style={{color: 'var(--coop-status-green)', marginTop: 2}}>✓</span> <span style={{lineHeight: 1.4}}>{ui.card1Bullet3}</span></li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="coop-stat-card" style={{height: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                <div style={{color: '#4a7c82'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
                </div>
                <span style={{background: '#dce8ea', padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, color: '#4a7c82'}}>{ui.card2Badge}</span>
              </div>
              <h3 style={{fontSize: '1.1rem', marginBottom: 8, color: 'var(--coop-fg)'}}>{ui.card2Title}</h3>
              <p style={{color: '#6c7a6f', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5, flex: 1}}>{ui.card2Body}</p>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#6c7a6f', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto'}}>
                <li style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}><span style={{color: 'var(--coop-status-green)', marginTop: 2}}>✓</span> <span style={{lineHeight: 1.4}}>{ui.card2Bullet1}</span></li>
                <li style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}><span style={{color: 'var(--coop-status-green)', marginTop: 2}}>✓</span> <span style={{lineHeight: 1.4}}>{ui.card2Bullet2}</span></li>
                <li style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}><span style={{color: 'var(--coop-status-green)', marginTop: 2}}>✓</span> <span style={{lineHeight: 1.4}}>{ui.card2Bullet3}</span></li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="coop-stat-card" style={{height: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                <div style={{color: '#d99c30'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <span style={{background: '#f9ecd3', padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, color: '#d99c30'}}>{ui.card3Badge}</span>
              </div>
              <h3 style={{fontSize: '1.1rem', marginBottom: 8, color: 'var(--coop-fg)'}}>{ui.card3Title}</h3>
              <p style={{color: '#6c7a6f', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5, flex: 1}}>{ui.card3Body}</p>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#6c7a6f', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto'}}>
                <li style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}><span style={{color: 'var(--coop-status-green)', marginTop: 2}}>✓</span> <span style={{lineHeight: 1.4}}>{ui.card3Bullet1}</span></li>
                <li style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}><span style={{color: 'var(--coop-status-green)', marginTop: 2}}>✓</span> <span style={{lineHeight: 1.4}}>{ui.card3Bullet2}</span></li>
                <li style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}><span style={{color: 'var(--coop-status-green)', marginTop: 2}}>✓</span> <span style={{lineHeight: 1.4}}>{ui.card3Bullet3}</span></li>
              </ul>
            </div>
          </div>
          
          <div style={{marginTop: 48, maxWidth: 1000, margin: '48px auto 0'}}>
            <h2 style={{fontSize: '1.5rem', marginBottom: 16, color: 'var(--coop-fg)'}}>{data.extra.howToUseTitle}</h2>
            <p style={{fontSize: '1rem', color: '#6c7a6f', marginBottom: 32}}>{data.extra.howToUseBody}</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div className="coop-stat-card" style={{flexDirection: 'row', alignItems: 'center', gap: 16, padding: '16px 24px'}}>
                <div style={{background: 'var(--coop-primary)', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>1</div>
                <div>
                  <h4 style={{margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--coop-fg)'}}>{data.extra.step1Title}</h4>
                  <p style={{margin: 0, color: '#6c7a6f', fontSize: '0.9rem'}}>{data.extra.step1Body}</p>
                </div>
              </div>
              <div className="coop-stat-card" style={{flexDirection: 'row', alignItems: 'center', gap: 16, padding: '16px 24px'}}>
                <div style={{background: 'var(--coop-status-amber)', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>2</div>
                <div>
                  <h4 style={{margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--coop-fg)'}}>{data.extra.step2Title}</h4>
                  <p style={{margin: 0, color: '#6c7a6f', fontSize: '0.9rem'}}>{data.extra.step2Body}</p>
                </div>
              </div>
              <div className="coop-stat-card" style={{flexDirection: 'row', alignItems: 'center', gap: 16, padding: '16px 24px'}}>
                <div style={{background: 'var(--coop-status-red)', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>3</div>
                <div>
                  <h4 style={{margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--coop-fg)'}}>{data.extra.step3Title}</h4>
                  <p style={{margin: 0, color: '#6c7a6f', fontSize: '0.9rem'}}>{data.extra.step3Body}</p>
                </div>
              </div>
              <div className="coop-stat-card" style={{flexDirection: 'row', alignItems: 'center', gap: 16, padding: '16px 24px'}}>
                <div style={{background: '#4a7c82', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>4</div>
                <div>
                  <h4 style={{margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--coop-fg)'}}>{data.extra.step4Title}</h4>
                  <p style={{margin: 0, color: '#6c7a6f', fontSize: '0.9rem'}}>{data.extra.step4Body}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderSettingsView = () => (
    <>
      <header className="coop-header">
        <div className="coop-title-row">
          <h1>Settings</h1>
        </div>
      </header>
      
      <div style={{ maxWidth: 480 }}>
        <div className="coop-stat-card" style={{ gap: 16 }}>
          <div>
            <h3 style={{marginBottom: 8}}>Display Language & Region</h3>
            <select 
              className="coop-search" 
              style={{width: '100%'}}
              value={data.selectedStateName} 
              onChange={(e) => data.setSelectedStateName(e.target.value)}
            >
              {data.stateOptions.map(opt => (
                <option key={opt.state} value={opt.state}>
                  {opt.native} · {opt.languageLabel} ({opt.state})
                </option>
              ))}
            </select>
          </div>
          
          <hr style={{border: 0, borderTop: '1px solid var(--coop-border)', margin: '8px 0'}} />
          
          <div>
            <h3 style={{marginBottom: 4}}>About Pashu Mitra</h3>
            <p style={{margin: 0, fontSize: '0.9rem', color: '#6c7a6f'}}>
              Version 1.0.0 (Cooperative Build)<br/>
              © 2026 Pashu Mitra
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="coop-layout">
      <Sidebar
        activeAlertsCount={data.alerts.filter(a => a.validation === 'active').length}
        extra={data.extra}
        queuedCount={data.queuedReviews.length}
        
        userName={userName} 
        deskName={deskName} 
        isOnline={!data.offline} 
        activeView={activeView}
        setActiveView={setActiveView}
        toggleOffline={data.toggleOffline}
      />
      
      <main className="coop-main">
        <TopBar 
          lastSynced={data.lastSynced} 
          selectedStateName={data.selectedStateName} 
          stateOptions={data.stateOptions} 
          onStateChange={data.setSelectedStateName} 
        />
        
        <div className="coop-content">
          {activeView === 'dashboard' && renderDashboardView()}
          {activeView === 'animals' && renderAnimalsView()}
          {activeView === 'farms' && renderFarmsView()}
          {activeView === 'alerts' && renderAlertsView()}
          {activeView === 'how-it-works' && renderHowItWorksView()}
          {activeView === 'settings' && renderSettingsView()}
          {activeView === 'cow-detail' && renderCowDetailView()}
          {activeView === 'profile' && renderProfileView()}
        </div>

      {contactOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: 400, maxWidth: '90%' }}>
            <h2 style={{marginTop: 0, marginBottom: 8}}>{data.copy.callVet}</h2>
            <p style={{color: "#6c7a6f", marginBottom: 24}}>{data.extra.drVermaOnCall}</p>
            <div style={{display: 'flex', gap: 12}}>
              <button 
                className="coop-btn coop-btn-primary" 
                style={{flex: 1}}
                onClick={() => {
                  setContactOpen(false);
                  alert(data.dynamicUi.callingVet || 'Calling Dr. Verma...');
                }}
              >
                {data.dynamicUi.callVet || 'Call Vet'}
              </button>
              <button 
                className="coop-btn coop-btn-outline" 
                onClick={() => setContactOpen(false)}
              >{data.extra.cancelBtn}</button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
