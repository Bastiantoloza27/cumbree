// Almacenamiento del prototipo. Cada perfil guarda sus datos en una clave propia de
// localStorage, así los perfiles quedan completamente separados.
// En Base44 esta capa se reemplaza por las entidades de los JSON de entidades (ver BASE44.md):
// cada colección de abajo corresponde a una entidad con user_id.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { today } from './dates.js';

const K_PROFILES = 'cumbre:perfiles';
const K_ACTIVE = 'cumbre:activo';
const kData = (id) => `cumbre:datos:${id}`;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
}

export function emptyData() {
  return {
    meta: null,           // { titulo, fecha, inicio, dims[], hitos[] }
    fases: [],            // generadas por phases.js
    plantilla: null,      // semana tipo (7 días) elegida por el usuario
    planes: {},           // { 'YYYY-MM-DD lunes': [7 sesiones] }
    comidas: [],          // RegistroComida
    favoritos: [],        // comidas frecuentes
    agua: {},             // { fecha: vasos de 250 ml }
    mediciones: [],       // { id, fecha, tipo: peso|cintura|..., valor, fuente }
    fotos: [],            // { id, fecha, dataUrl }
    fuerza: [],           // sesiones con series
    padel: [],            // partidos
    retos: [],
    revisiones: [],
    chat: [],
    xp: 0,
    logros: [],
    actividades: ['Fuerza inferior', 'Fuerza superior', 'Fuerza cuerpo completo', 'Pádel', 'Zona 2 · trote', 'Zona 2 · bici', 'Movilidad', 'Caminata', 'Descanso'],
    ajustes: { factorEjercicio: 0.5, aguaMeta: 12, coachUrl: '', coachKey: '', coachModelo: 'gpt-4o-mini' },
  };
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [perfiles, setPerfiles] = useState(() => read(K_PROFILES, []));
  const [activoId, setActivoId] = useState(() => read(K_ACTIVE, null));
  const [data, setData] = useState(() => (activoId ? { ...emptyData(), ...read(kData(activoId), {}) } : emptyData()));

  useEffect(() => { write(K_PROFILES, perfiles); }, [perfiles]);
  useEffect(() => { write(K_ACTIVE, activoId); }, [activoId]);
  useEffect(() => { if (activoId) write(kData(activoId), data); }, [data, activoId]);

  const perfil = perfiles.find((p) => p.id === activoId) || null;

  const entrar = useCallback((id) => {
    setActivoId(id);
    setData(id ? { ...emptyData(), ...read(kData(id), {}) } : emptyData());
  }, []);

  const salir = useCallback(() => { setActivoId(null); setData(emptyData()); }, []);

  const crearPerfil = useCallback((p) => {
    setPerfiles((ps) => [...ps, p]);
    write(kData(p.id), emptyData());
    setActivoId(p.id);
    setData(emptyData());
  }, []);

  const actualizarPerfil = useCallback((patch) => {
    setPerfiles((ps) => ps.map((p) => (p.id === activoId ? { ...p, ...patch } : p)));
  }, [activoId]);

  const borrarPerfil = useCallback((id) => {
    setPerfiles((ps) => ps.filter((p) => p.id !== id));
    try { localStorage.removeItem(kData(id)); } catch { /* */ }
    if (id === activoId) { setActivoId(null); setData(emptyData()); }
  }, [activoId]);

  /** update(d => ({...d, campo})) */
  const update = useCallback((fn) => setData((d) => fn(d)), []);

  const sumarXP = useCallback((n, motivo) => {
    setData((d) => ({ ...d, xp: (d.xp || 0) + n, logros: [{ fecha: today(), n, motivo }, ...(d.logros || [])].slice(0, 200) }));
  }, []);

  const value = useMemo(() => ({ perfiles, perfil, data, entrar, salir, crearPerfil, actualizarPerfil, borrarPerfil, update, sumarXP }),
    [perfiles, perfil, data, entrar, salir, crearPerfil, actualizarPerfil, borrarPerfil, update, sumarXP]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() { return useContext(Ctx); }

export function exportarDatos(perfil, data) {
  const blob = new Blob([JSON.stringify({ perfil, data, exportado: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cumbre-${perfil?.nombre || 'perfil'}-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
