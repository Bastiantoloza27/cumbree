import { Link, useNavigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy, guardarPlan, XP } from './derived.js';
import { largo, weekday, DIAS, mesAnio, weeksBetween, today } from './dates.js';
import { fmt } from './format.js';
import { Bar, Brand, Icon, Ring, useToast } from './ui.jsx';

export function useToggleSesion() {
  const { update, sumarXP } = useStore();
  const toast = useToast();
  return (lunes, plan, i) => {
    const s = plan[i];
    if (s.tipo === 'descanso' && !s.hecho) return;
    const dias = plan.map((x, j) => (j === i ? { ...x, hecho: !x.hecho } : x));
    guardarPlan(update, lunes, dias);
    if (!s.hecho) {
      const n = s.tipo === 'fuerza' ? XP.sesion : s.tipo === 'deporte' ? XP.deporte : XP.aerobico;
      sumarXP(n, s.titulo);
      toast(<span>¡Tachado! <b>+{n} XP</b></span>);
    }
  };
}

export default function Hoy() {
  const { perfil, data } = useStore();
  const h = useHoy();
  const nav = useNavigate();
  const toggle = useToggleSesion();
  const iHoy = weekday(h.fecha);
  const s = h.sesionHoy;
  const entrenos = h.plan.filter((x) => x.tipo !== 'descanso');
  const hechos = entrenos.filter((x) => x.hecho).length;
  const pctK = h.objetivos.kcal ? (h.totales.kcal / h.objetivos.kcal) * 100 : 0;
  const restantes = Math.round(h.objetivos.kcal - h.totales.kcal);
  const abrirSesion = () => {
    if (s.tipo === 'fuerza' && !s.hecho) nav('/fuerza');
    else if (s.tipo === 'deporte' && /p[aá]del/i.test(s.titulo) && !s.hecho) nav('/padel');
    else toggle(h.lunes, h.plan, iHoy);
  };
  const domingo = iHoy === 6;
  const revisada = data.revisiones[0]?.lunes === h.lunes;

  return (
    <div className="screen">
      <div className="between">
        <div className="col" style={{ gap: 2 }}>
          <span className="small b muted" style={{ fontSize: 13 }}>{largo(h.fecha)}</span>
          <h1 className="h1">Hola, {perfil.nombre}</h1>
        </div>
        <Link to="/perfil" aria-label="Perfil y ajustes" className="row" style={{ background: 'var(--dark)', color: '#fff', borderRadius: 999, padding: '8px 12px 8px 8px', textDecoration: 'none', minHeight: 44, gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent)', color: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 13 }}>{h.nivel}</span>
          <span className="small b">{fmt(data.xp)} XP</span>
        </Link>
      </div>

      <Link to="/metas" className="card dark" style={{ textDecoration: 'none', gap: 12 }}>
        <div className="between">
          <span className="eyebrow" style={{ color: 'var(--accent)' }}>Tu cumbre · {mesAnio(data.meta.fecha)}</span>
          <span className="small b" style={{ opacity: 0.85 }}>Ver camino</span>
        </div>
        <span style={{ fontFamily: 'var(--display)', fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>{data.meta.titulo}</span>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, h.dims.length) || 1}, minmax(0, 1fr))`, gap: 8 }}>
          {h.dims.slice(0, 4).map((d) => (
            <div key={d.id} className="col" style={{ gap: 5 }}>
              <Bar pct={d.pct} height={6} />
              <span className="small b" style={{ opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre.split(' ')[0]}</span>
            </div>
          ))}
        </div>
        <span className="small" style={{ opacity: 0.85 }}>{h.fase ? `Fase ${h.fase.n} de ${data.fases.length} · ${h.fase.nombre} · semana ${h.semanaN} de ${h.fase.semanas}` : ''} · quedan {weeksBetween(today(), data.meta.fecha)} semanas</span>
      </Link>

      <div className="card">
        <div className="between"><span className="h2" style={{ fontSize: 17 }}>Semana de entrenamiento</span><span className="small b muted">{hechos} de {entrenos.length}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
          {h.plan.map((x, i) => {
            const rest = x.tipo === 'descanso';
            return (
              <button key={i} type="button" onClick={() => toggle(h.lunes, h.plan, i)} aria-pressed={x.hecho} aria-label={`${DIAS[i]}: ${x.titulo}${x.hecho ? ', hecho' : ''}`}
                style={{ height: 52, borderRadius: 16, border: `2px solid ${i === iHoy ? 'var(--dark)' : 'transparent'}`, background: x.hecho ? 'var(--accent)' : rest ? 'transparent' : 'var(--ground)', color: rest ? 'var(--muted)' : 'var(--dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: rest ? 'default' : 'pointer', padding: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{DIAS[i].charAt(0)}</span>
                {x.hecho ? <Icon name="check" size={16} width={3} /> : rest ? <span style={{ fontSize: 10 }}>—</span> : <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor' }} />}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={abrirSesion} className="row" style={{ padding: '10px 12px', borderRadius: 16, border: 0, background: 'var(--ground)', cursor: 'pointer', textAlign: 'left', minHeight: 56 }}>
          <span className="check" aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 9, background: s.hecho ? 'var(--accent)' : '#fff' }}>{s.hecho && <Icon name="check" size={14} width={3.2} />}</span>
          <span className="col grow" style={{ gap: 1 }}>
            <span className={s.hecho ? 'strike b' : 'b'} style={{ fontSize: 15 }}>Hoy · {s.titulo}{s.min ? ` ${s.min} min` : ''}</span>
            <span className="small muted">{s.tipo === 'descanso' ? 'Día suave: recupera y camina' : s.tipo === 'fuerza' && !s.hecho ? 'Toca para registrar tus series' : s.detalle}</span>
          </span>
        </button>
      </div>

      <div className="grid2">
        <Link to="/diario" className="card" style={{ alignItems: 'center', textDecoration: 'none', gap: 8 }}>
          <Ring pct={pctK} size={100}>
            <span style={{ fontFamily: 'var(--display)', fontSize: 21, fontWeight: 800 }}>{fmt(Math.abs(restantes))}</span>
            <span className="small b muted">{restantes >= 0 ? 'kcal restantes' : 'kcal sobre meta'}</span>
          </Ring>
          <span className="small b muted">Meta {fmt(h.objetivos.kcal)} · día {h.tipo === 'suave' ? 'suave' : 'de carga'}</span>
        </Link>
        <div className="card" style={{ justifyContent: 'space-between', gap: 8 }}>
          {[['Proteína', 'p', 'var(--prot)'], ['Carbohidratos', 'c', 'var(--carb)'], ['Grasas', 'g', 'var(--fat)']].map(([n, k, col]) => (
            <div key={k} className="col" style={{ gap: 4 }}>
              <div className="between small b"><span>{n}</span><span className="muted">{Math.round(h.totales[k])}/{h.objetivos[k]} g</span></div>
              <Bar pct={(h.totales[k] / h.objetivos[k]) * 100} color={col} height={7} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid2">
        <div className="card" style={{ background: 'var(--brasa)', gap: 2 }}>
          <Icon name="flame" />
          <span className="h2" style={{ fontSize: 16 }}>Racha de {h.racha} {h.racha === 1 ? 'día' : 'días'}</span>
          <span className="small b">{h.racha ? 'Registra algo hoy para seguir' : 'Empieza hoy'}</span>
        </div>
        <Link to="/revision" className={`card ${domingo && !revisada ? 'accent' : ''}`} style={{ textDecoration: 'none', gap: 2 }}>
          <span className="eyebrow muted">{revisada ? 'Semana cerrada' : domingo ? 'Hoy toca' : `En ${6 - iHoy} ${6 - iHoy === 1 ? 'día' : 'días'}`}</span>
          <span className="h2" style={{ fontSize: 16 }}>Revisión del domingo</span>
        </Link>
      </div>
      <Brand />
    </div>
  );
}
