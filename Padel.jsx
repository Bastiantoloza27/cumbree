import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy, guardarPlan, XP } from './derived.js';
import { weekday, today } from './dates.js';
import { uid, num } from './format.js';
import { Header, useToast } from './ui.jsx';

const GOLPES = ['Saque', 'Resto', 'Bandeja', 'Víbora', 'Volea de derecha', 'Volea de revés', 'Globo', 'Salida de pared', 'Remate'];

export default function Padel() {
  const { data, update, sumarXP } = useStore();
  const h = useHoy();
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ tipo: 'Amistoso', resultado: 'Gané', marcador: '', min: 90, kcal: '', nivel: 3, golpes: [], nota: '' });
  const mes = today().slice(0, 7);
  const delMes = data.padel.filter((p) => p.fecha.startsWith(mes));
  const guardar = () => {
    update((d) => ({ ...d, padel: [{ id: uid(), fecha: h.fecha, ...f, min: num(f.min), kcal: num(f.kcal) }, ...d.padel] }));
    const i = weekday(h.fecha);
    const s = h.plan[i];
    if (s.tipo === 'deporte' && !s.hecho) guardarPlan(update, h.lunes, h.plan.map((x, j) => (j === i ? { ...x, hecho: true } : x)));
    sumarXP(XP.deporte, 'Partido de pádel');
    toast(<span>Partido guardado · <b>+{XP.deporte} XP</b></span>);
    nav('/hoy');
  };
  const chip = (k, v) => <button key={v} type="button" className="chip" aria-pressed={f[k] === v} onClick={() => setF({ ...f, [k]: v })}>{v}</button>;
  return (
    <div className="screen noNav">
      <Header title="Partido de pádel" eyebrow={`Este mes: ${delMes.length} partidos · ${delMes.filter((p) => p.resultado === 'Gané').length} ganados`} />
      <div className="field">Tipo<div className="wrap">{['Amistoso', 'Americano', 'Torneo', 'Clase'].map((v) => chip('tipo', v))}</div></div>
      <div className="field">Resultado<div className="wrap">{['Gané', 'Perdí', 'Sin marcador'].map((v) => chip('resultado', v))}</div>
        <input className="input" placeholder="Marcador (ej.: 6-4 / 4-6 / 6-3)" value={f.marcador} onChange={(e) => setF({ ...f, marcador: e.target.value })} aria-label="Marcador" /></div>
      <div className="grid2">
        <label className="field">Minutos<input className="input big" inputMode="numeric" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} /></label>
        <label className="field">kcal (Apple Watch)<input className="input big" inputMode="numeric" placeholder="opcional" value={f.kcal} onChange={(e) => setF({ ...f, kcal: e.target.value })} /></label>
      </div>
      <div className="field">¿Cómo jugaste? (1 a 5)
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className="seg" aria-pressed={f.nivel === n} onClick={() => setF({ ...f, nivel: n })}>{n}</button>)}</div>
      </div>
      <div className="field">Golpes a trabajar<div className="wrap">{GOLPES.map((g) => <button key={g} type="button" className="chip" aria-pressed={f.golpes.includes(g)} onClick={() => setF({ ...f, golpes: f.golpes.includes(g) ? f.golpes.filter((x) => x !== g) : [...f.golpes, g] })}>{g}</button>)}</div></div>
      <label className="field">Nota<textarea className="input" rows={2} value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} placeholder="Ej.: me faltó aire en el tercer set" /></label>
      <button type="button" className="btn accent block" onClick={guardar}>Guardar y tachar · +{XP.deporte} XP</button>
    </div>
  );
}
