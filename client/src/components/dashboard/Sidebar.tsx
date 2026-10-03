import { LayoutDashboard, Target, Home, Bell, Info, Settings, Wifi, CloudOff, ChevronRight, LogOut } from "lucide-react";

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
  // Generate initials from userName
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <aside className="coop-sidebar">
      <div className="coop-sidebar-header" style={{borderBottom: 'none'}}>
        <div className="coop-sidebar-logo">
          <img src="/logo.png" alt="Pashu Mitra Logo" />
          <div>
            <div style={{fontWeight: 800, fontSize: '1.2rem', color: '#111812', letterSpacing: '-0.02em', lineHeight: 1.2}}>Pashu Mitra</div>
            <div className="coop-sidebar-tagline">{extra?.tagline || "Healthy Cattle. Prosperous Farmers."}</div>
          </div>
        </div>
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
        <button className={`coop-nav-item ${activeView === 'alerts' ? 'active' : ''}`} onClick={() => setActiveView('alerts')} style={{position: 'relative'}}>
          <span style={{position: 'relative', display: 'inline-flex'}}>
            <Bell size={18} />
            {activeAlertsCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -8,
                background: 'var(--coop-status-red)', color: 'white', 
                fontSize: '0.65rem', fontWeight: 700,
                width: 18, height: 18, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white'
              }}>
                {activeAlertsCount}
              </span>
            )}
          </span>
          {extra?.navAlerts || "Alerts"}
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
          className="coop-sidebar-profile"
          onClick={() => setActiveView('profile')}
          title="View Profile"
        >
          <div className="coop-sidebar-profile-avatar">{initials}</div>
          <div style={{flex: 1, minWidth: 0}}>
            <div className="user-name">{userName}</div>
            <div className="desk-name">{deskName}</div>
          </div>
          <ChevronRight size={16} style={{color: '#8c9a8f', flexShrink: 0}} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
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
