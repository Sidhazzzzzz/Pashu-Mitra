import { Line, LineChart, ResponsiveContainer, YAxis, XAxis, Tooltip as RechartsTooltip, ReferenceLine } from "recharts";
import type { Cow } from "../../lib/dashboard-data";

export function AnimalPanel({ cow, getRiskForecast, dynamicUi, takeReading }: { cow: Cow | null, getRiskForecast: (history: number[]) => any, dynamicUi?: any, takeReading?: (ids?: string[]) => void }) {
  if (!cow) {
    return (
      <div className="coop-animal-panel" style={{ justifyContent: "center", alignItems: "center", opacity: 0.7 }}>
        <p>Select an animal to view details</p>
      </div>
    );
  }

  const forecast = getRiskForecast(cow.history);
  
  // Prepare chart data
  // Assuming cow.history has 14 points, forecast has 3 points.
  const chartData = [...cow.history.map((val: number, i: number) => ({
    day: `Day ${i+1}`,
    risk: val,
    isForecast: false
  }))];
  
  forecast.forecast.forEach((val: number, i: number) => {
    chartData.push({
      day: `Proj ${i+1}`,
      risk: val,
      isForecast: true
    });
  });

  return (
    <div className="coop-animal-panel">
      <div className="coop-panel-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <div style={{fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#a3c4b3', marginBottom: 4}}>Selected Animal</div>
            <h2 style={{display: 'flex', alignItems: 'baseline', gap: 8}}>{cow.name} <span style={{fontSize: '0.9rem', fontWeight: 400, color: '#a3c4b3'}}>{cow.tag}</span></h2>
          </div>
          <button style={{background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 8}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        <div style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 8}}>
          <span className={`coop-risk-badge ${cow.risk}`} style={{fontSize: '0.8rem'}}>
            {cow.risk === 'high' ? 'High risk' : cow.risk === 'medium' ? 'Watch closely' : 'Normal'}
          </span>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', marginTop: 8}}>
          <span style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1}}>{cow.score}</span>
          <span style={{fontSize: '1rem', color: '#a3c4b3'}}>/100</span>
        </div>
        <div style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, fontSize: '0.85rem'}}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, 
            color: cow.sensor.state === 'stale' ? '#c86b5e' : cow.sensor.state === 'low-battery' ? '#d99c30' : '#8c9a8f'
          }}>
            <div style={{width: 8, height: 8, borderRadius: '50%', background: cow.sensor.state === 'stale' ? '#c86b5e' : cow.sensor.state === 'low-battery' ? '#d99c30' : '#8c9a8f'}} />
            {cow.sensor.state === 'stale' ? 'Offline' : cow.sensor.state === 'low-battery' ? 'Low Battery' : 'Connected'}
          </span>
          <span style={{color: '#8c9a8f'}}>• Battery: {cow.sensor.battery}%</span>
        </div>
      </div>

      <div className="coop-chart-container">
        <div className="coop-chart-title">{dynamicUi?.forecastLabel || "Forecasted Trend (Expected risk over 3 days)"}</div>
        <div style={{ height: 160, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="day" hide />
              <YAxis domain={[0, 100]} stroke="#a3c4b3" fontSize={11} tickLine={false} axisLine={false} />
              <ReferenceLine y={70} stroke="#c86b5e" strokeDasharray="3 3" opacity={0.6} />
              <Line 
                type="monotone" 
                dataKey="risk" 
                stroke="#ffffff" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#d99c30", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="coop-sensor-tiles">
        <div className="coop-sensor-tile">
          <h4>EC Level</h4>
          <div className="val">{cow.sensor.ec.toFixed(2)}</div>
        </div>
        <div className="coop-sensor-tile">
          <h4>Temperature</h4>
          <div className="val">{cow.sensor.temperature.toFixed(1)}°C</div>
        </div>
      </div>

      <div className="coop-yield-sep">
        <span className="coop-yield-label">Operational Data (General)</span>
        <div style={{ fontSize: '0.9rem' }}>Herd avg yield: 14 L/day</div>
      </div>
    </div>
  );
}
