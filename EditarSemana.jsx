import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from './store.jsx';
import { construirPlan, guardarPlan } from './derived.js';
import { DIAS_LARGOS, DIAS, mondayOf, today } from './dates.js';
import { Header, Icon, Stepper, useToast } from './ui.jsx';

function tipoDe(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('descanso')) return 'descanso';
  if (n.includes('fuerza')) return 'fuerza';
  if (n.includes('pádel') || n.includes('padel') || n.includes('partido') || n.includes('tenis') || n.includes('fútbol')) return 'deporte';
  if (n.includes('movilidad') || n.includes('yoga')) return 'movilidad';
  return 'aerobico';
}

export default function EditarSemana() {
  const { data, update } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [sp] = useSearchParams();
  const lunes = sp.get('lunes') || mondayOf(today());
  const [dias, setDias] = useState(() => construirPlan(data, lunes).map((x) => ({ ...x })));
  const [sel, setSel] = useState((new Date().getDay() + 6) % 7);
  const [repetir, setRepetir] = useState(!!data.plantilla);
  const [nueva, setNueva] = useState('');
  const cur = dias[sel];
  const setCur = (patch) => setDias(dias.map((d, i) => (i === sel ? { ...d, ...patch } : d)));
  const elegir = (nombre) => {
    const tipo = tipoDe(nombre);
    setCur({ titulo: nombre, tipo, min: tipo === 'descanso' ? 0 : cur.min || (tipo === 'deporte' ? 90 : 45), detalle: '', ejercicios: nombre.includes('torso') ? 'Torso' : nombre.includes('inferior') || nombre.includes('pierna') ? 'Pierna' : nombre.includes('superior') ? 'Torso' : 'A' });
  };
  const agregarActividad = () => {
    const n = nueva.trim();
    if (!n) return;
    update((d) => ({ ...d, actividades: [...new Set([...(d.actividades || []), n])] }));
    elegir(n);
    setNueva('');
  };
  const guardar = () => {
    guardarPlan(update, lunes, dias);
    update((d) => ({ ...d, plantilla: repetir ? dias.map((x) => ({ ...x, hecho: false })) : null }));
    toast('Semana guardada');
    nav('/semana');
  };
  const n = dias.filter((d) => d.tipo !== 'descanso').length;
  return (
    <div className="screen noNav">
      <Header title="Planificar semana" eyebrow="Toca un día y elige qué harás" />
      <Link to={`/semana/sugerencia?lunes=${lunes}`} className="card dark row" style={{ flexDirection: 'row', textDecoration: 'none', padding: '10px 12px' }}>
        <Icon name="coach" stroke="var(--accent)" />
        <span className="grow" style={{ fontSize: 13, lineHeight: 1.35 }}><b>Usar la semana sugerida</b><br />Según tu fase y tus días fijos</span>
        <Icon name="next" stroke="var(--accent)" />
      </Link>
      <div className="col" style={{ gap: 6 }}>
        {dias.map((d, i) => (
          <button key={i} type="button" aria-pressed={i === sel} onClick={() => setSel(i)} className="row"
            style={{ padding: '0 14px', minHeight: 44, borderRadius: 14, border: `2px solid ${i === sel ? 'var(--dark)' : 'transparent'}`, background: d.tipo === 'descanso' ? 'transparent' : '#fff', color: d.tipo === 'descanso' ? 'var(--muted)' : 'var(--ink)', cursor: 'pointer', width: '100%' }}>
            <span className="small b" style={{ width: 38, textAlign: 'left' }}>{DIAS[i]}</span>
            <span className="grow b" style={{ textAlign: 'left', fontSize: 14 }}>{d.titulo}</span>
            <span className="small b muted">{d.min ? `${d.min} min` : ''}</span>
          </button>
        ))}
      </div>
      <div className="card">
        <span className="b" style={{ fontSize: 13 }}>{DIAS_LARGOS[sel]}: {cur.titulo}</span>
        <div className="wrap">
          {(data.actividades || []).map((a) => <button key={a} type="button" className="chip" aria-pressed={cur.titulo === a} onClick={() => elegir(a)}>{a}</button>)}
        </div>
        <div className="row">
          <input className="input grow" style={{ background: 'var(--ground)', minHeight: 44 }} placeholder="Otra actividad (ej.: Natación)" value={nueva} onChange={(e) => setNueva(e.target.value)} aria-label="Nueva actividad" />
          <button type="button" className="btn primary" style={{ minHeight: 44 }} onClick={agregarActividad}>Agregar</button>
        </div>
        {cur.tipo !== 'descanso' && (
          <div className="between"><span className="b" style={{ fontSize: 13 }}>Duración</span><Stepper value={cur.min || 0} step={5} min={5} label="minutos" onChange={(v) => setCur({ min: v })} format={(v) => `${v} min`} /></div>
        )}
        <label className="field" style={{ fontSize: 13 }}>Nota (opcional)<input className="input" style={{ background: 'var(--ground)', minHeight: 44 }} value={cur.detalle || ''} onChange={(e) => setCur({ detalle: e.target.value })} /></label>
      </div>
      <button type="button" className="row" onClick={() => setRepetir(!repetir)} aria-pressed={repetir} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer', minHeight: 44 }}>
        <span style={{ width: 50, height: 30, borderRadius: 999, background: repetir ? 'var(--dark)' : '#C9D6CF', display: 'flex', alignItems: 'center', padding: 3, justifyContent: repetir ? 'flex-end' : 'flex-start' }}><span style={{ width: 24, height: 24, borderRadius: 999, background: repetir ? 'var(--accent)' : '#fff' }} /></span>
        <span className="b" style={{ fontSize: 14 }}>Usar como plan fijo cada semana</span>
      </button>
      <button type="button" className="btn primary block" onClick={guardar}>Guardar · {n} entrenamientos</button>
    </div>
  );
}
