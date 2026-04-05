import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Usuarios from './pages/Usuarios';
// import GestionUser from './features/System/Users/ui/GestionUser';
// import Calendary from './features/Administration/Calendary/ui/Calendary';
// import ChatBot from './features/Support/Assistant/ui/ChatBot';
// import Reclamaciones from './features/Support/Reclamaciones/ui/Reclamaciones';
// import Documentation from './features/Support/Manual/ui/Documentation';
// import GestionPresidenciales from './features/Administration/Candidates/ui/GestionPresidenciales';
// import PartidosPoliticos from './features/Administration/Candidates/ui/PartidosPoliticos';
// import GestionAlcaldes from './features/Administration/Candidates/ui/GestionAlcaldes';
// import GestionDatos from './features/Administration/Data/ui/GestionDatos';
// import ControlPanel from './features/System/Control/ui/ControlPanel';
// import Home from './features/Home/Main/ui/Home';
// import Perfil from './features/Configuration/ui/Perfil';
// import { UserProvider } from './context/UserContext';
// import { AccionesProvider } from './context/AccionesContext';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/*" element={
          isLoggedIn ? (
            <div className="flex h-screen w-full bg-gray-50 text-gray-800">
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                )}
              </AnimatePresence>
              <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
              <main className="flex-1 flex flex-col overflow-hidden">
                <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
                <Routes>
                  <Route path="/Home" element={<div className="flex-1 overflow-hidden h-full"><Home /></div>} />
                  <Route path="/perfil" element={<div className="flex-1 overflow-y-auto"><Perfil /></div>} />
                  <Route path="/usuarios" element={<div className="flex-1 overflow-hidden h-full"><Usuarios /></div>} />
                  <Route path="*" element={<Navigate to="/Home" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;