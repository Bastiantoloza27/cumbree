import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from './store.jsx';
import { XP, useHoy } from './derived.js';
import { today } from './dates.js';
import { num, uid, fmt1 } from './format.js';
import { Header, Icon, useToast } from './ui.jsx';

const TILES = [
  ['Comida', '/diario', 'diario', '#F6D7AE'], ['Escanear producto', '/producto', 'barcode', '#F6D7AE'], ['Hablar con el coach', '/coach', 'coach', '#F6D7AE'],
  ['Sesión de fuerza', '/fuerza', 'weight', 'var(--accent)'], ['Partido de pádel', '/padel', 'padel', 'var(--accent)'], ['Otro entreno', '/semana', 'bolt', 'var(--accent)'],
  ['Avance de reto', '/retos', 'metas', '#D9C9F3'], ['Medidas y fotos', '/medidas', 'ruler', '#D9C9F3'], ['Energía y semana', '/revision', 'face', '#D9C9F3'],
];

export default function Registrar() {
  const { data, update, sumarXP } = useStore();
  const h = useHoy();
  const toast = useToast();
  const hoy = today();
  const vasos = data.agua[hoy] || 0;
  const meta = data.ajustes.aguaMeta || 12;
  const pesoHoy = data.mediciones.find((m) => m.fecha === hoy && m.tipo === 'peso');
  const [peso, setPeso] = useState(pesoHoy ? String(pesoHoy.valor).replace('.', ',') : '');
  const setAgua = (n) => {
    const v = Math.max(0, Math.min(meta + 4, n));
    update((d) => ({ ...d, agua: { ...d.agua, [hoy]: v } }));
    if (v === meta && vasos < meta) { sumarXP(XP.agua, 'Meta de agua'); toast(<span>¡Meta de agua! <b>+{XP.agua} XP</b></span>); }
  };
  const guardarPeso = () => {
    const v = num(peso); if (v < 25) return;
    update((d) => ({ ...d, mediciones: [{ id: uid(), fecha: hoy, tipo: 'peso', valor: v, fuente: 'manual' }, ...d.mediciones.filter((m) => !(m.fecha === hoy && m.tipo === 'peso'))] }));
    if (!pesoHoy) sumarXP(XP.peso, 'Peso del día');
    toast('Peso guardado');
  };
  return (
    <div className="screen noNav">
      <Header title="¿Qué registras?" eyebrow="Todo en un solo lugar" back="/hoy" />
      <div className="card" style={{ gap: 10 }}>
        <div className="between">
          <span className="col" style={{ gap: 0 }}><span className="b">Agua</span><span className="small muted">{fmt1((vasos * 250) / 1000)} de {fmt1((meta * 250) / 1000)} litros</span></span>
          <span className="row" style={{ gap: 6 }}>
            <button type="button" className="iconBtn" style={{ background: 'var(--ground)' }} aria-label="Quitar un vaso" onClick={() => setAgua(vasos - 1)}>−</button>
            <button type="button" className="btn" style={{ background: 'var(--prot)', color: '#fff', minHeight: 44, borderRadius: 12 }} onClick={() => setAgua(vasos + 1)}>+250 ml</button>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${meta}, minmax(0, 1fr))`, gap: 3 }}>{Array.from({ length: meta }, (_, i) => <div key={i} style={{ height: 20, borderRadius: 6, background: i < vasos ? 'var(--prot)' : 'var(--line)' }} />)}</div>
      </div>
      <div className="card row" style={{ flexDirection: 'row' }}>
        <span className="col grow" style={{ gap: 0 }}><span className="b">Peso de hoy</span><span className="small muted">{pesoHoy ? `Guardado · tendencia ${fmt1(h.peso)} kg` : 'En ayunas, después del baño'}</span></span>
        <label className="unitInput"><input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} aria-label="Peso en kilos" /><span className="small b muted">kg</span></label>
        <button type="button" className="btn accent" style={{ minHeight: 44, borderRadius: 12, padding: '0 12px' }} onClick={guardarPeso}>{pesoHoy ? 'Actualizar' : 'Guardar'}</button>
      </div>
      <div className="grid3">
        {TILES.map(([n, to, ic, bg]) => (
          <Link key={n} to={to} className="card" style={{ padding: '12px 8px', alignItems: 'center', textAlign: 'center', textDecoration: 'none', gap: 6, minHeight: 88 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={20} stroke="#0F2A22" /></span>
            <span className="b" style={{ fontSize: 12, lineHeight: 1.2 }}>{n}</span>
          </Link>
        ))}
      </div>
      <span className="small muted" style={{ textAlign: 'center' }}>Pasos, sueño y calorías activas se importan desde Apple Salud (ver guía en el repositorio).</span>
    </div>
  );
}
