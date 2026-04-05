import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../hooks/useMediaQuery'
import LogoIE from '../assets/logoie.png';
import {
  Home, //FileText, Calendar, BarChart3, Bell,
  Settings, ChevronDown, //Sun, Moon,
  ChevronsLeft, ChevronsRight, X, Users, //Book,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  hasSubmenu?: boolean;
  submenuItems?: { id: string; label: string; route?: string }[];
  route?: string;
}

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const MENU_SECTIONS: { label: string; items: MenuItem[] }[] = [
  {
    label: 'MENU',
    items: [
      { id: 'dashboard', label: 'Inicio',       icon: <Home size={20} />,     route: '/Home' },
    //   { id: 'posts',     label: 'Voto Digital', icon: <FileText size={20} /> },
    ],
  },
//   {
//     label: 'ADMINISTRACIÓN',
//     items: [
//       { id: 'schedules', label: 'Calendario', icon: <Calendar size={20} />, route: '/calendario' },
//       {
//         id: 'candidatos', label: 'Candidatos', icon: <BarChart3 size={20} />, hasSubmenu: true,
//         submenuItems: [
//           { id: 'presidentes',   label: 'Presidentes',        route: '/candidatos/presidenciales' },
//           { id: 'partidos',      label: 'Partidos Políticos', route: '/candidatos/partidos' },
//           { id: 'alcaldes',      label: 'Alcaldes',           route: '/candidatos/alcaldes' },
//           { id: 'gestion-datos', label: 'Gestión de Datos',   route: '/candidatos/gestion-datos' },
//         ],
//       },
//     ],
//   },
//   {
//     label: 'SOPORTE',
//     items: [
//       {
//         id: 'assistant', label: 'Asistente', icon: <Bell size={20} />, hasSubmenu: true,
//         submenuItems: [
//           { id: 'chatbot',       label: 'ChatBot',       route: '/chatbot' },
//           { id: 'documentation', label: 'Documentación', route: '/documentacion' },
//         ],
//       },
//       { id: 'complaints-book', label: 'Libro de Reclamaciones', icon: <Book size={20} />,     route: '/reclamaciones' },
//       { id: 'user-manual',     label: 'Manual de Usuario',      icon: <FileText size={20} /> },
//     ],
//   },
  {
    label: 'SISTEMA',
    items: [
      { id: 'users', label: 'Usuarios', icon: <Users size={20} />, route: '/usuarios' },
    ],
  },
  {
    label: 'CONFIGURACIÓN',
    items: [
      {
        id: 'settings', label: 'Settings', icon: <Settings size={20} />, hasSubmenu: true,
        submenuItems: [
          { id: 'Perfil', label: 'Perfil', route: '/perfil' },
        ],
      },
    ],
  },
];

interface MenuItemRowProps {
  item: MenuItem;
  isActive: boolean;
  isExpanded: boolean;   // submenu abierto
  showText: boolean;
  onItemClick: (id: string) => void;
  onSubItemClick: (id: string) => void;
  activeItem: string;
}

const MenuItemRow: React.FC<MenuItemRowProps> = ({
  item, isActive, isExpanded, showText, onItemClick, onSubItemClick, activeItem,
}) => {
  const baseClass = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
    showText ? 'justify-between' : 'justify-center'
  } ${isActive && !item.hasSubmenu
    ? 'bg-gray-100 text-gray-900 font-semibold'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
  }`;

  const inner = (
    <>
      <div className="flex items-center gap-3">
        {item.icon}
        {showText && <span className="text-sm font-medium">{item.label}</span>}
      </div>
      {showText && item.hasSubmenu && (
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      )}
    </>
  );

  return (
    <div>
      {item.route && !item.hasSubmenu ? (
        <Link to={item.route} onClick={() => onItemClick(item.id)} className={baseClass}>
          {inner}
        </Link>
      ) : (
        <button onClick={() => onItemClick(item.id)} className={baseClass}>
          {inner}
        </button>
      )}

      <AnimatePresence>
        {showText && isExpanded && item.submenuItems && (
          <motion.div
            key={`submenu-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="ml-8 mt-1 space-y-1 border-l border-gray-200 pl-3 overflow-hidden"
          >
            {item.submenuItems.map((sub) => {
              const subClass = `block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                activeItem === sub.id
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`;
              return sub.route ? (
                <Link key={sub.id} to={sub.route} onClick={() => onSubItemClick(sub.id)} className={subClass}>
                  {sub.label}
                </Link>
              ) : (
                <button key={sub.id} onClick={() => onSubItemClick(sub.id)} className={subClass}>
                  {sub.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isExpanded, setIsExpanded]   = useState(true);
  // const [isDark, setIsDark]           = useState(false);
  const [activeItem, setActiveItem]   = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsExpanded(true);
  }, [isDesktop]);

  const toggleMenu = (id: string) =>
    setExpandedMenus((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    const allItems = MENU_SECTIONS.flatMap((s) => s.items);
    const item = allItems.find((i) => i.id === id);
    if (item?.hasSubmenu) {
      toggleMenu(id);
    } else if (!isDesktop) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubItemClick = (id: string) => {
    setActiveItem(id);
    if (!isDesktop) setIsMobileMenuOpen(false);
  };

  const showText = isDesktop ? isExpanded : true;

  return (
    <aside
      className={`bg-white transition-all duration-300 ease-in-out flex flex-col border-r border-gray-200
        fixed inset-y-0 left-0 z-30 lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDesktop ? (isExpanded ? 'w-64' : 'w-20') : 'w-64'}`}
    >
      {/* Logo */}
      <div className="px-4 pt-10 pb-6 flex items-center justify-between h-[100px] shrink-0">
        <div className="flex items-center justify-center w-full">
          <img
            src={LogoIE}
            alt="ONPE Logo"
            className={`${showText ? 'h-16' : 'h-10'} w-auto object-contain`}
          />
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-800 absolute right-4"
          aria-label="Cerrar menú"
        >
          <X size={24} />
        </button>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white rounded-full shadow-lg items-center justify-center
          text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all duration-200
          border border-gray-200 z-10 hidden lg:flex"
        aria-label={isExpanded ? 'Colapsar menú' : 'Expandir menú'}
      >
        {isExpanded ? <ChevronsLeft size={14} /> : <ChevronsRight size={14} />}
      </button>

      {/* Secciones del menú */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {MENU_SECTIONS.map((section) => (
          <div key={section.label}>
            {showText && (
              <div className="text-xs font-semibold text-gray-400 mb-3 px-3">
                {section.label}
              </div>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  isActive={activeItem === item.id}
                  isExpanded={!!expandedMenus[item.id]}
                  showText={showText}
                  onItemClick={handleItemClick}
                  onSubItemClick={handleSubItemClick}
                  activeItem={activeItem}
                />
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* <div className="p-4 border-t border-gray-200 shrink-0">
        {showText ? (
          <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
            {[{ dark: false, Icon: Sun, label: 'Light' }, { dark: true, Icon: Moon, label: 'Dark' }].map(({ dark, Icon, label }) => (
              <button
                key={label}
                onClick={() => setIsDark(dark)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isDark === dark ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center justify-center p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            {isDark ? <Moon size={20} className="text-gray-700" /> : <Sun size={20} className="text-gray-700" />}
          </button>
        )}
      </div> */}
    </aside>
  );
};

export default Sidebar;