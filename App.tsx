import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Login } from './components/Login';
import { CalendarView } from './components/CalendarView';
import { Reports } from './components/Reports';
import { AdminPanel } from './components/AdminPanel';
import { Navbar } from './components/Navbar';
import { Card } from './components/Card';
import { saveUser } from './services/storage';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPin, setNewPin] = useState('');

  // Check session on mount
  useEffect(() => {
    const saved = localStorage.getItem('4uror4_session');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('4uror4_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('4uror4_session');
    setActiveTab('calendar');
  };

  const handleChangePin = (e: React.FormEvent) => {
      e.preventDefault();
      if(user && newPin.length === 4) {
          const updated = { ...user, pin: newPin };
          saveUser(updated);
          setUser(updated);
          localStorage.setItem('4uror4_session', JSON.stringify(updated));
          setShowPasswordChange(false);
          setNewPin('');
          alert('PIN actualizado correctamente');
      }
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-deep text-gray-200 font-sans selection:bg-gold selection:text-deep pb-12">
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
      />

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Quick Actions (Password) */}
        <div className="flex justify-end">
            <button 
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-xs text-gold/60 hover:text-gold underline"
            >
                Cambiar mi PIN
            </button>
        </div>

        {showPasswordChange && (
            <div className="max-w-md mx-auto mb-8">
                <Card title="Cambiar Contraseña">
                    <form onSubmit={handleChangePin} className="flex gap-4">
                        <input 
                            type="password" 
                            maxLength={4} 
                            placeholder="Nuevo PIN (4 dígitos)"
                            className="flex-1 bg-deep border border-gold p-2 text-center"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                        />
                        <Button type="submit">Guardar</Button>
                    </form>
                </Card>
            </div>
        )}

        {/* Content Area */}
        <div className="animate-in fade-in duration-500">
            {activeTab === 'calendar' && (
                <Card title="Calendario de Indisponibilidad">
                    <CalendarView currentUser={user} />
                </Card>
            )}

            {activeTab === 'reports' && ['admin', 'superuser'].includes(user.role) && (
                <Card title="Informes & Estadísticas">
                    <Reports currentUser={user} />
                </Card>
            )}

            {activeTab === 'admin' && ['admin', 'superuser'].includes(user.role) && (
                <Card title="Administración de Usuarios">
                    <AdminPanel currentUser={user} />
                </Card>
            )}
        </div>
      </main>

      <footer className="text-center text-gold/30 text-xs py-8 font-deco">
        4UROR4 SYSTEM &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;