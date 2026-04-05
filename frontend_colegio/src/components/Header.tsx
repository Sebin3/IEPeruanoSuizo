import React, { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import defaultPerfil from '../assets/defaultperfil.jpg';

interface HeaderProps {
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsMobileMenuOpen }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const raw = localStorage.getItem('usuario');
  const usuario = raw ? JSON.parse(raw) : null;
  const nombreMostrar = usuario?.nombre_completo ?? 'Usuario';

  const cerrarSesion = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        const { default: api } = await import('../api/client');
        await api.post('/auth/logout/', { refresh });
      }
    } catch { /* silencioso */ }
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} De ${month} De ${year}`;
  };

  return (
    <header className="flex items-center justify-between h-[69px] border-b border-gray-200 px-4 md:px-6 shrink-0">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-gray-600 hover:text-gray-900"
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Date and Time */}
      <div className="ml-auto text-right lg:mr-4">
        <div className="text-sm font-medium text-slate-800">
          {formatTime(currentTime)}
        </div>
        <div className="text-xs text-slate-500 capitalize whitespace-nowrap">
          {formatDate(currentTime)}
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2 md:gap-3 ml-3 md:ml-6">
        {/* Notification Icon with Dropdown */}
        <button 
          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={20} />
        </button>

        {/* Language/Settings Dropdown
        <button 
          className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Idioma"
        >
          <span className="text-sm font-medium">ES</span>
          <ChevronDown size={14} className="text-gray-500" />
        </button> */}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

        {/* User Profile */}
        <button 
          className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 md:px-3 py-2 transition-colors"
          aria-label="Perfil de usuario"
        >
          <div className="text-right hidden xl:block">
            <div className="text-sm font-semibold text-gray-800">{nombreMostrar}</div>
          </div>
          <img
            src={defaultPerfil}
            alt={nombreMostrar}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-200 shrink-0"
          />
          <ChevronDown size={16} className="text-gray-500 hidden sm:block" />
        </button>

        <button
          onClick={cerrarSesion}
          className="flex items-center gap-1 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;