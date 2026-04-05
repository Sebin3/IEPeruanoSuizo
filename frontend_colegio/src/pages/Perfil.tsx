import { useState } from 'react';
import { User, Mail, Phone, Shield, KeyRound, Save } from 'lucide-react';
import api from '../api/client';
import defaultPerfil from '../assets/defaultperfil.jpg';

const ROL_LABEL: Record<string, string> = {
  admin:    'Administrador',
  profesor: 'Profesor',
  padre:    'Padre de familia',
};

const Perfil = () => {
  const raw = localStorage.getItem('usuario');
  const usuario = raw ? JSON.parse(raw) : null;

  const [telefono, setTelefono] = useState(usuario?.telefono ?? '');
  const [pwActual, setPwActual] = useState('');
  const [pwNuevo, setPwNuevo] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [msgPerfil, setMsgPerfil] = useState('');
  const [msgPw, setMsgPw] = useState('');
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPerfil(true);
    setMsgPerfil('');
    try {
      const res = await api.patch('/auth/perfil/', { telefono });
      const updated = { ...usuario, telefono: res.data.data.telefono };
      localStorage.setItem('usuario', JSON.stringify(updated));
      setMsgPerfil('Perfil actualizado correctamente.');
    } catch {
      setMsgPerfil('Error al actualizar el perfil.');
    } finally {
      setLoadingPerfil(false);
    }
  };

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNuevo !== pwConfirm) { setMsgPw('Las contraseñas no coinciden.'); return; }
    setLoadingPw(true);
    setMsgPw('');
    try {
      await api.post('/auth/cambiar-password/', {
        password_actual: pwActual,
        password_nuevo: pwNuevo,
        password_confirmacion: pwConfirm,
      });
      setMsgPw('Contraseña actualizada correctamente.');
      setPwActual(''); setPwNuevo(''); setPwConfirm('');
    } catch {
      setMsgPw('Error: verifica tu contraseña actual.');
    } finally {
      setLoadingPw(false);
    }
  };

  if (!usuario) return <div className="p-8 text-gray-500">No hay sesión activa.</div>;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-8">
        <img src={defaultPerfil} alt="perfil"
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
        <div>
          <h1 className="text-xl font-bold text-gray-800">{usuario.nombre_completo}</h1>
          <span className="inline-block mt-1 rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600">
            {ROL_LABEL[usuario.rol] ?? usuario.rol}
          </span>
        </div>
      </div>

      {/* Datos del perfil */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <User size={15} /> Información personal
        </h2>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail size={14} className="text-gray-400 shrink-0" />
            <span>{usuario.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Shield size={14} className="text-gray-400 shrink-0" />
            <span>{ROL_LABEL[usuario.rol] ?? usuario.rol}</span>
          </div>
        </div>
        <form onSubmit={guardarPerfil} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Phone size={12} /> Teléfono
            </label>
            <input
              type="text"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Ej: 987654321"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          {msgPerfil && <p className="text-xs text-green-600">{msgPerfil}</p>}
          <button type="submit" disabled={loadingPerfil}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition disabled:opacity-50">
            <Save size={14} /> {loadingPerfil ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <KeyRound size={15} /> Cambiar contraseña
        </h2>
        <form onSubmit={cambiarPassword} className="space-y-3">
          {[
            { label: 'Contraseña actual', val: pwActual, set: setPwActual },
            { label: 'Nueva contraseña',  val: pwNuevo,  set: setPwNuevo },
            { label: 'Confirmar nueva',   val: pwConfirm, set: setPwConfirm },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input type="password" value={val} onChange={e => set(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
          ))}
          {msgPw && <p className={`text-xs ${msgPw.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{msgPw}</p>}
          <button type="submit" disabled={loadingPw}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition disabled:opacity-50">
            <KeyRound size={14} /> {loadingPw ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Perfil;
