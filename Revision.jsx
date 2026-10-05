import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy, construirPlan, XP } from './derived.js';
import { mondayOf, today, addDays, corto } from './dates.js';
import { totalesDia } from './nutrition.js';
import { num, fmt1 } from './format.js';
import { Header, useToast } from './ui.jsx';
import Checklist from './Checklist.jsx';

function promedioPeso(mediciones, desde, hasta) {
  const ps = mediciones.filter((m) => m.tipo === 'peso' && m.fecha >= desde && m.fecha <= hasta);
  return ps.length ? ps.reduce((a, m) => a + num(m.valor), 0) / ps.length : null;
}

export default function Revision() {
  const { data, update, sumarXP } = useStore();
  const h = useHoy();
  const nav = useNavigate();
  const toast = useToast();
  const lunes = mondayOf(today());
  const ya = data.revisiones.find((r) => r.lunes === lunes);
  const [energia, setEnergia] = useState(ya?.energia || 3);
  const [nota, setNota] = useState(ya?.nota || '');

  const st = useMemo(() => {
    const plan = construirPlan(data, lunes);
    const entrenos = plan.filter((x) => x.tipo !== 'descanso');
    const dias = Array.from({ length: 7 }, (_, i) => addDays(lunes, i)).filter((d) => d <= today());
    const registrados = dias.filter((d) => data.comidas.some((c) => c.fecha === d)).length;
    const protOk = dias.filter((d) => totalesDia(data.comidas, d).p >= h.objetivos.p * 0.9).length;
    const peso = promedioPeso(data.mediciones, lunes, addDays(lunes, 6));
    const pesoAnt = promedioPeso(data.mediciones, addDays(lunes, -7), addDays(lunes, -1));
    return { hechos: entrenos.filter((x) => x.hecho).length, total: entrenos.length, registrados, protOk, dias: dias.length, peso, pesoAnt };
  }, [data, lunes, h.objetivos.p]);

  const ajuste = useMemo(() => {
    const textos = [];
    let kcal = 0;
    const adher = st.total ? st.hechos / st.total : 1;
    const enDeficit = (h.fase?.kcalFactor ?? 1) < 1;
    const prev = data.revisiones.filter((r) => r.lunes < lunes).slice(0, 3);
    if (st.peso && st.pesoAnt) {
      const delta = st.peso - st.pesoAnt;
      const pct = (-delta / st.pesoAnt) * 100;
      if (enDeficit && pct > 1) { kcal = 150; textos.push(`Bajaste ${fmt1(-delta)} kg: más de 1% en una semana. Sumo 150 kcal para cuidar tu músculo.`); }
      else if (enDeficit && delta >= 0 && prev.length >= 2 && prev.every((r) => r.peso && st.peso >= r.peso - 0.1)) { kcal = -120; textos.push('Tu peso lleva 3 semanas sin bajar. Ajusto −120 kcal diarias.'); }
      else if (enDeficit && delta < 0) textos.push(`Bajaste ${fmt1(-delta)} kg: ritmo ${pct > 0.7 ? 'exigente pero bien' : 'sano'}.`);
      else textos.push(`Peso promedio ${fmt1(st.peso)} kg (${delta >= 0 ? '+' : ''}${fmt1(delta)} vs. semana anterior).`);
    } else textos.push('Registra tu peso 3 o más días por semana para ajustar mejor tus calorías.');
    if (energia <= 2 && prev[0]?.energia <= 2) textos.push('Dos semanas con energía baja: la próxima semana baja una serie por ejercicio y prioriza dormir.');
    else if (energia <= 2) textos.push('Energía baja: revisa sueño y carbohidratos en días de carga.');
    if (adher < 0.6) textos.push('Cumpliste menos del 60% del plan: ¿armamos una semana más realista? Menos sesiones bien hechas valen más.');
    else if (adher >= 0.8) textos.push('Gran adherencia. Sigue así.');
    if (st.protOk < Math.ceil(st.dias * 0.6)) textos.push('La proteína quedó corta varios días: suma un yogur proteico o huevos en la once.');
    return { textos, kcal };
  }, [st, energia, h.fase, data.revisiones, lunes]);

  const cerrar = () => {
    const rev = { lunes, fecha: today(), energia, nota, peso: st.peso, ...st, resumen: ajuste.textos, ajusteKcal: ajuste.kcal };
    update((d) => ({
      ...d,
      revisiones: [rev, ...d.revisiones.filter((r) => r.lunes !== lunes)],
      ajustes: { ...d.ajustes, ajusteKcal: Math.max(-400, Math.min(400, (d.ajustes.ajusteKcal || 0) + (ya ? 0 : ajuste.kcal))) },
    }));
    if (!ya) { sumarXP(XP.revision, 'Revisión semanal'); toast(<span>Semana cerrada · <b>+{XP.revision} XP</b></span>); }
    nav('/semana/sugerencia?lunes=' + addDays(lunes, 7));
  };

  return (
    <div className="screen noNav">
      <Header title="Revisión de la semana" eyebrow={`Semana del ${corto(lunes)} · 10 minutos`} />
      <div className="grid3">
        <div className="card" style={{ padding: 12, gap: 0 }}><span className="big">{st.hechos}/{st.total}</span><span className="small muted b">entrenamientos</span></div>
        <div className="card" style={{ padding: 12, gap: 0 }}><span className="big">{st.protOk}/{st.dias}</span><span className="small muted b">días proteína ok</span></div>
        <div className="card" style={{ padding: 12, gap: 0 }}><span className="big">{st.registrados}/{st.dias}</span><span className="small muted b">días registrados</span></div>
      </div>
      <div className="card">
        <span className="b">Peso promedio: {st.peso ? `${fmt1(st.peso)} kg` : 'sin pesajes esta semana'}</span>
        <div className="field">¿Cómo estuvo tu energía?
          <div className="grid3" style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className="seg" style={{ background: energia === n ? 'var(--accent)' : 'var(--ground)' }} aria-pressed={energia === n} onClick={() => setEnergia(n)}>{n}</button>)}</div>
          <div className="between small muted"><span>Agotado</span><span>Con todo</span></div>
        </div>
        <label className="field">¿Qué te costó o qué aprendiste?<textarea className="input" style={{ background: 'var(--ground)' }} rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej.: el viernes no entrené por una reunión" /></label>
      </div>
      <Checklist lunes={lunes} />
      <div className="card dark" style={{ gap: 6 }}>
        <span className="eyebrow" style={{ color: 'var(--accent)' }}>Tu coach dice</span>
        {ajuste.textos.map((t) => <span key={t} style={{ fontSize: 14, lineHeight: 1.45 }}>• {t}</span>)}
      </div>
      <button type="button" className="btn accent block" onClick={cerrar}>{ya ? 'Actualizar y ver próxima semana' : `Cerrar semana · +${XP.revision} XP`}</button>
    </div>
  );
}
