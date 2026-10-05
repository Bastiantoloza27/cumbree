import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from './store.jsx';
import { aplicarTema } from './themes.js';
import { Nav } from './ui.jsx';
import Splash from './Splash.jsx';
import Perfiles from './Perfiles.jsx';
import Onboarding from './Onboarding.jsx';
import EditarMeta from './EditarMeta.jsx';
import Fases from './Fases.jsx';
import Hoy from './Hoy.jsx';
import Semana from './Semana.jsx';
import EditarSemana from './EditarSemana.jsx';
import Sugerencia from './Sugerencia.jsx';
import Diario from './Diario.jsx';
import Producto from './Producto.jsx';
import Coach from './Coach.jsx';
import Metas from './Metas.jsx';
import Retos from './Retos.jsx';
import Registrar from './Registrar.jsx';
import SesionFuerza from './SesionFuerza.jsx';
import Padel from './Padel.jsx';
import Medidas from './Medidas.jsx';
import Revision from './Revision.jsx';
import Progreso from './Progreso.jsx';
import Perfil from './Perfil.jsx';

const CON_NAV = ['/hoy', '/diario', '/semana', '/metas', '/coach', '/retos', '/progreso'];

function Protegida({ children }) {
  const { perfil, data } = useStore();
  const loc = useLocation();
  if (!perfil) return <Navigate to="/perfiles" replace />;
  if (!perfil.listo && loc.pathname !== '/bienvenida') return <Navigate to="/bienvenida" replace />;
  if (perfil.listo && !data.meta && !['/meta', '/fases', '/bienvenida', '/perfil'].includes(loc.pathname)) return <Navigate to="/meta" replace />;
  return children;
}

export default function App() {
  const { perfil } = useStore();
  const loc = useLocation();
  useEffect(() => { aplicarTema(perfil?.tema || 'bosque'); }, [perfil?.tema]);
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  const p = (el) => <Protegida>{el}</Protegida>;
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/perfiles" element={<Perfiles />} />
        <Route path="/bienvenida" element={p(<Onboarding />)} />
        <Route path="/meta" element={p(<EditarMeta />)} />
        <Route path="/fases" element={p(<Fases />)} />
        <Route path="/hoy" element={p(<Hoy />)} />
        <Route path="/semana" element={p(<Semana />)} />
        <Route path="/semana/editar" element={p(<EditarSemana />)} />
        <Route path="/semana/sugerencia" element={p(<Sugerencia />)} />
        <Route path="/diario" element={p(<Diario />)} />
        <Route path="/producto" element={p(<Producto />)} />
        <Route path="/coach" element={p(<Coach />)} />
        <Route path="/metas" element={p(<Metas />)} />
        <Route path="/retos" element={p(<Retos />)} />
        <Route path="/registrar" element={p(<Registrar />)} />
        <Route path="/fuerza" element={p(<SesionFuerza />)} />
        <Route path="/padel" element={p(<Padel />)} />
        <Route path="/medidas" element={p(<Medidas />)} />
        <Route path="/revision" element={p(<Revision />)} />
        <Route path="/progreso" element={p(<Progreso />)} />
        <Route path="/perfil" element={p(<Perfil />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {perfil?.listo && CON_NAV.includes(loc.pathname) && <Nav />}
    </div>
  );
}
