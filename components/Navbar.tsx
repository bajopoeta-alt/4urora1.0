import React from 'react';
import { User, Notification } from '../types';
import { LogOut, Bell, Music, LayoutDashboard, FileText, Settings } from 'lucide-react';
import { getNotifications, clearNotifications } from '../services/storage';

interface NavbarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onTabChange, onLogout }) => {
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  // Simple polling for notifications simulation
  React.useEffect(() => {
    const interval = setInterval(() => {
        if (['admin', 'superuser'].includes(user.role)) {
            setNotifications(getNotifications());
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [user.role]);

  const handleClearNotifs = () => {
      clearNotifications();
      setNotifications([]);
      setShowNotifs(false);
  }

  const isAdmin = ['admin', 'superuser'].includes(user.role);

  const navItems = [
    { id: 'calendar', label: 'Calendario', icon: Music },
    ...(isAdmin ? [
        { id: 'reports', label: 'Informes', icon: FileText },
        { id: 'admin', label: 'Gestión', icon: Settings }
    ] : [])
  ];

  return (
    <nav className="bg-deep border-b-2 border-gold sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-gold rotate-45 flex items-center justify-center bg-bishop">
                <span className="text-gold -rotate-45 font-bold font-deco">4</span>
            </div>
            <span className="font-deco text-2xl text-gold tracking-[0.2em] hidden md:block">4UROR4</span>
          </div>

          <div className="flex items-center gap-4">
             {/* Tab Navigation */}
             <div className="flex bg-deep/50 rounded-lg p-1 gap-1 mr-4">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all
                            ${activeTab === item.id 
                                ? 'bg-gold text-deep font-bold' 
                                : 'text-gold hover:bg-white/5'}
                        `}
                    >
                        <item.icon size={16} />
                        <span className="hidden md:inline">{item.label}</span>
                    </button>
                ))}
             </div>

            {/* Notifications (Admin Only) */}
            {isAdmin && (
              <div className="relative">
                <button 
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="text-gold hover:text-white relative p-2"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-ruby rounded-full animate-pulse"></span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-72 bg-deep border border-gold shadow-2xl z-50 rounded-sm">
                    <div className="p-2 border-b border-gold/20 flex justify-between items-center">
                        <span className="text-xs uppercase text-gold font-bold">Notificaciones</span>
                        <button onClick={handleClearNotifs} className="text-[10px] text-ruby hover:underline">Limpiar</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-gray-500">Sin novedades.</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-3 border-b border-gold/10 hover:bg-white/5 text-xs text-gray-300">
                            <p>{n.message}</p>
                            <span className="text-[10px] text-gold/50">{new Date(n.date).toLocaleTimeString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Logout */}
            <div className="flex items-center gap-3 border-l border-gold/20 pl-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-gold font-bold">{user.name}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{user.role}</p>
              </div>
              <button onClick={onLogout} className="text-ruby hover:text-red-400" title="Cerrar Sesión">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};