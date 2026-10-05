// Cálculos derivados que usan varias pantallas.
import { useMemo } from 'react';
import { useStore } from './store.jsx';
import { today, mondayOf, addDays, weekday } from './dates.js';
import { faseDe, semanaEnFase, sugerirSemana, tipoDia } from './phases.js';
import { objetivosDia, totalesDia, pesoActual } from './nutrition.js';
import { num } from './format.js';

export const XP = { comida: 15, sesion: 50, deporte: 60, aerobico: 40, agua: 5, peso: 5, medidas: 40, revision: 100, reto: 300, hito: 300 };
export const nivel = (xp) => Math.floor((xp || 0) / 250) + 1;

export function planVacio() {
  return Array.from({ length: 7 }, (_, i) => ({ titulo: i === 6 ? 'Descanso + revisión' : 'Libre', tipo: 'descanso', min: 0, detalle: '', hecho: false }));
}

export function construirPlan(data, lunes) {
  if (data.planes?.[lunes]) return data.planes[lunes];
  const fase = faseDe(data.fases, lunes);
  if (data.plantilla) return data.plantilla.map((s) => ({ ...s, hecho: false }));
  if (fase) return sugerirSemana(fase, null, semanaEnFase(fase, lunes)).dias;
  return planVacio();
}

/** Racha: días seguidos (hasta hoy) con al menos una comida registrada o una sesión hecha. */
export function racha(data) {
  const activos = new Set(data.comidas.map((c) => c.fecha));
  Object.entries(data.planes || {}).forEach(([lunes, dias]) => dias.forEach((s, i) => { if (s.hecho) activos.add(addDays(lunes, i)); }));
  let n = 0;
  let d = today();
  if (!activos.has(d)) d = addDays(d, -1);
  while (activos.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

export function valorDimension(dim, data, perfil) {
  switch (dim.fuente) {
    case 'peso': return pesoActual(perfil, data.mediciones);
    case 'fuerza': {
      const ej = (dim.ejercicio || 'Sentadilla').toLowerCase();
      let max = num(dim.inicial);
      data.fuerza.forEach((s) => s.ejercicios.forEach((e) => { if (e.nombre.toLowerCase() === ej) e.series.forEach((x) => { if (x.hecha) max = Math.max(max, num(x.kg)); }); }));
      return max;
    }
    case 'padel': case 'deporte': return data.padel.length;
    case 'retos': return data.retos.filter((r) => r.estado === 'logrado').length;
    case 'medida': {
      const ms = data.mediciones.filter((m) => m.tipo === dim.medida).sort((a, b) => a.fecha.localeCompare(b.fecha));
      return ms.length ? num(ms[ms.length - 1].valor) : num(dim.inicial);
    }
    default: return num(dim.actual ?? dim.inicial);
  }
}

export function progresoDimension(dim, data, perfil) {
  const ini = num(dim.inicial);
  const obj = num(dim.objetivo);
  const act = valorDimension(dim, data, perfil);
  if (obj === ini) return { act, pct: 100 };
  const pct = Math.max(0, Math.min(100, ((act - ini) / (obj - ini)) * 100));
  return { act, pct: Math.round(pct) };
}

export function useHoy(fecha = today()) {
  const { perfil, data } = useStore();
  return useMemo(() => {
    if (!perfil) return null;
    const lunes = mondayOf(fecha);
    const plan = construirPlan(data, lunes);
    const sesionHoy = plan[weekday(fecha)];
    const fase = faseDe(data.fases, fecha);
    const semanaN = semanaEnFase(fase, fecha);
    const peso = pesoActual(perfil, data.mediciones);
    const tipo = tipoDia(sesionHoy);
    const base = objetivosDia(perfil, fase, peso, tipo);
    const activas = data.padel.filter((x) => x.fecha === fecha).reduce((a, x) => a + num(x.kcal), 0) * (data.ajustes?.factorEjercicio ?? 0.5);
    const extra = Math.round((data.ajustes?.ajusteKcal || 0) + activas);
    const objetivos = { ...base, kcal: base.kcal + extra, c: base.c + Math.round(extra / 4) };
    const totales = totalesDia(data.comidas, fecha);
    const dims = (data.meta?.dims || []).filter((d) => d.activa).map((d) => ({ ...d, ...progresoDimension(d, data, perfil) }));
    const avance = dims.length ? Math.round(dims.reduce((a, d) => a + d.pct, 0) / dims.length) : 0;
    const revision = data.revisiones[0] || null;
    return { fecha, lunes, plan, sesionHoy, fase, semanaN, peso, tipo, objetivos, totales, dims, avance, revision, racha: racha(data), nivel: nivel(data.xp) };
  }, [perfil, data, fecha]);
}

/** Guarda el plan de la semana (lo materializa si era sugerido). */
export function guardarPlan(update, lunes, dias) {
  update((d) => ({ ...d, planes: { ...d.planes, [lunes]: dias } }));
}
