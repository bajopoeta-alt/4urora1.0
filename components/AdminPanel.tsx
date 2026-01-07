import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { getUsers, saveUser, deleteUser } from '../services/storage';
import { Button } from './Button';
import { Trash2, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newRole, setNewRole] = useState<Role>('musician');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.id === newId)) {
      setMsg('El ID ya existe.');
      return;
    }
    saveUser({ id: newId, name: newName, role: newRole, pin: '1111' });
    setUsers(getUsers());
    setNewName('');
    setNewId('');
    setMsg('Usuario creado con éxito.');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
        setMsg("No puedes eliminarte a ti mismo.");
        return;
    }
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      deleteUser(id);
      setUsers(getUsers());
    }
  };

  const handleResetPin = (id: string) => {
    const u = users.find(u => u.id === id);
    if (u) {
      saveUser({ ...u, pin: '1111' });
      alert(`PIN de ${u.name} restablecido a 1111`);
    }
  };

  const handleRoleChange = (id: string, newRole: Role) => {
      if (currentUser.role !== 'superuser') {
          setMsg('Solo Fortuna puede cambiar roles.');
          return;
      }
      const u = users.find(u => u.id === id);
      if (u) {
          saveUser({ ...u, role: newRole });
          setUsers(getUsers());
      }
  }

  // Only superuser/admin can see this, but superuser has more power
  const isSuper = currentUser.role === 'superuser';

  return (
    <div className="space-y-8">
      <div className="bg-deep/50 p-6 border border-gold/30">
        <h3 className="text-gold font-deco text-lg mb-4 uppercase">Nuevo Usuario</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs text-gold/70 block mb-1">Nombre</label>
            <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-deep border border-gold p-2 text-white" />
          </div>
          <div>
            <label className="text-xs text-gold/70 block mb-1">ID Único</label>
            <input required value={newId} onChange={e => setNewId(e.target.value)} className="w-full bg-deep border border-gold p-2 text-white" />
          </div>
          <div>
            <label className="text-xs text-gold/70 block mb-1">Rol</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value as Role)} className="w-full bg-deep border border-gold p-2 text-white">
              <option value="musician">Músico</option>
              <option value="admin">Administrador</option>
              {isSuper && <option value="superuser">Superusuario</option>}
            </select>
          </div>
          <Button type="submit">Crear</Button>
        </form>
        {msg && <p className="text-gold mt-2 text-sm">{msg}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gold/20">
          <thead className="bg-gold/10 text-gold uppercase text-xs">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Rol</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10 text-gray-300 text-sm">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="p-3 font-mono">{u.id}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">
                    {isSuper && u.id !== currentUser.id ? (
                        <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                            className="bg-transparent border-b border-gold/30 text-gold focus:outline-none"
                        >
                            <option value="musician" className="bg-deep">Músico</option>
                            <option value="admin" className="bg-deep">Admin</option>
                            <option value="superuser" className="bg-deep">Super</option>
                        </select>
                    ) : (
                        <span className="uppercase text-xs tracking-wider">{u.role}</span>
                    )}
                </td>
                <td className="p-3 flex justify-end gap-2">
                  <button onClick={() => handleResetPin(u.id)} className="text-gold hover:text-white" title="Reset PIN">
                    <RefreshCw size={16} />
                  </button>
                  {isSuper && (
                    <button onClick={() => handleDelete(u.id)} className="text-ruby hover:text-red-400" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};