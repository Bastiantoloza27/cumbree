// Tarjeta para revisar y confirmar alimentos propuestos por el coach o el buscador.
import { useState } from 'react';
import { useStore } from './store.jsx';
import { COMIDAS } from './foods.js';
import { uid, num } from './format.js';
import { XP } from './derived.js';
import { Stepper, useToast } from './ui.jsx';

export function agregarComidas(update, sumarXP, fecha, comida, items, metodo) {
  const nuevos = items.filter((x) => x.cantidad > 0).map((x) => ({
    id: uid(), fecha, comida, nombre: x.nombre, porcion: x.porcion, cantidad: x.cantidad,
    kcal: Math.round(num(x.kcal) * x.cantidad), p: +(num(x.p) * x.cantidad).toFixed(1), c: +(num(x.c) * x.cantidad).toFixed(1), g: +(num(x.g) * x.cantidad).toFixed(1),
    metodo, confianza: x.confianza || 'alta', fuente: x.fuente || 'base Cumbre',
  }));
  if (!nuevos.length) return 0;
  update((d) => ({ ...d, comidas: [...nuevos, ...d.comidas] }));
  sumarXP(XP.comida, `Registro de ${comida}`);
  return nuevos.reduce((a, x) => a + x.kcal, 0);
}

export default function Propuesta({ items: inicial, comida: comida0, fecha, metodo = 'coach', onDone }) {
  const { update, sumarXP } = useStore();
  const toast = useToast();
  const [items, setItems] = useState(inicial.map((x) => ({ ...x, cantidad: num(x.cantidad) || 1 })));
  const [comida, setComida] = useState(comida0 || 'almuerzo');
  const total = items.reduce((a, x) => a + num(x.kcal) * x.cantidad, 0);
  const confirmar = () => {
    const k = agregarComidas(update, sumarXP, fecha, comida, items, metodo);
    toast(<span>{Math.round(k)} kcal registradas · <b>+{XP.comida} XP</b></span>);
    onDone?.();
  };
  return (
    <div className="card" style={{ gap: 8 }}>
      <div className="between"><span className="eyebrow muted">Revisa y confirma</span></div>
      <div className="wrap">{COMIDAS.map((c) => <button key={c} type="button" className="chip" style={{ minHeight: 34, textTransform: 'capitalize' }} aria-pressed={comida === c} onClick={() => setComida(c)}>{c}</button>)}</div>
      {items.map((it, i) => (
        <div key={i} className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>
          <span className="col grow" style={{ gap: 2, minWidth: 0 }}>
            <span className="b" style={{ fontSize: 14 }}>{it.nombre}</span>
            <span className="small muted">{Math.round(num(it.kcal) * it.cantidad)} kcal · P {Math.round(num(it.p) * it.cantidad)} · C {Math.round(num(it.c) * it.cantidad)} · G {Math.round(num(it.g) * it.cantidad)}</span>
            <span className={`tag ${it.confianza === 'alta' ? 'ok' : 'warn'}`} style={{ alignSelf: 'flex-start' }}>Confianza {it.confianza || 'alta'} · {it.porcion}</span>
          </span>
          <Stepper value={it.cantidad} step={0.5} label={it.nombre} onChange={(v) => setItems(items.map((x, j) => (j === i ? { ...x, cantidad: v } : x)))} format={(v) => `${String(v).replace('.', ',')}×`} />
        </div>
      ))}
      <button type="button" className="btn accent block" onClick={confirmar} disabled={!items.some((x) => x.cantidad > 0)}>Confirmar {Math.round(total)} kcal · +{XP.comida} XP</button>
    </div>
  );
}
