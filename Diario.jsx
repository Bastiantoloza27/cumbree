import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy } from './derived.js';
import { COMIDAS, buscarAlimentos, interpretarTexto, comidaPorHora } from './foods.js';
import { today, addDays, largo } from './dates.js';
import { fmt, num } from './format.js';
import { Bar, Brand, Icon, Sheet, useToast } from './ui.jsx';
import Propuesta, { agregarComidas } from './Propuesta.jsx';

export default function Diario() {
  const { data, update, sumarXP } = useStore();
  const toast = useToast();
  const [fecha, setFecha] = useState(today());
  const h = useHoy(fecha);
  const [texto, setTexto] = useState('');
  const [propuesta, setPropuesta] = useState(null);
  const [buscarEn, setBuscarEn] = useState(null);
  const [q, setQ] = useState('');
  const [manual, setManual] = useState({ nombre: '', kcal: '', p: '', c: '', g: '' });
  const delDia = data.comidas.filter((c) => c.fecha === fecha);

  const interpretar = (e) => {
    e.preventDefault();
    const r = interpretarTexto(texto);
    if (!r.items.length) { toast('No reconocí alimentos. Prueba el buscador o pregúntale al coach.'); return; }
    setPropuesta({ items: r.items, comida: r.comida || comidaPorHora(), nota: r.sinIdentificar });
  };
  const dictar = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Tu navegador no permite dictado; usa el micrófono del teclado.'); return; }
    const rec = new SR(); rec.lang = 'es-CL'; rec.onresult = (ev) => setTexto(ev.results[0][0].transcript); rec.start();
  };
  const borrar = (id) => update((d) => ({ ...d, comidas: d.comidas.filter((c) => c.id !== id) }));
  const repetirAyer = (comida) => {
    const ayer = data.comidas.filter((c) => c.fecha === addDays(fecha, -1) && c.comida === comida);
    if (!ayer.length) { toast(`Ayer no registraste ${comida}`); return; }
    agregarComidas(update, sumarXP, fecha, comida, ayer.map((x) => ({ ...x, kcal: x.kcal / x.cantidad, p: x.p / x.cantidad, c: x.c / x.cantidad, g: x.g / x.cantidad })), 'repetir');
    toast(`${comida} de ayer copiado`);
  };
  const agregarManual = () => {
    if (!manual.nombre || !num(manual.kcal)) return;
    agregarComidas(update, sumarXP, fecha, buscarEn, [{ nombre: manual.nombre, porcion: '1 porción', cantidad: 1, kcal: num(manual.kcal), p: num(manual.p), c: num(manual.c), g: num(manual.g), confianza: 'media', fuente: 'manual' }], 'manual');
    setManual({ nombre: '', kcal: '', p: '', c: '', g: '' }); setBuscarEn(null);
  };

  return (
    <div className="screen">
      <div className="between">
        <button type="button" className="iconBtn" aria-label="Día anterior" onClick={() => setFecha(addDays(fecha, -1))}><Icon name="back" size={18} /></button>
        <div className="col" style={{ alignItems: 'center', gap: 0 }}>
          <span className="small b muted">{fecha === today() ? 'Hoy' : largo(fecha)}</span>
          <h1 className="h1">Diario</h1>
        </div>
        <button type="button" className="iconBtn" aria-label="Día siguiente" disabled={fecha >= today()} onClick={() => setFecha(addDays(fecha, 1))}><Icon name="next" size={18} /></button>
      </div>
      <div className="card" style={{ gap: 8 }}>
        <div className="between"><span className="b">{fmt(h.totales.kcal)} / {fmt(h.objetivos.kcal)} kcal</span><span className="small muted b">día {h.tipo === 'suave' ? 'suave' : 'de carga'}</span></div>
        <div className="grid3">
          {[['Proteína', 'p', 'var(--prot)'], ['Carbos', 'c', 'var(--carb)'], ['Grasas', 'g', 'var(--fat)']].map(([n, k, col]) => (
            <div key={k} className="col" style={{ gap: 4 }}>
              <div className="between" style={{ fontSize: 11, fontWeight: 800 }}><span>{n}</span><span className="muted">{Math.round(h.totales[k])}/{h.objetivos[k]}</span></div>
              <Bar pct={(h.totales[k] / h.objetivos[k]) * 100} color={col} height={7} />
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={interpretar} className="row" style={{ background: '#fff', borderRadius: 999, padding: '6px 6px 6px 16px', border: '2px solid var(--dark)' }}>
        <label className="sr" htmlFor="quick">Qué comiste</label>
        <input id="quick" className="grow" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Dime qué comiste y lo registro…" style={{ border: 0, background: 'transparent', fontSize: 15, minHeight: 40 }} />
        <button type="button" className="iconBtn" aria-label="Dictar" style={{ background: 'var(--ground)', width: 40, height: 40 }} onClick={dictar}><Icon name="mic" size={18} /></button>
        <button className="iconBtn" aria-label="Interpretar" style={{ background: 'var(--dark)', color: 'var(--accent)', width: 40, height: 40, borderRadius: 999 }}><Icon name="next" size={18} width={2.6} /></button>
      </form>
      <div className="grid3">
        <Link to="/producto" className="btn white" style={{ borderRadius: 18, flexDirection: 'column', minHeight: 64, fontSize: 12, gap: 4 }}><Icon name="barcode" />Escanear</Link>
        <button type="button" className="btn white" style={{ borderRadius: 18, flexDirection: 'column', minHeight: 64, fontSize: 12, gap: 4 }} onClick={() => setBuscarEn(comidaPorHora())}><Icon name="search" />Buscar</button>
        <Link to="/coach" className="btn white" style={{ borderRadius: 18, flexDirection: 'column', minHeight: 64, fontSize: 12, gap: 4 }}><Icon name="camera" />Foto al coach</Link>
      </div>

      {COMIDAS.map((comida) => {
        const items = delDia.filter((c) => c.comida === comida);
        const k = items.reduce((a, x) => a + num(x.kcal), 0);
        return (
          <div key={comida} className="card" style={{ gap: 8 }}>
            <div className="between">
              <span className="h2" style={{ fontSize: 17, textTransform: 'capitalize' }}>{comida}</span>
              <span className="small b muted">{fmt(k)} kcal</span>
            </div>
            {items.map((x) => (
              <div key={x.id} className="row" style={{ fontSize: 14 }}>
                <span className="col grow" style={{ gap: 1 }}>
                  <span className="b">{x.nombre}</span>
                  <span className="small muted">{String(x.cantidad).replace('.', ',')}× {x.porcion} · P {Math.round(x.p)} g · {x.metodo}{x.confianza !== 'alta' ? ` · confianza ${x.confianza}` : ''}</span>
                </span>
                <span className="b">{fmt(x.kcal)}</span>
                <button type="button" className="iconBtn" style={{ width: 36, height: 36, background: 'var(--ground)' }} aria-label={`Borrar ${x.nombre}`} onClick={() => borrar(x.id)}><Icon name="trash" size={16} /></button>
              </div>
            ))}
            <div className="row" style={{ gap: 6 }}>
              <button type="button" className="chip grow" onClick={() => setBuscarEn(comida)}>+ Agregar</button>
              <button type="button" className="chip" onClick={() => repetirAyer(comida)}>Igual que ayer</button>
            </div>
          </div>
        );
      })}
      <Brand />

      <Sheet open={!!propuesta} onClose={() => setPropuesta(null)} title="El coach propone">
        {propuesta?.nota && <span className="small muted">No reconocí: “{propuesta.nota}”. Agrégalo con el buscador.</span>}
        {propuesta && <Propuesta items={propuesta.items} comida={propuesta.comida} fecha={fecha} metodo="texto" onDone={() => { setPropuesta(null); setTexto(''); }} />}
      </Sheet>

      <Sheet open={!!buscarEn} onClose={() => setBuscarEn(null)} title={`Agregar a ${buscarEn || ''}`}>
        <input className="input" placeholder="Buscar: marraqueta, cazuela, yogur…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus aria-label="Buscar alimento" />
        <div className="col" style={{ gap: 6 }}>
          {buscarAlimentos(q).map((a) => (
            <button key={a.id} type="button" className="row card" style={{ flexDirection: 'row', padding: 12, cursor: 'pointer', textAlign: 'left' }}
              onClick={() => setPropuesta({ items: [{ ...a, cantidad: 1, confianza: 'alta' }], comida: buscarEn }) || setBuscarEn(null)}>
              <span className="col grow" style={{ gap: 1 }}><span className="b">{a.nombre}</span><span className="small muted">{a.porcion} · P {a.p} · C {a.c} · G {a.g}</span></span>
              <span className="b">{a.kcal}</span>
            </button>
          ))}
        </div>
        <details className="card" style={{ padding: 12 }}>
          <summary className="b" style={{ cursor: 'pointer' }}>Ingresar a mano (etiqueta del producto)</summary>
          <div className="col" style={{ gap: 8, marginTop: 10 }}>
            <input className="input" style={{ background: 'var(--ground)' }} placeholder="Nombre" value={manual.nombre} onChange={(e) => setManual({ ...manual, nombre: e.target.value })} aria-label="Nombre" />
            <div className="grid2" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
              {[['kcal', 'kcal'], ['p', 'Prot g'], ['c', 'Carb g'], ['g', 'Grasa g']].map(([k, n]) => (
                <input key={k} className="input" inputMode="decimal" style={{ background: 'var(--ground)', padding: '0 8px' }} placeholder={n} aria-label={n} value={manual[k]} onChange={(e) => setManual({ ...manual, [k]: e.target.value })} />
              ))}
            </div>
            <button type="button" className="btn primary" onClick={agregarManual}>Agregar</button>
          </div>
        </details>
      </Sheet>
    </div>
  );
}
