import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from './store.jsx';
import { faseDe, semanaEnFase } from './phases.js';
import { mesAnio, corto } from './dates.js';
import { objetivosDia, pesoActual } from './nutrition.js';
import { Header, Icon } from './ui.jsx';

export default function Fases() {
  const { perfil, data } = useStore();
  const actual = faseDe(data.fases);
  const [sel, setSel] = useState(Math.max(0, (actual?.n || 1) - 1));
  const f = data.fases[sel];
  if (!f) return <div className="screen"><Header title="Fases" /><div className="empty">Crea tu meta para generar las fases.</div></div>;
  const peso = pesoActual(perfil, data.mediciones);
  const obj = objetivosDia(perfil, f, peso, 'carga');
  const c = f.carga;
  const entreno = [c.fuerza && `Fuerza ${c.fuerza}×/sem (${f.series})`, c.deporte && `deporte ${c.deporte}×`, c.aerobico && `aeróbico suave ${c.aerobico}×`].filter(Boolean).join(' · ');
  const deficit = Math.round((1 - f.kcalFactor) * 100);
  const nutricion = `${deficit > 0 ? `≈${deficit}% bajo tu mantención` : deficit < 0 ? `≈${-deficit}% sobre tu mantención` : 'Mantención'} · ≈${obj.kcal.toLocaleString('es-CL')} kcal en días de carga · proteína ${f.protKg.toString().replace('.', ',')} g/kg (≈${obj.p} g)`;
  return (
    <div className="screen dark noNav">
      <Header title={`Tu camino en ${data.fases.length} ${data.fases.length === 1 ? 'fase' : 'fases'}`} eyebrow="Plan generado para tu meta" back="/metas" />
      <div className="col">
        <div className="row" style={{ gap: 3, height: 42 }}>
          {data.fases.map((x, i) => (
            <button key={x.n} type="button" aria-pressed={i === sel} aria-label={`Fase ${x.n}: ${x.nombre}`} onClick={() => setSel(i)}
              style={{ flex: `${x.semanas} 1 0`, height: '100%', border: 0, borderRadius: 10, cursor: 'pointer', fontWeight: 800, background: i === sel ? 'var(--accent)' : actual?.n === x.n ? '#5C7A3A' : 'var(--track)', color: i === sel ? 'var(--dark)' : '#fff', outline: i === sel ? '2px solid #fff' : 'none', outlineOffset: 2 }}>{x.n}</button>
          ))}
        </div>
        <div className="between small b" style={{ color: '#B9C8C0' }}><span>{mesAnio(data.fases[0].inicio)}</span>{actual && <span>Hoy: semana {semanaEnFase(actual)} de la fase {actual.n}</span>}<span>{mesAnio(data.meta.fecha)}</span></div>
      </div>
      <div className="card soft" style={{ gap: 12 }}>
        <div className="col" style={{ gap: 2 }}>
          <span className="eyebrow" style={{ color: 'var(--accent)' }}>Fase {f.n} · {corto(f.inicio)} – {corto(f.fin)} · {f.semanas} semanas</span>
          <span className="big">{f.nombre}</span>
          <span style={{ fontSize: 13, color: '#DCE6E1' }}>{f.objetivo}</span>
        </div>
        {[['weight', 'Entrenamiento', entreno], ['flame', 'Nutrición', nutricion], ['metas', 'Pasas de fase cuando', f.gate]].map(([ic, t, v]) => (
          <div key={t} className="row" style={{ alignItems: 'flex-start' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={ic} size={18} stroke="var(--accent)" /></span>
            <span className="col" style={{ gap: 1 }}><span className="small b" style={{ color: '#B9C8C0' }}>{t}</span><span style={{ fontSize: 14, lineHeight: 1.4 }}>{v}</span></span>
          </div>
        ))}
        <div className="col" style={{ gap: 6, paddingTop: 10, borderTop: '1px solid var(--track)' }}>
          <span className="eyebrow" style={{ color: '#B9C8C0' }}>Por qué</span>
          <span style={{ fontSize: 13, lineHeight: 1.45, color: '#DCE6E1' }}>{f.por}</span>
          <span className="small b" style={{ color: 'var(--accent)' }}>{f.src}</span>
        </div>
      </div>
      <span className="grow" />
      <div className="row">
        <Link to="/meta" className="btn ghost" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>Ajustar</Link>
        <Link to="/semana/sugerencia" className="btn accent grow" style={{ minHeight: 54 }}>Ver mi semana sugerida</Link>
      </div>
    </div>
  );
}
