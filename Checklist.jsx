// Checklist semanal de objetivos: algunos se marcan solos con tus datos, otros los marcas tú día a día.
import { useState } from 'react';
import { useStore } from './store.jsx';
import { construirPlan } from './derived.js';
import { addDays, DIAS, today } from './dates.js';
import { totalesDia, objetivosDia, pesoActual } from './nutrition.js';
import { faseDe } from './phases.js';
import { uid } from './format.js';
import { Icon, Sheet, useToast } from './ui.jsx';

export const OBJETIVOS_BASE = [
  { id: 'entrenos', texto: 'Completar los entrenamientos del plan', tipo: 'auto-entrenos', meta: 0 },
  { id: 'proteina', texto: 'Proteína en meta', tipo: 'auto-proteina', meta: 5 },
  { id: 'agua', texto: 'Meta de agua cumplida', tipo: 'auto-agua', meta: 5 },
  { id: 'registro', texto: 'Registrar todas mis comidas', tipo: 'auto-registro', meta: 6 },
  { id: 'sueno', texto: 'Dormir 7 horas o más', tipo: 'manual', meta: 5 },
  { id: 'pasos', texto: 'Caminar 8.000 pasos', tipo: 'manual', meta: 5 },
];
const SUGERIDOS = ['Sin bebidas azucaradas', 'Estirar 10 minutos', 'Fruta o verdura en cada comida', 'Sin alcohol', 'Pesarme 3 veces', 'Cocinar mi almuerzo'];
const BONO = 150;

export default function Checklist({ lunes }) {
  const { perfil, data, update, sumarXP } = useStore();
  const toast = useToast();
  const [editar, setEditar] = useState(false);
  const [nuevo, setNuevo] = useState({ texto: '', meta: 5 });
  const objetivos = data.objetivosSemana || OBJETIVOS_BASE;
  const marcas = data.checks?.[lunes] || {};
  const dias = Array.from({ length: 7 }, (_, i) => addDays(lunes, i));
  const plan = construirPlan(data, lunes);
  const peso = pesoActual(perfil, data.mediciones);
  const metaAgua = data.ajustes.aguaMeta || 12;

  const diasAuto = (tipo) => dias.map((d, i) => {
    if (d > today()) return false;
    if (tipo === 'auto-proteina') { const obj = objetivosDia(perfil, faseDe(data.fases, d), peso, 'carga'); return totalesDia(data.comidas, d).p >= obj.p * 0.9; }
    if (tipo === 'auto-agua') return (data.agua[d] || 0) >= metaAgua;
    if (tipo === 'auto-registro') { const cs = new Set(data.comidas.filter((c) => c.fecha === d).map((c) => c.comida)); return cs.size >= 3; }
    if (tipo === 'auto-entrenos') return plan[i]?.tipo !== 'descanso' && plan[i]?.hecho;
    return false;
  });

  const filas = objetivos.map((o) => {
    const entrenos = plan.filter((x) => x.tipo !== 'descanso').length;
    const meta = o.tipo === 'auto-entrenos' ? entrenos : o.meta;
    const hechos = o.tipo === 'manual' ? dias.map((_, i) => !!marcas[o.id]?.includes(i)) : diasAuto(o.tipo);
    const n = hechos.filter(Boolean).length;
    return { ...o, meta, hechos, n, ok: meta > 0 && n >= meta };
  });
  const completos = filas.filter((f) => f.ok).length;
  const bonoCobrado = data.bonosSemana?.includes(lunes);

  const marcar = (o, i) => {
    if (o.tipo !== 'manual' || dias[i] > today()) return;
    const actual = marcas[o.id] || [];
    const sig = actual.includes(i) ? actual.filter((x) => x !== i) : [...actual, i];
    update((d) => ({ ...d, checks: { ...d.checks, [lunes]: { ...(d.checks?.[lunes] || {}), [o.id]: sig } } }));
  };
  const cobrar = () => {
    update((d) => ({ ...d, bonosSemana: [...(d.bonosSemana || []), lunes] }));
    sumarXP(BONO, 'Checklist semanal completo');
    toast(<span>¡Semana completa! <b>+{BONO} XP</b></span>);
  };
  const guardarLista = (lista) => update((d) => ({ ...d, objetivosSemana: lista }));

  return (
    <div className="card" style={{ gap: 10 }}>
      <div className="between">
        <span className="col" style={{ gap: 0 }}>
          <span className="h2" style={{ fontSize: 17 }}>Checklist semanal</span>
          <span className="small muted b">{completos} de {filas.length} objetivos cumplidos</span>
        </span>
        <button type="button" className="chip" onClick={() => setEditar(true)}><Icon name="edit" size={14} /> Editar</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) repeat(7, 26px)', gap: '6px 4px', alignItems: 'center' }}>
        <span />
        {DIAS.map((d) => <span key={d} className="muted" style={{ fontSize: 10, fontWeight: 800, textAlign: 'center' }}>{d.charAt(0)}</span>)}
        {filas.map((f) => [
          <span key={f.id} className="col" style={{ gap: 0, minWidth: 0 }}>
            <span className={f.ok ? 'b strike' : 'b'} style={{ fontSize: 13, lineHeight: 1.25 }}>{f.texto}</span>
            <span className="muted" style={{ fontSize: 11 }}>{f.n}/{f.meta} {f.tipo === 'manual' ? 'días · toca para marcar' : f.tipo === 'auto-entrenos' ? 'entrenos' : 'días · automático'}</span>
          </span>,
          ...f.hechos.map((h, i) => {
            const futuro = dias[i] > today();
            const manual = f.tipo === 'manual';
            return (
              <button key={f.id + i} type="button" disabled={!manual || futuro} onClick={() => marcar(f, i)} aria-pressed={h} aria-label={`${f.texto}, ${DIAS[i]}`}
                style={{ width: 26, height: 26, borderRadius: 8, padding: 0, border: manual && !futuro ? '1.5px solid var(--dark)' : '1.5px solid transparent', background: h ? 'var(--accent)' : 'var(--ground)', opacity: futuro ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: manual && !futuro ? 'pointer' : 'default' }}>
                {h && <Icon name="check" size={12} width={3.4} />}
              </button>
            );
          }),
        ])}
      </div>
      {completos === filas.length && filas.length > 0 && !bonoCobrado && <button type="button" className="btn accent" onClick={cobrar}>Cobrar bono de semana completa · +{BONO} XP</button>}
      {bonoCobrado && <span className="tag ok" style={{ alignSelf: 'flex-start' }}>Bono de semana completa cobrado</span>}

      <Sheet open={editar} onClose={() => setEditar(false)} title="Objetivos de la semana">
        <span className="small muted">Los objetivos automáticos se marcan solos con lo que registras. Los manuales los marcas tú cada día.</span>
        {objetivos.map((o, idx) => (
          <div key={o.id} className="card row" style={{ flexDirection: 'row', padding: 10 }}>
            <span className="col grow" style={{ gap: 0 }}><span className="b" style={{ fontSize: 14 }}>{o.texto}</span><span className="small muted">{o.tipo === 'manual' ? 'Manual' : 'Automático'}</span></span>
            {o.tipo !== 'auto-entrenos' && (
              <label className="unitInput" style={{ minHeight: 40 }}><input inputMode="numeric" style={{ width: 28 }} value={o.meta} aria-label={`Días para ${o.texto}`} onChange={(e) => guardarLista(objetivos.map((x, j) => (j === idx ? { ...x, meta: Math.max(1, Math.min(7, +e.target.value || 1)) } : x)))} /><span className="small b muted">/7</span></label>
            )}
            <button type="button" className="iconBtn" style={{ background: 'var(--ground)', width: 40, height: 40 }} aria-label={`Quitar ${o.texto}`} onClick={() => guardarLista(objetivos.filter((_, j) => j !== idx))}><Icon name="trash" size={16} /></button>
          </div>
        ))}
        <form className="col" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); if (nuevo.texto.trim()) { guardarLista([...objetivos, { id: uid(), texto: nuevo.texto.trim(), tipo: 'manual', meta: nuevo.meta }]); setNuevo({ texto: '', meta: 5 }); } }}>
          <div className="row">
            <input className="input grow" placeholder="Nuevo objetivo (ej.: Sin bebidas azucaradas)" value={nuevo.texto} onChange={(e) => setNuevo({ ...nuevo, texto: e.target.value })} aria-label="Nuevo objetivo" />
            <label className="unitInput"><input inputMode="numeric" style={{ width: 28 }} value={nuevo.meta} onChange={(e) => setNuevo({ ...nuevo, meta: Math.max(1, Math.min(7, +e.target.value || 1)) })} aria-label="Días por semana" /><span className="small b muted">/7</span></label>
          </div>
          <button className="btn primary">Agregar objetivo</button>
        </form>
        <div className="wrap">{SUGERIDOS.filter((s) => !objetivos.some((o) => o.texto === s)).map((s) => <button key={s} type="button" className="chip" onClick={() => guardarLista([...objetivos, { id: uid(), texto: s, tipo: 'manual', meta: 5 }])}>+ {s}</button>)}</div>
        {!objetivos.some((o) => o.tipo !== 'manual') && <button type="button" className="btn white" onClick={() => guardarLista(OBJETIVOS_BASE)}>Restaurar objetivos sugeridos</button>}
      </Sheet>
    </div>
  );
}
