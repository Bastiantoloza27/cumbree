import { Link } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy, construirPlan } from './derived.js';
import { tendenciaPeso, totalesDia } from './nutrition.js';
import { mondayOf, today, addWeeks, addDays, corto } from './dates.js';
import { fmt1, num } from './format.js';
import { exportarDatos } from './store.jsx';
import { Brand, Header, Icon } from './ui.jsx';

function GraficoPeso({ puntos, objetivo }) {
  if (puntos.length < 2) return <div className="empty">Registra tu peso varios días para ver la tendencia.</div>;
  const W = 330, H = 150, pad = 26;
  const vals = puntos.flatMap((p) => [p.valor, p.prom]).concat(objetivo ? [objetivo] : []);
  const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
  const x = (i) => pad + (i / (puntos.length - 1)) * (W - pad - 6);
  const y = (v) => 8 + (1 - (v - min) / (max - min)) * (H - 24);
  const linea = puntos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.prom).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Peso: de ${fmt1(puntos[0].prom)} a ${fmt1(puntos[puntos.length - 1].prom)} kg (promedio 7 días)`}>
      {[max - 0.5, (max + min) / 2, min + 0.5].map((v) => <g key={v}><line x1={pad} x2={W} y1={y(v)} y2={y(v)} stroke="#E2EAE5" /><text x="0" y={y(v) + 3} fontSize="9" fill="#4B5F57">{fmt1(v)}</text></g>)}
      {objetivo && objetivo > min && objetivo < max && <line x1={pad} x2={W} y1={y(objetivo)} y2={y(objetivo)} stroke="#9DB2A8" strokeDasharray="4 4" />}
      {puntos.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.valor)} r="2.5" fill="#9DB2A8" />)}
      <path d={linea} fill="none" stroke="var(--dark)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x={pad} y={H - 2} fontSize="9" fill="#4B5F57">{corto(puntos[0].fecha)}</text>
      <text x={W - 40} y={H - 2} fontSize="9" fill="#4B5F57">{corto(puntos[puntos.length - 1].fecha)}</text>
    </svg>
  );
}

export default function Progreso() {
  const { perfil, data } = useStore();
  const h = useHoy();
  const t = tendenciaPeso(data.mediciones).slice(-60);
  const dimPeso = data.meta?.dims?.find((d) => d.fuente === 'peso' && d.activa);
  const semanas = Array.from({ length: 8 }, (_, i) => addWeeks(mondayOf(today()), -7 + i));
  const adher = semanas.map((l) => { const p = construirPlan(data, l).filter((x) => x.tipo !== 'descanso'); return p.length ? p.filter((x) => x.hecho).length / p.length : 0; });
  const pasadas = adher.slice(0, -1);
  const adherProm = pasadas.length ? Math.round((pasadas.reduce((a, b) => a + b, 0) / pasadas.length) * 100) : 0;
  const ult28 = Array.from({ length: 28 }, (_, i) => addDays(today(), -i));
  const conReg = ult28.filter((d) => data.comidas.some((c) => c.fecha === d));
  const protOk = conReg.filter((d) => totalesDia(data.comidas, d).p >= h.objetivos.p * 0.9).length;
  const cint = data.mediciones.filter((m) => m.tipo === 'cintura').sort((a, b) => a.fecha.localeCompare(b.fecha));
  const dCint = cint.length > 1 ? cint[cint.length - 1].valor - cint[0].valor : null;
  const ritmo = t.length > 7 ? (t[t.length - 1].prom - t[Math.max(0, t.length - 15)].prom) / Math.min(2, (t.length - 1) / 7) : null;
  return (
    <div className="screen">
      <Header title="Progreso" eyebrow="Tendencias, no días sueltos" back="/metas" />
      <div className="card">
        <div className="between"><span className="h2" style={{ fontSize: 17 }}>Peso · tendencia</span><span className="b">{fmt1(h.peso)} kg</span></div>
        <GraficoPeso puntos={t} objetivo={dimPeso ? num(dimPeso.objetivo) : null} />
        <div className="row small b muted" style={{ gap: 14 }}><span className="row" style={{ gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 9, background: '#9DB2A8' }} />Pesaje</span><span className="row" style={{ gap: 6 }}><span style={{ width: 14, height: 3, background: 'var(--dark)' }} />Promedio 7 días</span>{dimPeso && <span>– – Meta {dimPeso.objetivo} kg</span>}</div>
        {ritmo !== null && <span className="small">{ritmo < 0 ? `Bajas ${fmt1(-ritmo)} kg por semana` : `Subes ${fmt1(ritmo)} kg por semana`} ({fmt1(Math.abs(ritmo) / h.peso * 100)}% de tu peso).</span>}
      </div>
      <div className="grid3">
        <div className="card" style={{ padding: 12, gap: 0 }}><span className="big">{adherProm}%</span><span className="small muted b">entrenos cumplidos (7 sem)</span></div>
        <div className="card" style={{ padding: 12, gap: 0 }}><span className="big">{conReg.length ? Math.round((protOk / conReg.length) * 100) : 0}%</span><span className="small muted b">días proteína ok (28 d)</span></div>
        <div className="card" style={{ padding: 12, gap: 0 }}><span className="big">{dCint !== null ? `${dCint > 0 ? '+' : ''}${fmt1(dCint)}` : '—'}</span><span className="small muted b">cm de cintura</span></div>
      </div>
      <div className="card">
        <span className="h2" style={{ fontSize: 17 }}>Adherencia semanal</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0,1fr))', gap: 6, alignItems: 'end', height: 90 }}>
          {adher.map((a, i) => <div key={i} title={`${Math.round(a * 100)}%`} style={{ height: `${Math.max(6, a * 100)}%`, borderRadius: 8, background: i === 7 ? 'var(--accent)' : 'var(--dark)', opacity: i === 7 ? 1 : 0.85 }} />)}
        </div>
        <div className="between small muted b"><span>{corto(semanas[0])}</span><span>esta semana</span></div>
      </div>
      <div className="card">
        <span className="h2" style={{ fontSize: 17 }}>De dónde vienen tus datos</span>
        <span className="small"><span className="tag light">MANUAL</span> Comidas, pesajes, medidas, series y partidos que registras.</span>
        <span className="small"><span className="tag dark">SALUD</span> Pasos, sueño y calorías activas importados desde Apple Salud.</span>
        <span className="small muted">Las calorías del ejercicio suman solo el {Math.round((data.ajustes.factorEjercicio || 0.5) * 100)}% a tu meta, porque los relojes tienden a sobreestimarlas.</span>
      </div>
      <div className="row">
        <Link to="/medidas" className="btn white grow"><Icon name="ruler" size={18} /> Medidas</Link>
        <button type="button" className="btn white grow" onClick={() => exportarDatos(perfil, data)}><Icon name="doc" size={18} /> Exportar datos</button>
      </div>
      <Brand />
    </div>
  );
}
