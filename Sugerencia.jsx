import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from './store.jsx';
import { faseDe, semanaEnFase, sugerirSemana, tipoDia } from './phases.js';
import { guardarPlan, construirPlan } from './derived.js';
import { objetivosDia, pesoActual } from './nutrition.js';
import { DIAS, mondayOf, today } from './dates.js';
import { fmt } from './format.js';
import { Header, Icon, useToast } from './ui.jsx';

export default function Sugerencia() {
  const { perfil, data, update } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [sp] = useSearchParams();
  const lunes = sp.get('lunes') || mondayOf(today());
  const fase = faseDe(data.fases, lunes);
  const semanaN = semanaEnFase(fase, lunes);
  const actual = construirPlan(data, lunes);
  const sug = useMemo(() => (fase ? sugerirSemana(fase, data.plantilla || actual, semanaN) : null), [fase, semanaN]); // eslint-disable-line
  const [ok, setOk] = useState(() => Array(7).fill(true));
  if (!fase) return <div className="screen noNav"><Header title="Semana sugerida" /><div className="empty">Crea tu meta para recibir sugerencias.</div></div>;
  const peso = pesoActual(perfil, data.mediciones);
  const carga = objetivosDia(perfil, sug.pausa ? { ...fase, kcalFactor: 1 } : fase, peso, 'carga');
  const suave = objetivosDia(perfil, sug.pausa ? { ...fase, kcalFactor: 1 } : fase, peso, 'suave');
  const n = ok.filter(Boolean).length;
  const aceptar = () => {
    const dias = sug.dias.map((s, i) => (ok[i] ? { ...s, hecho: actual[i]?.hecho && actual[i].titulo === s.titulo } : actual[i]));
    guardarPlan(update, lunes, dias);
    toast(n === 7 ? 'Semana sugerida aceptada' : `${n} días aceptados`);
    nav(n === 7 ? '/semana' : `/semana/editar?lunes=${lunes}`);
  };
  return (
    <div className="screen noNav">
      <Header title="Semana sugerida" eyebrow={`Fase ${fase.n} · ${fase.nombre} · semana ${semanaN} de ${fase.semanas}`} />
      <div className="card dark" style={{ gap: 4 }}>
        <span className="eyebrow" style={{ color: 'var(--accent)' }}>Por qué esta semana</span>
        {sug.razones.map((r) => <span key={r} style={{ fontSize: 13, lineHeight: 1.45 }}>• {r}</span>)}
      </div>
      <div className="col" style={{ gap: 6 }}>
        {sug.dias.map((s, i) => {
          const t = tipoDia(s);
          return (
            <div key={i} className="row" style={{ background: '#fff', borderRadius: 14, padding: '6px 10px 6px 6px', minHeight: 52, opacity: ok[i] ? 1 : 0.55 }}>
              <button type="button" className="check" aria-pressed={ok[i]} aria-label={`${ok[i] ? 'Quitar' : 'Aceptar'} ${s.titulo}`} onClick={() => setOk(ok.map((x, j) => (j === i ? !x : x)))} style={{ width: 38, height: 38 }}>{ok[i] && <Icon name="check" size={14} width={3.2} />}</button>
              <span className="small b" style={{ width: 34 }}>{DIAS[i]}</span>
              <span className="col grow" style={{ gap: 0, minWidth: 0 }}>
                <span className={ok[i] ? 'b' : 'b strike'} style={{ fontSize: 14 }}>{s.titulo}{s.fijo ? ' · fijo' : ''}</span>
                <span className="small muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.detalle}</span>
              </span>
              <span className={`tag ${t === 'suave' ? 'light' : 'warn'}`}>{t === 'suave' ? 'Suave' : 'Carga'}</span>
            </div>
          );
        })}
      </div>
      <div className="card" style={{ gap: 4 }}>
        <span className="b" style={{ fontSize: 13 }}>Nutrición de la semana{sug.pausa ? ' · semana en mantención' : ''}</span>
        <span className="small" style={{ lineHeight: 1.45 }}><b>Días de carga:</b> {fmt(carga.kcal)} kcal · P {carga.p} · C {carga.c} g. <b>Días suaves:</b> {fmt(suave.kcal)} kcal · P {suave.p} · C {suave.c} g. La proteína se mantiene igual todos los días.</span>
        <span className="small muted">{fase.src}</span>
      </div>
      <button type="button" className="btn primary block" onClick={aceptar}>{n === 7 ? 'Aceptar semana completa' : `Aceptar ${n} días y ajustar el resto`}</button>
      <Link to={`/semana/editar?lunes=${lunes}`} className="btn" style={{ background: 'transparent' }}>Prefiero armarla yo</Link>
    </div>
  );
}
