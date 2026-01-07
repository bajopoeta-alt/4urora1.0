import React, { useState, useEffect } from 'react';
import { authenticate, getUsers } from '../services/storage';
import { User } from '../types';
import { Button } from './Button';
import { Card } from './Card';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticate(selectedUserId, pin);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 border-r-2 border-b-2 border-gold/10 rounded-br-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 border-l-2 border-t-2 border-gold/10 rounded-tl-[100px]"></div>

      <Card className="w-full max-w-md" title="4uror4 Acceso">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gold mb-2 font-deco tracking-wider">Músico / Usuario</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-deep/50 border border-gold text-gold p-3 focus:outline-none focus:ring-1 focus:ring-gold"
              required
            >
              <option value="">Seleccione su identidad</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gold mb-2 font-deco tracking-wider">PIN de Acceso</label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-deep/50 border border-gold text-gold p-3 text-center tracking-[1em] focus:outline-none focus:ring-1 focus:ring-gold font-mono"
              placeholder="••••"
              required
            />
          </div>

          {error && <p className="text-ruby text-center text-sm">{error}</p>}

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
};