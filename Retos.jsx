import { useState } from 'react';
import { useStore } from './store.jsx';
import { XP } from './derived.js';
import { today, mesAnio } from './dates.js';
import { num, uid } from './format.js';
import { Bar, Brand, Icon, Sheet, Stepper, useToast } from './ui.jsx';

const CATS = ['Probar deporte', 'Ruta', 'Pádel', 'Fuerza', 'Otro'];
const VALID = [['salud', 'Entrenamiento de Apple Salud', 'Se valida con la distancia o tiempo registrado'], ['foto', 'Foto', 'Una foto del momento como evidencia'], ['manual', 'Lo marco yo', 'Queda como registro manual']];
const IDEAS = ['Probar una clase de surf', 'Subir el cerro La Campana', 'Ruta en bici por la costa', 'Primer torneo de pádel', 'Correr 10K en carrera oficial', 'Probar escalada en muro', 'Clase de yoga', 'Nadar 1 km'];

export default function Retos() {
  const { data, update, sumarXP } = useStore();
  const toast = useToast();
  const [filtro, setFiltro] = useState('Todos');
  const [form, setForm] = useState(null);
  const [avance, setAvance] = useState(null);
  const lista = data.retos.filter((r) => filtro === 'Todos' || r.categoria === filtro);
  const nuevo = (nombre = '') => setForm({ id: uid(), nombre, categoria: 'Probar deporte', meta: 1, unidad: 'vez', fecha: data.meta?.fecha || today(), validacion: 'manual', progreso: 0, estado: 'activo' });
  const xpDe = (r) => Math.max(150, Math.min(600, Math.round((num(r.meta) * (r.unidad === 'km' ? 8 : 150)) / 50) * 50));
  const guardar = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    update((d) => ({ ...d, retos: [{ ...form, xp: xpDe(form), creado: today() }, ...d.retos.filter((r) => r.id !== form.id)] }));
    setForm(null); toast('Reto creado');
  };
  const sumar = (r, v, evidencia) => {
    const progreso = Math.min(num(r.meta), num(r.progreso) + v);
    const logrado = progreso >= num(r.meta);
    update((d) => ({ ...d, retos: d.retos.map((x) => (x.id === r.id ? { ...x, progreso, estado: logrado ? 'logrado' : 'activo', evidencia: evidencia || x.evidencia, fechaLogro: logrado ? today() : x.fechaLogro } : x)) }));
    if (logrado) { sumarXP(r.xp, r.nombre); toast(<span>¡Reto logrado! <b>+{r.xp} XP</b></span>); }
    setAvance(null);
  };
  const foto = (r, e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader(); rd.onload = () => setAvance({ ...avance, evidencia: 'foto' }); rd.readAsDataURL(f);
  };
  return (
    <div className="screen">
      <div className="col" style={{ gap: 2 }}>
        <h1 className="h1">Retos</h1>
        <span className="small b muted">{data.retos.filter((r) => r.estado === 'logrado').length} de {data.retos.length} logrados</span>
      </div>
      <div className="wrap">{['Todos', ...CATS].map((c) => <button key={c} type="button" className="chip" aria-pressed={filtro === c} onClick={() => setFiltro(c)}>{c}</button>)}</div>
      {lista.length === 0 && <div className="empty">Aún no tienes retos aquí. Crea uno o toma una idea.</div>}
      {lista.map((r) => (
        <div key={r.id} className={`card ${r.estado === 'logrado' ? '' : 'dark'}`}>
          <div className="between"><span className="eyebrow" style={{ color: r.estado === 'logrado' ? 'var(--muted)' : 'var(--accent)' }}>{r.estado === 'logrado' ? 'Logrado' : r.categoria} · {mesAnio(r.fecha)}</span><span className="tag ok">+{r.xp} XP</span></div>
          <span className={r.estado === 'logrado' ? 'b strike' : 'h2'}>{r.nombre}</span>
          <Bar pct={(num(r.progreso) / num(r.meta)) * 100} />
          <div className="between">
            <span className="small">{String(r.progreso).replace('.', ',')} de {r.meta} {r.unidad} · {VALID.find((v) => v[0] === r.validacion)?.[1]}</span>
            {r.estado !== 'logrado' && <button type="button" className="btn accent" style={{ minHeight: 40, fontSize: 13 }} onClick={() => setAvance({ r, v: r.unidad === 'km' ? 10 : 1 })}>Registrar avance</button>}
          </div>
        </div>
      ))}
      <button type="button" className="card dashed" style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', fontWeight: 800, cursor: 'pointer' }} onClick={() => nuevo()}><Icon name="plus" size={18} width={2.4} /> Crear reto</button>
      <div className="col"><span className="eyebrow muted">Ideas</span><div className="wrap">{IDEAS.map((i) => <button key={i} type="button" className="chip" onClick={() => nuevo(i)}>{i}</button>)}</div></div>
      <Brand />

      <Sheet open={!!form} onClose={() => setForm(null)} title="Nuevo reto">
        {form && (
          <form className="col" style={{ gap: 12 }} onSubmit={guardar}>
            <label className="field">¿Qué quieres lograr?<input className="input big" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus /></label>
            <div className="field">Tipo<div className="wrap">{CATS.map((c) => <button key={c} type="button" className="chip" aria-pressed={form.categoria === c} onClick={() => setForm({ ...form, categoria: c, unidad: c === 'Ruta' ? 'km' : form.unidad })}>{c}</button>)}</div></div>
            <div className="grid2">
              <label className="field">Meta<span className="row" style={{ background: '#fff', borderRadius: 14, padding: '0 10px', minHeight: 48 }}><input inputMode="decimal" value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} style={{ width: 60, border: 0, fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18 }} /><input value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} aria-label="Unidad" style={{ width: '100%', border: 0, fontWeight: 700 }} /></span></label>
              <label className="field">Fecha<input className="input" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></label>
            </div>
            <div className="field">¿Cómo se comprueba?
              {VALID.map(([id, n, hnt]) => (
                <button key={id} type="button" className="seg" aria-pressed={form.validacion === id} onClick={() => setForm({ ...form, validacion: id })} style={{ textAlign: 'left', padding: '8px 14px' }}><span className="b">{n}</span><br /><span className="small muted">{hnt}</span></button>
              ))}
            </div>
            <button className="btn primary block">Crear reto · +{xpDe(form)} XP</button>
          </form>
        )}
      </Sheet>
      <Sheet open={!!avance} onClose={() => setAvance(null)} title="Registrar avance">
        {avance && (
          <>
            <span className="b">{avance.r.nombre}</span>
            <div className="between"><span>Avance</span><Stepper value={avance.v} step={avance.r.unidad === 'km' ? 1 : 1} min={0} label="avance" onChange={(v) => setAvance({ ...avance, v })} format={(v) => `${v} ${avance.r.unidad}`} /></div>
            {avance.r.validacion === 'foto' && <label className="btn white"><Icon name="camera" /> {avance.evidencia ? 'Foto agregada' : 'Agregar foto'}<input type="file" accept="image/*" className="sr" onChange={(e) => foto(avance.r, e)} /></label>}
            {avance.r.validacion === 'salud' && <span className="small muted">Usa la distancia o el tiempo que registró tu Apple Watch en Salud.</span>}
            <button type="button" className="btn primary block" onClick={() => sumar(avance.r, avance.v, avance.evidencia)}>Guardar avance</button>
          </>
        )}
      </Sheet>
    </div>
  );
}
