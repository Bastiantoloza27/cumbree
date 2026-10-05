import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy, guardarPlan, XP } from './derived.js';
import { EJERCICIOS } from './phases.js';
import { weekday, corto } from './dates.js';
import { num, uid } from './format.js';
import { Header, Icon, useToast } from './ui.jsx';

function ultimo(data, nombre) {
  for (const s of data.fuerza) {
    const e = s.ejercicios.find((x) => x.nombre === nombre);
    if (e) { const hechas = e.series.filter((x) => x.hecha); if (hechas.length) return { fecha: s.fecha, series: hechas }; }
  }
  return null;
}

export default function SesionFuerza() {
  const { data, update, sumarXP } = useStore();
  const h = useHoy();
  const nav = useNavigate();
  const toast = useToast();
  const s = h.sesionHoy;
  const key = s?.ejercicios || (s?.titulo?.includes('torso') ? 'Torso' : s?.titulo?.includes('pierna') ? 'Pierna' : 'A');
  const reps = (h.fase?.series || '3×8').match(/(\d+)×(\d+)/) || [0, 3, 8];
  const [ej, setEj] = useState(() => (EJERCICIOS[key] || EJERCICIOS.A).map((nombre) => {
    const u = ultimo(data, nombre);
    const kg = u ? u.series[0].kg : '';
    return { nombre, series: Array.from({ length: +reps[1] }, () => ({ kg, reps: '', hecha: false })), ultimo: u };
  }));
  const [nuevo, setNuevo] = useState('');
  const setSerie = (i, j, patch) => setEj(ej.map((e, a) => (a === i ? { ...e, series: e.series.map((x, b) => (b === j ? { ...x, ...patch } : x)) } : e)));
  const total = ej.reduce((a, e) => a + e.series.length, 0);
  const hechas = ej.reduce((a, e) => a + e.series.filter((x) => x.hecha).length, 0);
  const terminar = () => {
    const sesion = { id: uid(), fecha: h.fecha, titulo: s?.tipo === 'fuerza' ? s.titulo : 'Fuerza', ejercicios: ej.map(({ nombre, series }) => ({ nombre, series })) };
    update((d) => ({ ...d, fuerza: [sesion, ...d.fuerza] }));
    const i = weekday(h.fecha);
    if (s?.tipo === 'fuerza' && !s.hecho) guardarPlan(update, h.lunes, h.plan.map((x, j) => (j === i ? { ...x, hecho: true } : x)));
    sumarXP(XP.sesion, 'Sesión de fuerza');
    toast(<span>Sesión guardada · <b>+{XP.sesion} XP</b></span>);
    nav('/hoy');
  };
  const sugerencia = (e) => {
    const u = e.ultimo;
    if (!u) return 'Elige un peso con el que completes todas las repeticiones con buena técnica.';
    const completas = u.series.every((x) => num(x.reps) >= +reps[2]);
    const kg = num(u.series[0].kg);
    return completas ? `La última vez (${corto(u.fecha)}) completaste todo con ${kg} kg: prueba ${String(kg + 2.5).replace('.', ',')} kg.` : `La última vez (${corto(u.fecha)}): ${kg} kg. Repite el peso hasta completar ${reps[1]}×${reps[2]}.`;
  };
  return (
    <div className="screen noNav">
      <Header title="Sesión de fuerza" eyebrow={`${h.fase ? `Fase ${h.fase.n} · ` : ''}${s?.tipo === 'fuerza' ? s.titulo : 'Sesión extra'} · objetivo ${h.fase?.series || '3×8'}`} right={<span className="tag dark" style={{ fontSize: 14, padding: '6px 12px', borderRadius: 999, color: 'var(--accent)' }}>{hechas}/{total}</span>} />
      {ej.map((e, i) => (
        <div key={e.nombre + i} className="card" style={{ gap: 8, padding: 14 }}>
          <div className="between"><span className="b" style={{ fontSize: 15 }}>{e.nombre}</span>
            <button type="button" className="chip" style={{ minHeight: 32 }} onClick={() => setEj(ej.map((x, a) => (a === i ? { ...x, series: [...x.series, { ...x.series[x.series.length - 1], hecha: false }] } : x)))}>+ serie</button></div>
          <span className="small muted">{sugerencia(e)}</span>
          <div style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr) minmax(0,1fr) 44px', gap: 6, fontSize: 11, fontWeight: 800 }} className="muted"><span>Serie</span><span>kg</span><span>Reps</span><span /></div>
          {e.series.map((x, j) => (
            <div key={j} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr) minmax(0,1fr) 44px', gap: 6, alignItems: 'center' }}>
              <span className="b small">{j + 1}</span>
              <input inputMode="decimal" aria-label={`${e.nombre} serie ${j + 1} kilos`} value={x.kg} onChange={(ev) => setSerie(i, j, { kg: ev.target.value })} style={{ minHeight: 40, border: 0, borderRadius: 10, background: x.hecha ? '#E9F7B8' : 'var(--ground)', textAlign: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16, width: '100%' }} />
              <input inputMode="numeric" aria-label={`${e.nombre} serie ${j + 1} repeticiones`} placeholder={reps[2]} value={x.reps} onChange={(ev) => setSerie(i, j, { reps: ev.target.value })} style={{ minHeight: 40, border: 0, borderRadius: 10, background: x.hecha ? '#E9F7B8' : 'var(--ground)', textAlign: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16, width: '100%' }} />
              <button type="button" className="check" aria-pressed={x.hecha} aria-label={`Serie ${j + 1} hecha`} style={{ width: 44 }} onClick={() => setSerie(i, j, { hecha: !x.hecha, reps: x.reps || reps[2] })}>{x.hecha && <Icon name="check" size={16} width={3.2} />}</button>
            </div>
          ))}
        </div>
      ))}
      <form className="row" onSubmit={(e) => { e.preventDefault(); if (nuevo.trim()) { setEj([...ej, { nombre: nuevo.trim(), series: [{ kg: '', reps: '', hecha: false }], ultimo: ultimo(data, nuevo.trim()) }]); setNuevo(''); } }}>
        <input className="input grow" placeholder="Agregar ejercicio" value={nuevo} onChange={(e) => setNuevo(e.target.value)} aria-label="Nuevo ejercicio" />
        <button className="btn white">Agregar</button>
      </form>
      <div className="card dark row" style={{ flexDirection: 'row', alignItems: 'flex-start', fontSize: 13, lineHeight: 1.4 }}>
        <Icon name="coach" stroke="var(--accent)" size={18} />
        <span><b>Coach:</b> descansa 2–3 min entre series pesadas. Si una serie te queda a más de 3 repeticiones del fallo, sube el peso la próxima vez.</span>
      </div>
      <button type="button" className="btn accent block" onClick={terminar} disabled={!hechas}>Terminar y tachar · +{XP.sesion} XP</button>
    </div>
  );
}
