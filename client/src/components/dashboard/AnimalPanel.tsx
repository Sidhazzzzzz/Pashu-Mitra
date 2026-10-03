import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, ReferenceLine, CartesianGrid } from "recharts";
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
  
  const chartData = [...cow.history.map((val: number, i: number) => ({
    day: i === 0 ? '14 days ago' : i === cow.history.length - 1 ? 'Today' : '',
    risk: val,
  }))];
  
  forecast.forecast.forEach((val: number, i: number) => {
    chartData.push({
      day: i === forecast.forecast.length - 1 ? `+${forecast.forecast.length} days` : '',
      risk: val,
    });
  });

  // Pick chart color based on risk
  const chartColor = cow.risk === 'high' ? '#e85d4a' : cow.risk === 'medium' ? '#e8a44a' : '#5cb87a';
  const chartGradientId = `riskGrad-${cow.id}`;

  // Compute deltas for sensor tiles
  const ecDelta = cow.history.length >= 2 ? ((cow.sensor.ec - 1.0) / 1.0 * 100).toFixed(0) : '0';
  const tempDelta = cow.history.length >= 2 ? (cow.sensor.temperature - 38.0).toFixed(1) : '0';
  
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
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
          <span className={`coop-risk-badge ${cow.risk}`} style={{fontSize: '0.8rem'}}>
            {cow.risk === 'high' ? 'High risk' : cow.risk === 'medium' ? 'Watch closely' : 'Normal'}
          </span>
          <div style={{textAlign: 'right'}}>
            <span style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1}}>{cow.score}</span>
            <span style={{fontSize: '1rem', color: '#a3c4b3'}}>/100</span>
          </div>
        </div>
      </div>

      {/* Area chart with gradient fill */}
      <div className="coop-chart-container">
        <div style={{ height: 140, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 16 }}>
              <defs>
                <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#a3c4b3" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{fill: '#a3c4b3'}}
              />
              <YAxis domain={[0, 100]} stroke="#a3c4b3" fontSize={10} tickLine={false} axisLine={false} />
              <ReferenceLine y={70} stroke="#c86b5e" strokeDasharray="3 3" opacity={0.5} />
              <Area 
                type="monotone" 
                dataKey="risk" 
                stroke={chartColor}
                strokeWidth={2.5}
                fill={`url(#${chartGradientId})`}
                dot={false}
                activeDot={{ r: 5, fill: chartColor, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#a3c4b3', marginTop: -8}}>
          <span>14 days ago</span>
          <span>Today</span>
          <span>+{forecast.forecast.length} days (projected)</span>
        </div>
      </div>

      {/* Sensor tiles with delta indicators */}
      <div className="coop-sensor-tiles" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
        <div className="coop-sensor-tile">
          <h4>EC</h4>
          <div className="val">{cow.sensor.ec.toFixed(2)} <span style={{fontSize: '0.7rem', color: '#a3c4b3'}}>mS/cm</span></div>
          <div style={{fontSize: '0.75rem', color: parseFloat(ecDelta) > 15 ? '#e85d4a' : '#5cb87a', marginTop: 4, fontWeight: 600}}>
            ↑ {ecDelta}%
          </div>
        </div>
        <div className="coop-sensor-tile">
          <h4>Temp.</h4>
          <div className="val">{cow.sensor.temperature.toFixed(1)}°C</div>
          <div style={{fontSize: '0.75rem', color: parseFloat(tempDelta) > 0.5 ? '#e85d4a' : '#5cb87a', marginTop: 4, fontWeight: 600}}>
            ↑ {tempDelta}°C
          </div>
        </div>
        <div className="coop-sensor-tile">
          <h4>Yield</h4>
          <div className="val">18.4 <span style={{fontSize: '0.7rem', color: '#a3c4b3'}}>L</span></div>
          <div style={{fontSize: '0.75rem', color: '#5cb87a', marginTop: 4, fontWeight: 600}}>
            ↓ 12%
          </div>
        </div>
      </div>

      <div className="coop-yield-sep">
        <span className="coop-yield-label">Operational Data (General)</span>
        <div style={{ fontSize: '0.9rem' }}>Herd avg yield: 14 L/day</div>
      </div>
    </div>
  );
}
