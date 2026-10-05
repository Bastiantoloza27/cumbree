import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy } from './derived.js';
import { DIAS, addWeeks, corto, addDays, today, mondayOf } from './dates.js';
import { Bar, Brand, Icon } from './ui.jsx';
import { useToggleSesion } from './Hoy.jsx';
import { construirPlan } from './derived.js';
import Checklist from './Checklist.jsx';

export default function Semana() {
  const { data } = useStore();
  const [offset, setOffset] = useState(0);
  const lunes = addWeeks(mondayOf(today()), offset);
  const h = useHoy(addDays(lunes, offset === 0 ? (new Date().getDay() + 6) % 7 : 0));
  const plan = construirPlan(data, lunes);
  const toggle = useToggleSesion();
  const entrenos = plan.filter((x) => x.tipo !== 'descanso');
  const hechos = entrenos.filter((x) => x.hecho).length;
  const meta = Math.max(1, Math.ceil(entrenos.length * 0.8));
  return (
    <div className="screen">
      <div className="between">
        <div className="col" style={{ gap: 2 }}>
          <span className="small b muted">{corto(lunes)} – {corto(addDays(lunes, 6))}</span>
          <h1 className="h1">{offset === 0 ? 'Tu semana' : offset > 0 ? 'Próxima semana' : 'Semana pasada'}</h1>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button type="button" className="iconBtn" aria-label="Semana anterior" onClick={() => setOffset(offset - 1)}><Icon name="back" size={18} /></button>
          <button type="button" className="iconBtn" aria-label="Semana siguiente" onClick={() => setOffset(offset + 1)}><Icon name="next" size={18} /></button>
        </div>
      </div>

      <div className="card dark">
        <div className="between">
          <span className="eyebrow" style={{ color: 'var(--accent)' }}>Misión semanal</span>
          <span className="tag ok" style={{ fontSize: 12 }}>+200 XP</span>
        </div>
        <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>Completa {meta} de {entrenos.length} entrenamientos{h.fase ? ` · fase ${h.fase.nombre}` : ''}</span>
        <Bar pct={(hechos / meta) * 100} />
        <span className="small" style={{ color: '#DCE6E1' }}>{hechos} de {entrenos.length} tachados</span>
      </div>

      <div className="row">
        <Link to={`/semana/sugerencia?lunes=${lunes}`} className="btn primary grow"><Icon name="coach" size={18} /> Sugerencia del coach</Link>
        <Link to={`/semana/editar?lunes=${lunes}`} className="btn white"><Icon name="edit" size={18} /> Editar</Link>
      </div>

      <div className="col" style={{ gap: 8 }}>
        {plan.map((s, i) => s.tipo === 'descanso' ? (
          <div key={i} className="row" style={{ padding: '10px 14px', borderRadius: 18, border: '1.5px dashed #B9C8C0', minHeight: 48 }}>
            <span className="small b muted" style={{ width: 36 }}>{DIAS[i]}</span>
            <span className="muted b" style={{ fontSize: 14 }}>{s.titulo}</span>
          </div>
        ) : (
          <button key={i} type="button" onClick={() => toggle(lunes, plan, i)} aria-pressed={s.hecho} className="row"
            style={{ padding: '10px 14px', borderRadius: 18, border: `2px solid ${lunes === mondayOf(today()) && i === (new Date().getDay() + 6) % 7 ? 'var(--dark)' : 'transparent'}`, background: '#fff', cursor: 'pointer', textAlign: 'left', minHeight: 60, width: '100%' }}>
            <span className="small b" style={{ width: 36 }}>{DIAS[i]}</span>
            <span className="col grow" style={{ gap: 2 }}>
              <span className={s.hecho ? 'strike b' : 'b'} style={{ fontSize: 15 }}>{s.titulo}{s.min ? ` · ${s.min} min` : ''}</span>
              <span className="small muted">{s.detalle}</span>
            </span>
            <span className="check" aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 10, background: s.hecho ? 'var(--accent)' : '#fff' }}>{s.hecho && <Icon name="check" size={16} width={3.2} />}</span>
          </button>
        ))}
      </div>
      <Checklist lunes={lunes} />
      <Link to="/registrar" className="small b" style={{ textAlign: 'center', padding: 8 }}>¿Hiciste algo fuera del plan? Regístralo con el botón +</Link>
      <Brand />
    </div>
  );
}
