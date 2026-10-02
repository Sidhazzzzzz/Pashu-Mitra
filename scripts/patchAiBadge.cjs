const fs = require('fs');
let dash = fs.readFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', 'utf8');

const targetButtonHtml = `        <div className="coop-info-item" style={{marginLeft: 'auto'}}>
          <button 
            className="coop-btn coop-btn-primary" 
            onClick={() => data.takeReading()}
            disabled={data.isReading}
          >
            {data.isReading ? data.extra.checking : data.extra.checkCowsNow}
          </button>
        </div>`;

const newButtonHtml = `        <div className="coop-info-item" style={{marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#e3f2fd', color: '#1565c0', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600}} title="Runs TensorFlow.js Neural Network locally to predict risk">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Powered by TF.js AI
          </div>
          <button 
            className="coop-btn coop-btn-primary" 
            onClick={() => data.takeReading()}
            disabled={data.isReading}
          >
            {data.isReading ? data.extra.checking : data.extra.checkCowsNow}
          </button>
        </div>`;

dash = dash.replace(targetButtonHtml, newButtonHtml);

fs.writeFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', dash);
