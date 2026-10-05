// Cálculos nutricionales. Referencias:
// - Mifflin-St Jeor (1990) para gasto basal.
// - Proteína 1,6–2,2 g/kg con entrenamiento de fuerza (Morton y cols. 2018; ISSN 2017).
// - Pérdida de peso máxima ~1% del peso corporal por semana (Helms y cols. 2014).
import { num } from './format.js';

export const ACTIVIDAD = [
  { id: 'baja', nombre: 'Baja', hint: 'Trabajo sentado, poco ejercicio', factor: 1.2 },
  { id: 'ligera', nombre: 'Ligera', hint: '1–3 entrenamientos por semana', factor: 1.375 },
  { id: 'moderada', nombre: 'Moderada', hint: '3–5 entrenamientos por semana', factor: 1.55 },
  { id: 'alta', nombre: 'Alta', hint: '5–6 entrenamientos por semana', factor: 1.725 },
];

export function edadDesde(fechaNac) {
  if (!fechaNac) return 0;
  const [y, m, d] = fechaNac.split('-').map(Number);
  const hoy = new Date();
  let e = hoy.getFullYear() - y;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) e--;
  return e;
}

export function basal({ sexo, peso, estatura, edad }) {
  const w = num(peso), h = num(estatura), a = num(edad);
  if (!w || !h || !a) return 0;
  return 10 * w + 6.25 * h - 5 * a + (sexo === 'm' ? -161 : 5);
}

export function mantencion(perfil, pesoActual) {
  const f = (ACTIVIDAD.find((x) => x.id === perfil.actividad) || ACTIVIDAD[2]).factor;
  return basal({ ...perfil, peso: pesoActual || perfil.peso }) * f;
}

/** Objetivos del día según la fase y el tipo de día (carga/suave). */
export function objetivosDia(perfil, fase, pesoActual, tipoDia = 'carga') {
  const peso = num(pesoActual || perfil.peso);
  const tdee = mantencion(perfil, peso);
  const factor = fase?.kcalFactor ?? 0.85;
  const protKg = fase?.protKg ?? 1.8;
  let kcal = tdee * factor;
  const minimo = basal({ ...perfil, peso }) * 1.1; // nunca bajo el basal + margen
  kcal = Math.max(kcal, minimo);
  if (tipoDia === 'suave') kcal -= 250;
  if (tipoDia === 'partido') kcal += 200;
  const p = peso * protKg;
  const g = Math.max(peso * 0.8, (kcal * 0.25) / 9);
  const c = Math.max(0, (kcal - p * 4 - g * 9) / 4);
  return { kcal: Math.round(kcal / 10) * 10, p: Math.round(p), c: Math.round(c), g: Math.round(g), tdee: Math.round(tdee) };
}

export function totalesDia(comidas, fecha) {
  return comidas.filter((x) => x.fecha === fecha).reduce((a, x) => ({
    kcal: a.kcal + num(x.kcal), p: a.p + num(x.p), c: a.c + num(x.c), g: a.g + num(x.g),
  }), { kcal: 0, p: 0, c: 0, g: 0 });
}

/** Tendencia de peso: promedio móvil de 7 días. */
export function tendenciaPeso(mediciones) {
  const pesos = mediciones.filter((m) => m.tipo === 'peso').sort((a, b) => a.fecha.localeCompare(b.fecha));
  return pesos.map((m, i) => {
    const desde = pesos.slice(0, i + 1).filter((x) => (new Date(m.fecha) - new Date(x.fecha)) / 864e5 < 7);
    const prom = desde.reduce((a, x) => a + num(x.valor), 0) / desde.length;
    return { fecha: m.fecha, valor: num(m.valor), prom };
  });
}

export function pesoActual(perfil, mediciones) {
  const t = tendenciaPeso(mediciones);
  return t.length ? t[t.length - 1].prom : num(perfil?.peso);
}
