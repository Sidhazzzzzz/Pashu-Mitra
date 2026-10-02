import type { StateOption } from "../../lib/dashboard-data";
import { Clock3, Globe } from "lucide-react";

type TopBarProps = {
  lastSynced: string;
  selectedStateName: string;
  stateOptions: StateOption[];
  onStateChange: (state: string) => void;
};

export function TopBar({ lastSynced, selectedStateName, stateOptions, onStateChange }: TopBarProps) {
  return (
    <header className="coop-topbar">
      <div className="coop-sync-status">
        <Clock3 size={16} /> Last synced {lastSynced} ago
      </div>
      
      <div className="coop-lang-picker">
        <Globe size={18} />
        <select 
          value={selectedStateName} 
          onChange={(e) => onStateChange(e.target.value)}
        >
          {stateOptions.map(opt => (
            <option key={opt.state} value={opt.state}>
              {opt.native} · {opt.languageLabel} ({opt.state})
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
