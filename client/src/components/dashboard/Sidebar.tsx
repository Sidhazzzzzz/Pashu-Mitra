import { LayoutDashboard, Target, Home, Bell, Info, Settings, Wifi, CloudOff } from "lucide-react";

type SidebarProps = {
  userName: string;
  deskName: string;
  queuedCount?: number;
  activeAlertsCount?: number;
  isOnline: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  toggleOffline: () => void;
  extra: any;
};

export function Sidebar({ userName, deskName, isOnline, activeView, setActiveView, toggleOffline, queuedCount, activeAlertsCount = 0, extra }: SidebarProps) {
  return (
    <aside className="coop-sidebar">
      <div className="coop-sidebar-header">
        <div className="coop-sidebar-logo">
          <img src="/logo.png" alt="Pashu Mitra Logo" />
          <span>Pashu Mitra</span>
        </div>
        <div className="coop-sidebar-tagline">{extra?.tagline || "Healthy Cattle, Prosperous Farmers"}</div>
      </div>
      
      <div className="coop-sidebar-section">{extra?.coopView || "Cooperative View"}</div>
      
      <nav className="coop-nav">
        <button className={`coop-nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
          <LayoutDashboard size={18} /> {extra?.navDashboard || "Dashboard"}
        </button>
        <button className={`coop-nav-item ${activeView === 'animals' ? 'active' : ''}`} onClick={() => setActiveView('animals')}>
          <Target size={18} /> {extra?.navAnimals || "Animals"}
        </button>
        <button className={`coop-nav-item ${activeView === 'farms' ? 'active' : ''}`} onClick={() => setActiveView('farms')}>
          <Home size={18} /> {extra?.navFarms || "Farms"}
        </button>
        <button className={`coop-nav-item ${activeView === 'alerts' ? 'active' : ''}`} onClick={() => setActiveView('alerts')}>
          <Bell size={18} /> {extra?.navAlerts || "Alerts"}
          {activeAlertsCount > 0 && (
            <span style={{marginLeft: 'auto', background: 'var(--coop-status-red)', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12}}>
              {activeAlertsCount}
            </span>
          )}
        </button>
        <button className={`coop-nav-item ${activeView === 'how-it-works' ? 'active' : ''}`} onClick={() => setActiveView('how-it-works')}>
          <Info size={18} /> {extra?.navHowItWorks || "How it works"}
        </button>
        <button className={`coop-nav-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => setActiveView('settings')}>
          <Settings size={18} /> {extra?.navSettings || "Settings"}
        </button>
      </nav>

      <div className="coop-sidebar-footer">
        <div 
          onClick={() => setActiveView('profile')}
          style={{cursor: 'pointer', paddingBottom: 4, marginBottom: 4, borderBottom: '1px solid var(--coop-border)'}}
          title="View Profile"
        >
          <div className="user-name">{userName}</div>
          <div className="desk-name">{deskName}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="coop-status-indicator">
            <div className={`coop-status-dot ${isOnline ? 'online' : 'offline'}`}></div>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <button 
            title="Simulate offline" 
            onClick={toggleOffline}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', 
              color: isOnline ? '#1f5a45' : '#c86b5e',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600
            }}
          >
            {isOnline ? <Wifi size={14} /> : <CloudOff size={14} />}
            {(queuedCount || 0) > 0 && <span style={{background: '#c86b5e', color: 'white', padding: '0 4px', borderRadius: 4}}>{queuedCount}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
