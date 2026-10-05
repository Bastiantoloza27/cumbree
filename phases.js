// Motor de fases (periodización) y de semanas sugeridas.
// Las fases las calculan reglas fijas, no la IA, para que el plan sea consistente y verificable.
// Referencias: ACSM 2009 (progresión en fuerza), Schoenfeld y cols. 2016 (frecuencia 2×/músculo),
// Helms y cols. 2014 (déficit y proteína), Byrne y cols. 2018 (pausas en mantención),
// ACSM/AND/DC 2016 (carbohidratos según carga), PROT-AGE 2013 (proteína en adultos mayores).
import { addWeeks, weeksBetween, mondayOf, today, addDays } from './dates.js';
import { num } from './format.js';

const S = (titulo, tipo, min, detalle = '') => ({ titulo, tipo, min, detalle, hecho: false });

const PLANTILLAS = {
  recomp: [
    { nombre: 'Base y hábitos', share: 0.2, kcalFactor: 0.85, protKg: 1.8, carga: { fuerza: 3, aerobico: 2, deporte: 1 }, series: '3×10',
      objetivo: 'Aprender la técnica, crear rutina y empezar a bajar grasa.',
      gate: 'Cumples el 80% de las sesiones y dominas los ejercicios básicos.',
      por: 'Empezar con volumen moderado y progresar de a poco reduce lesiones y asegura adherencia. La proteína alta cuida el músculo durante el déficit.',
      src: 'ACSM 2009 · Morton y cols. 2018 · ISSN 2017' },
    { nombre: 'Fuerza y músculo', share: 0.25, kcalFactor: 0.95, protKg: 2.0, carga: { fuerza: 4, aerobico: 1, deporte: 2 }, series: '4×6',
      objetivo: 'Ganar fuerza y masa muscular manteniendo la grasa a raya.',
      gate: 'Subes tus cargas un 10–15% con el peso estable o bajando levemente.',
      por: 'Entrenar cada músculo dos veces por semana rinde más que una. Comer cerca de la mantención permite ganar músculo sin frenar la fuerza.',
      src: 'Schoenfeld y cols. 2016 · ACSM/AND/DC 2016' },
    { nombre: 'Definición', share: 0.25, kcalFactor: 0.82, protKg: 2.2, carga: { fuerza: 3, aerobico: 2, deporte: 2 }, series: '3×8', pausa: true,
      objetivo: 'Bajar la grasa restante conservando la fuerza ganada.',
      gate: 'Llegas a tu hito de peso o se cumple el plazo de la fase.',
      por: 'Bajar más de 1% del peso por semana aumenta la pérdida de músculo. Una semana en mantención a mitad de fase hace el déficit más llevadero.',
      src: 'Helms y cols. 2014 · Byrne y cols. 2018' },
    { nombre: 'Rendimiento', share: 0.3, kcalFactor: 1.0, protKg: 1.8, carga: { fuerza: 2, aerobico: 1, deporte: 3 }, series: '3×5 explosivo',
      objetivo: 'Llevar la fuerza a tu deporte y llegar en tu mejor forma a la fecha.',
      gate: 'Tu cumbre: la meta completa.',
      por: 'El foco pasa de cambiar el cuerpo a rendir. Comer en mantención y ajustar carbohidratos a la carga sostiene la energía.',
      src: 'ACSM/AND/DC 2016 · ISSN 2017 (timing)' },
  ],
  ganar: [
    { nombre: 'Base y técnica', share: 0.2, kcalFactor: 1.0, protKg: 1.8, carga: { fuerza: 3, aerobico: 1, deporte: 1 }, series: '3×10',
      objetivo: 'Aprender la técnica y crear rutina.', gate: '80% de sesiones cumplidas.',
      por: 'Una base técnica sólida permite progresar más rápido después.', src: 'ACSM 2009' },
    { nombre: 'Hipertrofia', share: 0.4, kcalFactor: 1.1, protKg: 1.8, carga: { fuerza: 4, aerobico: 1, deporte: 1 }, series: '4×8–10',
      objetivo: 'Ganar masa muscular con un superávit pequeño.', gate: 'Subes 0,25–0,5% del peso por semana.',
      por: 'Un superávit moderado limita la ganancia de grasa mientras se construye músculo.', src: 'Schoenfeld y cols. 2016 · ISSN 2017' },
    { nombre: 'Fuerza', share: 0.25, kcalFactor: 1.05, protKg: 1.8, carga: { fuerza: 4, aerobico: 1, deporte: 1 }, series: '5×5',
      objetivo: 'Convertir el músculo nuevo en fuerza.', gate: 'Récords en los ejercicios básicos.',
      por: 'Menos repeticiones con más carga desarrollan la fuerza máxima.', src: 'ACSM 2009' },
    { nombre: 'Consolidación', share: 0.15, kcalFactor: 1.0, protKg: 1.7, carga: { fuerza: 3, aerobico: 2, deporte: 1 }, series: '3×6',
      objetivo: 'Mantener lo ganado y llegar a la fecha.', gate: 'Tu cumbre.',
      por: 'Mantener volumen moderado consolida las adaptaciones.', src: 'ACSM 2009' },
  ],
  salud: [
    { nombre: 'Base y movilidad', share: 0.3, kcalFactor: 1.0, protKg: 1.2, carga: { fuerza: 2, aerobico: 3, deporte: 0 }, series: '2×12',
      objetivo: 'Moverte con confianza, ganar movilidad y crear el hábito.', gate: '80% de sesiones cumplidas sin molestias.',
      por: 'Para adultos se recomienda fuerza al menos 2 días y 150–300 minutos de actividad moderada a la semana. Empezar suave asegura constancia.',
      src: 'OMS 2020 · PROT-AGE 2013' },
    { nombre: 'Fuerza y equilibrio', share: 0.4, kcalFactor: 1.0, protKg: 1.2, carga: { fuerza: 3, aerobico: 2, deporte: 1 }, series: '3×10',
      objetivo: 'Ganar fuerza en piernas y espalda y mejorar el equilibrio.', gate: 'Subes cargas y te sientes con más energía.',
      por: 'La fuerza y el equilibrio protegen músculos, huesos y articulaciones, y reducen el riesgo de caídas.',
      src: 'OMS 2020 · ACSM 2009' },
    { nombre: 'Consolidación', share: 0.3, kcalFactor: 1.0, protKg: 1.2, carga: { fuerza: 3, aerobico: 2, deporte: 1 }, series: '3×10',
      objetivo: 'Mantener la rutina y probar deportes nuevos.', gate: 'Tu cumbre.',
      por: 'Variar actividades mantiene la motivación y la adherencia a largo plazo.', src: 'OMS 2020' },
  ],
};

export function dimPeso(meta) { return meta?.dims?.find((d) => d.fuente === 'peso' && d.activa); }
export function tieneDeporte(meta) { return meta?.dims?.some((d) => d.activa && (d.fuente === 'padel' || d.fuente === 'deporte')); }

export function elegirPlantilla(meta, perfil, peso) {
  const dp = dimPeso(meta);
  const edad = num(perfil?.edad);
  if (dp && num(dp.objetivo) > num(peso) + 1) return 'ganar';
  if (edad >= 55 || !dp) return 'salud';
  return 'recomp';
}

/** Genera las fases desde hoy hasta la fecha de la meta. */
export function generarFases(meta, perfil, peso) {
  const inicio = mondayOf(meta.inicio || today());
  const total = Math.max(1, weeksBetween(inicio, meta.fecha));
  const id = elegirPlantilla(meta, perfil, peso);
  let base = PLANTILLAS[id].map((f) => ({ ...f }));
  const salud = id === 'salud';
  if (salud && dimPeso(meta) && num(dimPeso(meta).objetivo) < num(peso)) base = base.map((f) => ({ ...f, kcalFactor: 0.9, protKg: 1.4 }));
  if (!tieneDeporte(meta)) base = base.map((f) => ({ ...f, carga: { ...f.carga, aerobico: f.carga.aerobico + f.carga.deporte, deporte: 0 } }));
  if (id === 'recomp' && !tieneDeporte(meta)) base[3] = { ...base[3], nombre: 'Consolidación', objetivo: 'Mantener lo logrado y llegar a la fecha en tu mejor forma.' };
  // Cada fase dura al menos 6 semanas: si no alcanza, se usan menos fases (siempre la primera y la última).
  const maxFases = Math.max(1, Math.floor(total / 6));
  if (base.length > maxFases) base = maxFases === 1 ? [base[0]] : [...base.slice(0, maxFases - 1), base[base.length - 1]];
  const sumShare = base.reduce((a, f) => a + f.share, 0);
  let acum = 0;
  return base.map((f, i) => {
    const semanas = i === base.length - 1 ? total - acum : Math.max(6, Math.round((f.share / sumShare) * total));
    const desde = addWeeks(inicio, acum);
    acum += semanas;
    return { ...f, n: i + 1, plantillaId: id, semanas, inicio: desde, fin: addDays(addWeeks(desde, semanas), -1) };
  });
}

export function faseDe(fases, fecha = today()) {
  if (!fases?.length) return null;
  return fases.find((f) => fecha >= f.inicio && fecha <= f.fin) || (fecha < fases[0].inicio ? fases[0] : fases[fases.length - 1]);
}
export function semanaEnFase(fase, fecha = today()) {
  if (!fase) return 0;
  return Math.min(fase.semanas, Math.max(1, weeksBetween(fase.inicio, mondayOf(fecha)) + 1));
}

/** Realismo del objetivo de peso: tope de 1% del peso corporal por semana. */
export function realismoPeso(meta, peso) {
  const dp = dimPeso(meta);
  if (!dp) return null;
  const semanas = Math.max(1, weeksBetween(today(), meta.fecha));
  const delta = num(peso) - num(dp.objetivo);
  if (delta <= 0) return { ok: true, texto: 'Meta de peso de mantención o aumento.' };
  const porSemana = delta / semanas;
  const pct = (porSemana / num(peso)) * 100;
  if (pct > 1) return { ok: false, porSemana, texto: `Necesitarías bajar ${porSemana.toFixed(2).replace('.', ',')} kg por semana (más del 1% de tu peso). Te sugiero mover la fecha o ajustar el objetivo.` };
  if (pct > 0.7) return { ok: true, porSemana, texto: `Exigente pero posible: ${porSemana.toFixed(2).replace('.', ',')} kg por semana.` };
  return { ok: true, porSemana, texto: `Ritmo sano: ${porSemana.toFixed(2).replace('.', ',')} kg por semana.` };
}

export const EJERCICIOS = {
  A: ['Sentadilla', 'Press de banca', 'Remo con barra'],
  B: ['Peso muerto rumano', 'Press militar', 'Jalón o dominadas'],
  Torso: ['Press de banca', 'Remo con barra', 'Press militar', 'Jalón o dominadas'],
  Pierna: ['Sentadilla', 'Peso muerto rumano', 'Zancadas', 'Gemelos'],
  Salud: ['Sentadilla a cajón', 'Remo con banda', 'Puente de glúteo', 'Equilibrio en un pie'],
};

function nombresFuerza(n, salud) {
  if (salud) return Array.from({ length: n }, (_, i) => ({ t: `Fuerza y equilibrio ${'AB'[i % 2]}`, key: 'Salud' }));
  if (n >= 4) return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? { t: 'Fuerza · torso', key: 'Torso' } : { t: 'Fuerza · pierna', key: 'Pierna' }));
  return Array.from({ length: n }, (_, i) => ({ t: `Fuerza ${'AB'[i % 2]} · cuerpo completo`, key: 'AB'[i % 2] }));
}

/**
 * Sugiere la semana según la fase. Respeta los días fijos del usuario
 * (cualquier día de su plantilla que sea de deporte, ej. pádel el jueves).
 */
export function sugerirSemana(fase, plantillaUsuario, semanaN = 1) {
  const dias = Array(7).fill(null);
  const deporteNombre = 'Pádel';
  // 1. Días fijos del usuario (deporte)
  (plantillaUsuario || []).forEach((s, i) => { if (s && s.tipo === 'deporte') dias[i] = { ...s, hecho: false, fijo: true }; });
  // 2. Domingo: descanso y revisión
  dias[6] = dias[6] || S('Descanso + revisión', 'descanso', 0, 'Caminata libre y cierre de semana');
  const { fuerza, aerobico, deporte } = fase.carga;
  const salud = fase.plantillaId === 'salud';
  // 3. Fuerza con 48 h entre sesiones cuando se puede
  const prefFuerza = fuerza >= 4 ? [0, 1, 3, 4] : [0, 2, 4, 1];
  const nombres = nombresFuerza(fuerza, salud);
  let k = 0;
  for (const d of prefFuerza) {
    if (k >= fuerza) break;
    if (!dias[d]) { dias[d] = { ...S(nombres[k].t, 'fuerza', salud ? 40 : 50, `${EJERCICIOS[nombres[k].key].join(', ')} · ${fase.series}`), ejercicios: nombres[k].key }; k++; }
  }
  // 4. Deporte que falte
  let dep = dias.filter((x) => x?.tipo === 'deporte').length;
  for (const d of [3, 5, 1, 2]) { if (dep >= deporte) break; if (!dias[d]) { dias[d] = S(deporteNombre, 'deporte', 90, 'Partido o clase'); dep++; } }
  // 5. Aeróbico
  let ae = 0;
  for (const d of [1, 5, 2, 4, 3]) { if (ae >= aerobico) break; if (!dias[d]) { dias[d] = S(d === 5 ? 'Zona 2 larga' : 'Zona 2', 'aerobico', d === 5 ? 60 : 40, 'Ritmo conversable · bici, trote o caminata rápida'); ae++; } }
  // 6. Resto: movilidad / descanso
  for (let d = 0; d < 7; d++) if (!dias[d]) dias[d] = S('Movilidad o descanso', 'descanso', 0, '10–15 min de movilidad opcional');
  // Descarga cada 4.ª semana
  const descarga = semanaN % 4 === 0;
  if (descarga) dias.forEach((s) => { if (s.tipo === 'fuerza') { s.min = Math.round(s.min * 0.7); s.detalle += ' · semana de descarga: −1 serie'; } });
  // Pausa en mantención a mitad de la fase de definición
  const pausa = fase.pausa && semanaN === Math.ceil(fase.semanas / 2);
  const razones = [];
  razones.push(fuerza >= 3 ? 'Fuerza con 48 h entre sesiones para recuperar.' : 'Fuerza 2 veces para sostener músculo y huesos.');
  if (aerobico) razones.push('Aeróbico suave para la base cardiovascular.');
  if (dias.some((x) => x.fijo)) razones.push('Se respetan tus días fijos de deporte.');
  if (descarga) razones.push('Semana de descarga: menos volumen para consolidar.');
  else razones.push('Sube 1 serie o 2,5 kg en lo que te resultó fácil la semana pasada.');
  if (pausa) razones.push('Esta semana comes en mantención (pausa del déficit).');
  return { dias, razones, descarga, pausa };
}

export function tipoDia(sesion) {
  if (!sesion) return 'suave';
  if (sesion.tipo === 'deporte' && sesion.min >= 90) return 'partido';
  return sesion.tipo === 'fuerza' || sesion.tipo === 'deporte' ? 'carga' : 'suave';
}

/** Hitos sugeridos: uno por fase, a partir de las dimensiones activas. */
export function sugerirHitos(meta, fases, peso) {
  const dp = dimPeso(meta);
  return fases.map((f, i) => {
    const ultimo = i === fases.length - 1;
    let texto = `Completar la fase ${f.nombre}`;
    if (ultimo) texto = 'Cumbre: meta completa';
    else if (dp) {
      const objetivo = num(peso) - ((num(peso) - num(dp.objetivo)) * (i + 1)) / fases.length;
      texto = `${f.nombre}: llegar a ${objetivo.toFixed(1).replace('.', ',')} kg`;
    }
    return { id: `h${i}`, fecha: f.fin, texto, logrado: false };
  });
}

export function planDeSemana(data, lunes) {
  return data.planes?.[lunes] || null;
}
