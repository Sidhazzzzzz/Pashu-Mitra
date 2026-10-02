const fs = require('fs');
let dash = fs.readFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', 'utf8');

// The exact string we accidentally added
const howToUseHTML = `          <div style={{marginTop: 48}}>
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
  };`;

// Remove it from renderProfileView. We can just replace the whole chunk with the correct original ending of renderProfileView
const originalProfileEnd = `        </div>\n      </>\n    );\n  };`;
dash = dash.replace(howToUseHTML, originalProfileEnd);

// Now insert it into renderHowItWorksView
const howItWorksEndSearch = `              </div>\n            </div>\n          </div>\n        </>\n      );\n    };`;
// Actually, earlier my script had this:
// `            </div>\n          </div>\n        </>\n    );\n  };`

const replacementForHowItWorks = `              </div>
            </div>

            <div style={{marginTop: 48}}>
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
    };`;

dash = dash.replace(/              <\/div>\r?\n            <\/div>\r?\n          <\/div>\r?\n        <\/>\r?\n      \);\r?\n    \};/, replacementForHowItWorks);

fs.writeFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', dash);
