const fs = require('fs');
let code = fs.readFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', 'utf8');

// Wrap tables in coop-dashboard-body if they aren't already
function wrapSection(viewName) {
  const findRegex = new RegExp('(<header className="coop-header">.*?<\\\\/header>\\\\s*)<section className="coop-priority-section">', 's');
  // wait, regex replace might be tricky if it matches globally.
}

// Actually, I can just do string replacements for each view.
code = code.replace(
  '<header className="coop-header">\n          <div className="coop-title-row">\n            <h1>{data.extra.allAnimals}</h1>\n          </div>\n        </header>\n        <section className="coop-priority-section">',
  '<header className="coop-header">\n          <div className="coop-title-row">\n            <h1>{data.extra.allAnimals}</h1>\n          </div>\n        </header>\n        <div className="coop-stats-grid" style={{marginBottom: 24}}>\n          <div className="coop-stat-card">\n            <div className="coop-stat-icon" style={{background: \"#e8f5e9\", color: \"#1f5a45\"}}>\n              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>\n            </div>\n            <div>\n              <div className="coop-stat-value">{data.stats.totalCows}</div>\n              <div className="coop-stat-sub">{data.extra.activeAnimals || "Active Animals"}</div>\n            </div>\n          </div>\n          <div className="coop-stat-card">\n            <div className="coop-stat-icon" style={{background: \"#fff3e0\", color: \"#e2ab5b\"}}>\n              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>\n            </div>\n            <div>\n              <div className="coop-stat-value">{data.stats.highRiskCows}</div>\n              <div className="coop-stat-sub">{data.extra.subclinicalFlags || "High Risk Flags"}</div>\n            </div>\n          </div>\n        </div>\n        <div className="coop-dashboard-body">\n          <section className="coop-priority-section">'
);

// We must also close the div at the end of the section for animals
code = code.replace(
  '            </tbody>\n          </table>\n        </section>\n      </>\n    );\n\n  const renderFarmsView',
  '            </tbody>\n          </table>\n        </section>\n        </div>\n      </>\n    );\n\n  const renderFarmsView'
);

// Farms view
code = code.replace(
  '<header className="coop-header">\n          <div className="coop-title-row">\n            <h1>{data.extra.allFarms}</h1>\n          </div>\n        </header>\n        <section className="coop-priority-section">',
  '<header className="coop-header">\n          <div className="coop-title-row">\n            <h1>{data.extra.allFarms}</h1>\n          </div>\n        </header>\n        <div className="coop-stats-grid" style={{marginBottom: 24}}>\n          <div className="coop-stat-card">\n            <div className="coop-stat-icon" style={{background: \"#e8f5e9\", color: \"#1f5a45\"}}>\n              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>\n            </div>\n            <div>\n              <div className="coop-stat-value">{farmsMap.size}</div>\n              <div className="coop-stat-sub">{data.extra.registeredFarms || "Total Farms"}</div>\n            </div>\n          </div>\n        </div>\n        <div className="coop-dashboard-body">\n          <section className="coop-priority-section">'
);

code = code.replace(
  '            </tbody>\n          </table>\n        </section>\n      </>\n    );\n\n  const renderAlertsView',
  '            </tbody>\n          </table>\n        </section>\n        </div>\n      </>\n    );\n\n  const renderAlertsView'
);

// Alerts view
code = code.replace(
  '<header className="coop-header">\n          <div className="coop-title-row">\n            <h1>{data.ui.openAlerts}</h1>\n          </div>\n        </header>\n        <section className="coop-priority-section">',
  '<header className="coop-header">\n          <div className="coop-title-row">\n            <h1>{data.ui.openAlerts}</h1>\n          </div>\n        </header>\n        <div className="coop-dashboard-body">\n          <section className="coop-priority-section">'
);

code = code.replace(
  '            </tbody>\n          </table>\n        </section>\n      </>\n    );\n\n  const renderHowItWorksView',
  '            </tbody>\n          </table>\n        </section>\n        </div>\n      </>\n    );\n\n  const renderHowItWorksView'
);


fs.writeFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', code);
