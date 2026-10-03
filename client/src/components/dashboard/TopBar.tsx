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
        <div className="coop-sync-status-badge">
          <Clock3 size={14} /> <span>Last synced {lastSynced} ago</span>
        </div>
      </div>

      <div className="coop-topbar-right">
        <button className="coop-notification-btn">
          <Bell size={20} />
          <span className="coop-notification-dot"></span>
        </button>
        
        <div className="coop-lang-picker">
          <Globe size={16} color="#4a7c59" />
          <select 
            value={selectedStateName} 
            onChange={(e) => onStateChange(e.target.value)}
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
