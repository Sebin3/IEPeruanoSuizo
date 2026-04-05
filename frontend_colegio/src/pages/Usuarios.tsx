import { useEffect, useState, useCallback } from 'react';
import { UserPlus, X, Search } from 'lucide-react';
import api from '../api/client';

interface Usuario {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  rol: string;
  telefono: string;
  is_active: boolean;
}

const ROL_BADGE: Record<string, string> = {
  admin:    'bg-purple-100 text-purple-700',
  profesor: 'bg-blue-100 text-blue-700',
  padre:    'bg-green-100 text-green-700',
};

const ROL_LABEL: Record<string, string> = {
  admin: 'Administrador', profesor: 'Profesor', padre: 'Padre',
};

const INITIAL_FORM = { email: '', nombres: '', apellidos: '', rol: 'profesor', telefono: '', password: '' };

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = rolFiltro ? `?rol=${rolFiltro}` : '';
      const res = await api.get(`/auth/usuarios/${params}`);
      setUsuarios(res.data.data);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }, [rolFiltro]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = usuarios.filter(u =>
    u.nombre_completo.toLowerCase().includes(filtro.toLowerCase()) ||
    u.email.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/auth/usuarios/', form);
      setModal(false);
      setForm(INITIAL_FORM);
      cargar();
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.email?.[0] ?? data?.password?.[0] ?? 'Error al crear usuario');
    } finally { setSaving(false); }
  };

  const toggleActivo = async (u: Usuario) => {
    try {
      if (u.is_active) {
        await api.delete(`/auth/usuarios/${u.id}/`);
      } else {
        await api.patch(`/auth/usuarios/${u.id}/`, { is_active: true });
      }
      cargar();
    } catch { /* silencioso */ }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 lg:p-8">
      {/* Modal crear usuario */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Nuevo usuario</h3>
              <button onClick={() => { setModal(false); setError(''); }} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombres</label>
                  <input required value={form.nombres} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apellidos</label>
                  <input required value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                  <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                    <option value="profesor">Profesor</option>
                    <option value="admin">Administrador</option>
                    <option value="padre">Padre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
                <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => { setModal(false); setError(''); }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition disabled:opacity-50">
                  {saving ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-sm text-gray-500">{filtrados.length} usuarios</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition">
          <UserPlus size={15} /> Nuevo usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <select value={rolFiltro} onChange={e => setRolFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400">
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="profesor">Profesor</option>
          <option value="padre">Padre</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.nombre_completo}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROL_BADGE[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROL_LABEL[u.rol] ?? u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.telefono || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActivo(u)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${u.is_active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600' : 'bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
