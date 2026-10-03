import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, CartesianGrid, ReferenceLine } from "recharts";
import { ChevronRight, Droplet, Thermometer, BarChart2, AlertCircle } from "lucide-react";
import type { Cow } from "../../lib/dashboard-data";

export function AnimalPanel({ cow, getRiskForecast, dynamicUi, takeReading }: { cow: Cow | null, getRiskForecast: (history: number[]) => any, dynamicUi?: any, takeReading?: (ids?: string[]) => void }) {
  if (!cow) {
    return (
      <div className="coop-animal-panel-light" style={{ justifyContent: "center", alignItems: "center", opacity: 0.7 }}>
        <p>Select an animal to view details</p>
      </div>
    );
  }

  const forecast = getRiskForecast(cow.history);
  
  const chartData = [...cow.history.map((val: number, i: number) => ({
    day: i === 0 ? '14 days ago' : i === cow.history.length - 1 ? 'Today' : '',
    risk: val,
    isForecast: false,
  }))];
  
  forecast.forecast.forEach((val: number, i: number) => {
    chartData.push({
      day: i === forecast.forecast.length - 1 ? `+${forecast.forecast.length} days (projected)` : '',
      risk: val,
      isForecast: true,
    });
  });

  // Pick chart color based on risk
  const isHighRisk = cow.risk === 'high';
  const isMediumRisk = cow.risk === 'medium';
  const chartColor = isHighRisk ? '#dc4a42' : isMediumRisk ? '#e8a44a' : '#4a7c59';
  const chartGradientId = `riskGrad-${cow.id}`;

  const ecDelta = cow.history.length >= 2 ? ((cow.sensor.ec - 1.0) / 1.0 * 100).toFixed(0) : '0';
  const tempDelta = cow.history.length >= 2 ? (cow.sensor.temperature - 38.0).toFixed(1) : '0';
  
  return (
    <div className="coop-animal-panel-light">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20}}>
        <div>
          <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8c9a8f', marginBottom: 6}}>Selected Animal</div>
          <h2 style={{display: 'flex', alignItems: 'baseline', gap: 12, margin: 0, fontSize: '1.8rem', color: '#111812'}}>
            {cow.name} 
            <span style={{fontSize: '1rem', fontWeight: 500, color: '#6c7a6f'}}>Cow #{cow.tag.split('-').pop() || '03'}</span>
          </h2>
        </div>
        <button style={{background: 'white', border: '1px solid #e4e2d8', color: '#111812', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="coop-panel-card-light">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <div style={{
            background: isHighRisk ? '#fdf0ef' : isMediumRisk ? '#fdf8eb' : '#f3f7f2',
            color: isHighRisk ? '#dc4a42' : isMediumRisk ? '#b8860b' : '#4a7c59',
            padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <AlertCircle size={14} />
            {cow.risk === 'high' ? 'High risk' : cow.risk === 'medium' ? 'Watch closely' : 'Normal'}
          </div>
          <div style={{textAlign: 'right'}}>
            <span style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#111812'}}>{cow.score}</span>
            <span style={{fontSize: '1rem', color: '#6c7a6f', fontWeight: 600}}>/100</span>
          </div>
        </div>

        {/* Area chart */}
        <div style={{ height: 160, width: "100%", marginTop: -10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
              <defs>
                <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#8c9a8f" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tick={{fill: '#8c9a8f'}}
                dy={10}
              />
              <YAxis domain={[0, 100]} hide />
              
              <Area 
                type="monotone" 
                dataKey="risk" 
                stroke={chartColor}
                strokeWidth={3}
                fill={`url(#${chartGradientId})`}
                dot={{ r: 3, fill: '#fff', stroke: chartColor, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: chartColor, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensor tiles */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12}}>
        <div className="coop-sensor-tile-light">
          <div style={{display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4}}>
            <Droplet size={24} color="#dc4a42" fill="#dc4a42" strokeWidth={1} style={{marginTop: 4}} />
            <div>
              <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#6c7a6f', marginBottom: 2}}>EC</div>
              <div style={{fontSize: '1.25rem', fontWeight: 800, color: '#111812', lineHeight: 1}}>{cow.sensor.ec.toFixed(2)} <span style={{fontSize: '0.7rem', color: '#6c7a6f', fontWeight: 600}}>mS/cm</span></div>
            </div>
          </div>
          <div style={{fontSize: '0.75rem', color: parseFloat(ecDelta) > 15 ? '#dc4a42' : '#4a7c59', fontWeight: 700, textAlign: 'center'}}>
            ↑ {ecDelta}%
          </div>
        </div>
        
        <div className="coop-sensor-tile-light">
          <div style={{display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4}}>
            <Thermometer size={24} color="#dc4a42" style={{marginTop: 4}} />
            <div>
              <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#6c7a6f', marginBottom: 2}}>Temp.</div>
              <div style={{fontSize: '1.25rem', fontWeight: 800, color: '#111812', lineHeight: 1}}>{cow.sensor.temperature.toFixed(1)}°C</div>
            </div>
          </div>
          <div style={{fontSize: '0.75rem', color: parseFloat(tempDelta) > 0.5 ? '#dc4a42' : '#4a7c59', fontWeight: 700, textAlign: 'center'}}>
            ↑ {tempDelta}°C
          </div>
        </div>
        
        <div className="coop-sensor-tile-light">
          <div style={{display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4}}>
            <BarChart2 size={24} color="#4a7c59" style={{marginTop: 4}} />
            <div>
              <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#6c7a6f', marginBottom: 2}}>Yield</div>
              <div style={{fontSize: '1.25rem', fontWeight: 800, color: '#111812', lineHeight: 1}}>18.4 <span style={{fontSize: '0.7rem', color: '#6c7a6f', fontWeight: 600}}>L</span></div>
            </div>
          </div>
          <div style={{fontSize: '0.75rem', color: '#4a7c59', fontWeight: 700, textAlign: 'center'}}>
            ↓ 12%
          </div>
        </div>
      </div>
    </div>
  );
}
