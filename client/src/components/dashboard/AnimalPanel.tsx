import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, CartesianGrid } from "recharts";
import { Droplet, Thermometer, BarChart2, AlertCircle } from "lucide-react";
import type { Cow } from "../../lib/dashboard-data";

export function AnimalPanel({ cow, getRiskForecast, extra }: { cow: Cow | null, getRiskForecast: (history: number[]) => any, extra?: any, dynamicUi?: any, takeReading?: any }) {
  if (!cow) {
    return (
      <div className="coop-animal-panel" style={{ justifyContent: "center", alignItems: "center", opacity: 0.7 }}>
        <p>Select an animal to view details</p>
      </div>
    );
  }

  const forecast = getRiskForecast(cow.history);
  
  const chartData = [...cow.history.map((val: number, i: number) => ({
    day: i === 0 ? '14d ago' : i === cow.history.length - 1 ? 'Today' : '',
    risk: val > 94 ? 94 : val, // Ensure history never shows > 94
    isForecast: false,
  }))];
  
  forecast.forecast.forEach((val: number, i: number) => {
    chartData.push({
      day: i === forecast.forecast.length - 1 ? `+${forecast.forecast.length}d` : '',
      risk: val > 94 ? 94 : val, // Cap forecast too
      isForecast: true,
    });
  });

  const displayScore = cow.score > 94 ? 94 : cow.score;

  // Pick chart color based on risk
  const isHighRisk = cow.risk === 'high';
  const isMediumRisk = cow.risk === 'medium';
  const chartColor = isHighRisk ? '#ff6b6b' : isMediumRisk ? '#feca57' : '#1dd1a1';
  const chartGradientId = `riskGrad-${cow.id}`;

  const ecDelta = cow.history.length >= 2 ? ((cow.sensor.ec - 1.0) / 1.0 * 100).toFixed(0) : '0';
  const tempDelta = cow.history.length >= 2 ? (cow.sensor.temperature - 38.0).toFixed(1) : '0';
  
  return (
    <div className="coop-animal-panel">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20}}>
        <div>
          <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#a3c4b3', marginBottom: 6}}>{(extra && extra.selectedAnimalTitle) || "Selected Animal"}</div>
          <h2 style={{display: 'flex', alignItems: 'baseline', gap: 12, margin: 0, fontSize: '1.8rem', color: '#ffffff'}}>
            {cow.name} 
            <span style={{fontSize: '1rem', fontWeight: 500, color: '#a3c4b3'}}>{cow.tag}</span>
          </h2>
        </div>
      </div>

      <div style={{background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px', marginBottom: 12, border: '1px solid rgba(255,255,255,0.1)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <div style={{
            background: isHighRisk ? 'rgba(255,107,107,0.15)' : isMediumRisk ? 'rgba(254,202,87,0.15)' : 'rgba(29,209,161,0.15)',
            color: chartColor,
            padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            border: `1px solid ${chartColor}40`
          }}>
            <AlertCircle size={14} />
            {cow.risk === 'high' ? 'High risk' : cow.risk === 'medium' ? 'Watch closely' : 'Normal'}
          </div>
          <div style={{textAlign: 'right'}}>
            <span style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#ffffff'}}>{displayScore}</span>
            <span style={{fontSize: '1rem', color: '#a3c4b3', fontWeight: 600}}>/100</span>
          </div>
        </div>

        {/* Area chart */}
        <div style={{ height: 160, width: "100%", marginTop: -10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
              <defs>
                <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#a3c4b3" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tick={{fill: '#a3c4b3'}}
                dy={10}
              />
              <YAxis domain={[0, 100]} hide />
              
              <Area 
                type="monotone" 
                dataKey="risk" 
                stroke={chartColor}
                strokeWidth={3}
                fill={`url(#${chartGradientId})`}
                dot={{ r: 3, fill: '#1f5a45', stroke: chartColor, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: chartColor, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensor tiles */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12}}>
        <div style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <div style={{display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4}}>
            <Droplet size={16} color="#ff6b6b" style={{marginTop: 2, flexShrink: 0}} />
            <div style={{minWidth: 0}}>
              <div style={{fontSize: '0.7rem', fontWeight: 600, color: '#a3c4b3', marginBottom: 2}}>EC</div>
              <div style={{fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1}}>{cow.sensor.ec.toFixed(2)}</div>
            </div>
          </div>
          <div style={{fontSize: '0.7rem', color: parseFloat(ecDelta) > 15 ? '#ff6b6b' : '#1dd1a1', fontWeight: 700, textAlign: 'center'}}>
            ↑ {ecDelta}%
          </div>
        </div>
        
        <div style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <div style={{display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4}}>
            <Thermometer size={16} color="#ff6b6b" style={{marginTop: 2, flexShrink: 0}} />
            <div style={{minWidth: 0}}>
              <div style={{fontSize: '0.7rem', fontWeight: 600, color: '#a3c4b3', marginBottom: 2}}>Temp.</div>
              <div style={{fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1}}>{cow.sensor.temperature.toFixed(1)}°</div>
            </div>
          </div>
          <div style={{fontSize: '0.7rem', color: parseFloat(tempDelta) > 0.5 ? '#ff6b6b' : '#1dd1a1', fontWeight: 700, textAlign: 'center'}}>
            ↑ {tempDelta}°
          </div>
        </div>
        
        <div style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <div style={{display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4}}>
            <BarChart2 size={16} color="#1dd1a1" style={{marginTop: 2, flexShrink: 0}} />
            <div style={{minWidth: 0}}>
              <div style={{fontSize: '0.7rem', fontWeight: 600, color: '#a3c4b3', marginBottom: 2}}>Yield</div>
              <div style={{fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1}}>18.4L</div>
            </div>
          </div>
          <div style={{fontSize: '0.7rem', color: '#1dd1a1', fontWeight: 700, textAlign: 'center'}}>
            ↓ 12%
          </div>
        </div>
      </div>
    </div>
  );
}
