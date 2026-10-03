import type { StateOption } from "../../lib/dashboard-data";
import { Clock3, Globe, Search, Bell } from "lucide-react";

type TopBarProps = {
  lastSynced: string;
  selectedStateName: string;
  stateOptions: StateOption[];
  onStateChange: (state: string) => void;
};

export function TopBar({ lastSynced, selectedStateName, stateOptions, onStateChange }: TopBarProps) {
  return (
    <header className="coop-topbar">
      <div style={{display: 'flex', alignItems: 'center', gap: 16, flex: 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, background: '#f3f7f2', padding: '8px 16px', borderRadius: 8, color: '#6c7a6f', fontSize: '0.9rem', width: 280}}>
          <Search size={16} />
          <input type="text" placeholder="Search cows, farms..." style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#111812'}} />
        </div>
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div className="coop-sync-status" style={{background: 'rgba(0,0,0,0.02)', padding: '6px 12px', borderRadius: 20}}>
          <Clock3 size={14} /> Last synced {lastSynced} ago
        </div>
        
        <button style={{background: 'transparent', border: 'none', color: '#6c7a6f', cursor: 'pointer', position: 'relative'}}>
          <Bell size={20} />
          <span style={{position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#dc4a42', borderRadius: '50%', border: '2px solid white'}}></span>
        </button>
        
        <div className="coop-lang-picker" style={{background: 'white', border: '1px solid #e8e6df', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 8}}>
          <Globe size={16} color="#4a7c59" />
          <select 
            value={selectedStateName} 
            onChange={(e) => onStateChange(e.target.value)}
            style={{border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#111812', padding: 4}}
          >
            {stateOptions.map(opt => (
              <option key={opt.state} value={opt.state}>
                {opt.native} • {opt.languageLabel}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
