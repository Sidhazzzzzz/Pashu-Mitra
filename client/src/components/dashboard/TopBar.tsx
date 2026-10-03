import type { StateOption } from "../../lib/dashboard-data";
import { Clock3, Globe, Bell } from "lucide-react";

type TopBarProps = {
  lastSynced: string;
  selectedStateName: string;
  stateOptions: StateOption[];
  onStateChange: (state: string) => void;
};

export function TopBar({ lastSynced, selectedStateName, stateOptions, onStateChange }: TopBarProps) {
  return (
    <header className="coop-topbar">
      <div className="coop-topbar-left">
      </div>

      <div className="coop-topbar-right">
        <div className="coop-sync-status-badge">
          <Clock3 size={14} /> <span>Last synced {lastSynced}</span>
          <span style={{width: 8, height: 8, borderRadius: '50%', background: '#1dd1a1', marginLeft: 4}}></span>
        </div>
        
        <div className="coop-lang-picker">
          <Globe size={16} color="#4a7c59" />
          <select 
            value={selectedStateName} 
            onChange={(e) => onStateChange(e.target.value)}
          >
            {stateOptions.map(opt => (
              <option key={opt.state} value={opt.state}>
                {opt.languageLabel}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
