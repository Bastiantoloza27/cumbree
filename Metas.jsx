import { Link } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy, XP } from './derived.js';
import { mesAnio, weeksBetween, today } from './dates.js';
import { fmt1, fmt } from './format.js';
import { Bar, Brand, Icon, useToast } from './ui.jsx';

export default function Metas() {
  const { data, update, sumarXP } = useStore();
  const h = useHoy();
  const toast = useToast();
  const m = data.meta;
  const toggleHito = (id) => {
    const hit = m.hitos.find((x) => x.id === id);
    update((d) => ({ ...d, meta: { ...d.meta, hitos: d.meta.hitos.map((x) => (x.id === id ? { ...x, logrado: !x.logrado, fechaLogro: today() } : x)) } }));
    if (!hit.logrado) { sumarXP(XP.hito, hit.texto); toast(<span>¡Hito logrado! <b>+{XP.hito} XP</b></span>); }
  };
  const insignias = [
    { n: 'Racha 7', ok: h.racha >= 7 }, { n: 'Primera meta', ok: true }, { n: 'Primer reto', ok: data.retos.some((r) => r.estado === 'logrado') },
    { n: 'Semana cerrada', ok: data.revisiones.length > 0 }, { n: 'Primer hito', ok: m.hitos.some((x) => x.logrado) }, { n: '10 partidos', ok: data.padel.length >= 10 },
  ];
  return (
    <div className="screen dark">
      <div className="between">
        <div className="col" style={{ gap: 2 }}><span className="small b muted">Tu camino</span><h1 className="h1">Cumbre {new Date(m.fecha).getFullYear()}</h1></div>
        <div className="row" style={{ gap: 8 }}>
          <Link to="/meta" className="iconBtn" aria-label="Editar meta" style={{ borderRadius: 999, border: '1.5px solid var(--accent)', background: 'transparent', color: 'var(--accent)' }}><Icon name="edit" size={18} /></Link>
          <Link to="/progreso" className="btn accent" style={{ minHeight: 44, fontSize: 13 }}>Ver progreso</Link>
        </div>
      </div>
      <Link to="/fases" className="card soft" style={{ textDecoration: 'none' }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{m.titulo}</span>
        <div className="grid3">
          <div className="col" style={{ gap: 0 }}><span className="big" style={{ color: 'var(--accent)' }}>{h.avance}%</span><span className="small muted">del camino</span></div>
          <div className="col" style={{ gap: 0 }}><span className="big">{weeksBetween(today(), m.fecha)}</span><span className="small muted">semanas</span></div>
          <div className="col" style={{ gap: 0 }}><span className="big">{data.retos.filter((r) => r.estado === 'logrado').length}</span><span className="small muted">retos logrados</span></div>
        </div>
        {h.fase && <span className="small b" style={{ color: 'var(--accent)' }}>Fase {h.fase.n} de {data.fases.length} · {h.fase.nombre} · ver fases</span>}
      </Link>
      <div className="col" style={{ gap: 10 }}>
        <span className="eyebrow muted">Lo que mides</span>
        {h.dims.map((d) => (
          <div key={d.id} className="col" style={{ gap: 4 }}>
            <div className="between small b"><span>{d.nombre}</span><span className="muted">{['padel', 'retos'].includes(d.fuente) ? fmt(d.act) : fmt1(d.act)} → {d.objetivo} {d.unidad}</span></div>
            <Bar pct={d.pct} />
          </div>
        ))}
      </div>
      <div className="col" style={{ gap: 8 }}>
        <span className="eyebrow muted">Hitos</span>
        {m.hitos.map((x) => (
          <button key={x.id} type="button" onClick={() => toggleHito(x.id)} aria-pressed={x.logrado} className="row" style={{ background: x.logrado ? 'transparent' : 'var(--soft)', border: 0, borderRadius: 16, padding: '8px 10px', color: '#fff', cursor: 'pointer', textAlign: 'left', minHeight: 56 }}>
            <span style={{ width: 40, height: 40, borderRadius: 999, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: x.logrado ? 'var(--accent)' : 'transparent', border: x.logrado ? 0 : '2px solid var(--track)' }}>{x.logrado ? <Icon name="check" stroke="var(--dark)" width={3} size={18} /> : <Icon name="metas" size={16} />}</span>
            <span className="col grow" style={{ gap: 1 }}><span className={x.logrado ? 'b strike' : 'b'} style={{ color: x.logrado ? '#B9C8C0' : '#fff' }}>{x.texto}</span><span className="small muted">{x.logrado ? `Logrado · +${XP.hito} XP` : mesAnio(x.fecha)}</span></span>
          </button>
        ))}
      </div>
      <div className="col" style={{ gap: 8 }}>
        <div className="between"><span className="eyebrow muted">Insignias</span><Link to="/retos" className="small b" style={{ color: 'var(--accent)' }}>Ver retos</Link></div>
        <div className="grid3">{insignias.map((i) => <span key={i.n} className="card soft" style={{ padding: 10, alignItems: 'center', textAlign: 'center', fontSize: 11, fontWeight: 800, gap: 4, opacity: i.ok ? 1 : 0.4 }}><Icon name="star" size={22} stroke={i.ok ? 'var(--accent)' : '#B9C8C0'} />{i.n}</span>)}</div>
      </div>
      <Brand />
    </div>
  );
}
