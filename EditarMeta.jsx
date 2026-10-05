import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import { today, addDays, parse, iso, weeksBetween, mesAnio } from './dates.js';
import { num, uid } from './format.js';
import { pesoActual } from './nutrition.js';
import { generarFases, realismoPeso, sugerirHitos } from './phases.js';
import { Icon } from './ui.jsx';

const FUENTES = [
  { fuente: 'peso', nombre: 'Peso', unidad: 'kg', hint: 'Desde tus pesajes y Apple Salud' },
  { fuente: 'fuerza', nombre: 'Músculo (fuerza)', unidad: 'kg', ejercicio: 'Sentadilla', hint: 'Mejor serie de sentadilla registrada' },
  { fuente: 'padel', nombre: 'Pádel', unidad: 'partidos', hint: 'Partidos registrados' },
  { fuente: 'retos', nombre: 'Retos', unidad: 'retos', hint: 'Deportes nuevos, rutas y desafíos logrados' },
  { fuente: 'medida', nombre: 'Cintura', unidad: 'cm', medida: 'cintura', hint: 'Desde tu control mensual de medidas' },
];

function finDeMes(meses) {
  const d = new Date();
  return iso(new Date(d.getFullYear(), d.getMonth() + meses + 1, 0));
}

export default function EditarMeta() {
  const { perfil, data, update, sumarXP } = useStore();
  const nav = useNavigate();
  const peso = pesoActual(perfil, data.mediciones);
  const m0 = data.meta;
  const [paso, setPaso] = useState(1);
  const [titulo, setTitulo] = useState(m0?.titulo || '');
  const [fecha, setFecha] = useState(m0?.fecha || finDeMes(11));
  const [dims, setDims] = useState(() => m0?.dims || FUENTES.map((f, i) => ({
    id: uid(), ...f, activa: i < 4,
    inicial: f.fuente === 'peso' ? +peso.toFixed(1) : f.fuente === 'fuerza' ? 40 : f.fuente === 'medida' ? '' : 0,
    objetivo: f.fuente === 'peso' ? +(peso * 0.93).toFixed(1) : f.fuente === 'fuerza' ? 80 : f.fuente === 'padel' ? 40 : f.fuente === 'retos' ? 10 : '',
  })));
  const metaTmp = { titulo, fecha, inicio: m0?.inicio || today(), dims };
  const fases = useMemo(() => (weeksBetween(today(), fecha) >= 4 ? generarFases(metaTmp, perfil, peso) : []), [fecha, dims, perfil, peso]); // eslint-disable-line
  const [hitos, setHitos] = useState(m0?.hitos || null);
  const hitosVista = hitos || sugerirHitos(metaTmp, fases, peso);
  const realismo = realismoPeso(metaTmp, peso);
  const semanas = weeksBetween(today(), fecha);

  const setDim = (i, patch) => setDims(dims.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const puedeSeguir = paso === 1 ? titulo.trim() && semanas >= 4 : paso === 2 ? dims.some((d) => d.activa) : true;

  const guardar = () => {
    const meta = { ...metaTmp, titulo: titulo.trim(), hitos: hitosVista, actualizada: today() };
    update((d) => ({ ...d, meta, fases, historialMetas: [...(d.historialMetas || []), ...(m0 ? [{ ...m0, reemplazada: today() }] : [])] }));
    if (!m0) sumarXP(100, 'Meta creada');
    nav('/fases');
  };

  return (
    <div className="screen noNav">
      <div className="row">
        <button type="button" className="iconBtn" aria-label="Volver" onClick={() => (paso > 1 ? setPaso(paso - 1) : m0 ? nav(-1) : nav('/bienvenida'))}><Icon name="back" size={20} width={2.4} /></button>
        <div className="col grow" style={{ gap: 0 }}>
          <span className="small b muted">Paso {paso} de 3</span>
          <h1 className="h1" style={{ fontSize: 22 }}>{['Tu meta', 'Qué vas a medir', 'Tus hitos y fases'][paso - 1]}</h1>
        </div>
      </div>
      <div className="grid3" style={{ gap: 6 }}>{[1, 2, 3].map((n) => <div key={n} style={{ height: 6, borderRadius: 999, background: n <= paso ? 'var(--dark)' : '#C9D6CF' }} />)}</div>

      {paso === 1 && (
        <>
          <label className="field">¿Cuál es tu cumbre?
            <textarea className="input big" rows={3} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej.: Mi cambio 2027: menos peso, más músculo y mejor pádel" />
            <span className="small muted" style={{ fontWeight: 500 }}>Escríbela con tus palabras. Puedes cambiarla cuando quieras.</span>
          </label>
          <div className="field">¿Para cuándo?
            <div className="wrap">
              {[[3, '3 meses'], [6, '6 meses'], [11, '1 año'], [17, '18 meses']].map(([m, n]) => (
                <button key={m} type="button" className="chip" aria-pressed={fecha === finDeMes(m)} onClick={() => setFecha(finDeMes(m))}>{n}</button>
              ))}
            </div>
            <input className="input" type="date" value={fecha} min={addDays(today(), 28)} onChange={(e) => setFecha(e.target.value)} />
            <span className="small muted" style={{ fontWeight: 500 }}>{semanas >= 4 ? `${semanas} semanas · hasta ${mesAnio(fecha)}` : 'Elige una fecha de al menos 4 semanas.'}</span>
          </div>
        </>
      )}

      {paso === 2 && (
        <div className="col" style={{ gap: 10 }}>
          <span className="small muted" style={{ fontWeight: 500 }}>Activa lo que quieres medir y define dónde partes y adónde quieres llegar.</span>
          {dims.map((d, i) => (
            <div key={d.id} className="card" style={{ padding: 12, gap: 8, opacity: d.activa ? 1 : 0.6 }}>
              <div className="row">
                <button type="button" className="check" aria-pressed={d.activa} aria-label={`${d.activa ? 'Desactivar' : 'Activar'} ${d.nombre}`} onClick={() => setDim(i, { activa: !d.activa })} style={{ width: 32, height: 32, borderRadius: 10 }}>{d.activa && <Icon name="check" size={14} width={3.2} />}</button>
                {d.fuente === 'manual'
                  ? <input className="input" style={{ minHeight: 40, background: 'var(--ground)' }} aria-label="Nombre de la dimensión" value={d.nombre} onChange={(e) => setDim(i, { nombre: e.target.value })} />
                  : <span className="col grow" style={{ gap: 0 }}><span className="b">{d.nombre}</span><span className="small muted">{d.hint}</span></span>}
              </div>
              {d.activa && (
                <div className="row" style={{ gap: 8 }}>
                  {!['padel', 'retos'].includes(d.fuente) && (
                    <label className="unitInput grow"><span className="small muted b">Hoy</span><input inputMode="decimal" value={d.inicial} onChange={(e) => setDim(i, { inicial: e.target.value })} aria-label={`${d.nombre} actual`} /><span className="small muted b">{d.unidad}</span></label>
                  )}
                  <label className="unitInput grow"><span className="small muted b">Meta</span><input inputMode="decimal" value={d.objetivo} onChange={(e) => setDim(i, { objetivo: e.target.value })} aria-label={`${d.nombre} objetivo`} /><span className="small muted b">{d.unidad}</span></label>
                </div>
              )}
              {d.activa && d.fuente === 'manual' && (
                <label className="unitInput"><span className="small muted b">Unidad</span><input style={{ width: '100%', textAlign: 'left', fontFamily: 'var(--body)', fontSize: 14 }} value={d.unidad} onChange={(e) => setDim(i, { unidad: e.target.value })} /></label>
              )}
            </div>
          ))}
          <button type="button" className="card dashed" style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', fontWeight: 800, cursor: 'pointer' }}
            onClick={() => setDims([...dims, { id: uid(), fuente: 'manual', nombre: 'Nueva dimensión', unidad: 'unid.', inicial: 0, objetivo: '', activa: true }])}>
            <Icon name="plus" size={18} width={2.4} /> Crear dimensión propia
          </button>
        </div>
      )}

      {paso === 3 && (
        <div className="col" style={{ gap: 10 }}>
          {realismo && <div className={`card ${realismo.ok ? '' : 'accent'}`} style={{ padding: 12, fontSize: 13 }}><span className="b">Ritmo de peso</span>{realismo.texto}</div>}
          <div className="card dark" style={{ padding: 14 }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>Tu plan en {fases.length} {fases.length === 1 ? 'fase' : 'fases'}</span>
            {fases.map((f) => <span key={f.n} className="small" style={{ color: '#DCE6E1' }}><b style={{ color: '#fff' }}>{f.n}. {f.nombre}</b> · {f.semanas} semanas</span>)}
          </div>
          <span className="b">Hitos para celebrar</span>
          {hitosVista.map((h, i) => (
            <div key={h.id} className="card row" style={{ padding: '8px 8px 8px 14px', flexDirection: 'row' }}>
              <span className="small b muted" style={{ width: 62, flex: 'none' }}>{mesAnio(h.fecha)}</span>
              <input className="grow" aria-label={`Hito ${i + 1}`} value={h.texto} onChange={(e) => setHitos(hitosVista.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)))} style={{ border: 0, background: 'transparent', fontWeight: 700, fontSize: 14, minHeight: 40 }} />
              <button type="button" className="iconBtn" style={{ background: 'var(--ground)', width: 40, height: 40 }} aria-label={`Quitar hito ${i + 1}`} onClick={() => setHitos(hitosVista.filter((_, j) => j !== i))}><Icon name="close" size={16} /></button>
            </div>
          ))}
          <div className="row">
            <button type="button" className="btn white grow" onClick={() => setHitos([...hitosVista, { id: uid(), fecha, texto: '', logrado: false }])}><Icon name="plus" size={18} /> Agregar hito</button>
            <button type="button" className="btn white grow" onClick={() => setHitos(null)}>Restaurar sugeridos</button>
          </div>
        </div>
      )}

      <span className="grow" />
      {paso < 3
        ? <button type="button" className="btn primary block" disabled={!puedeSeguir} onClick={() => setPaso(paso + 1)}>Continuar</button>
        : <button type="button" className="btn accent block" onClick={guardar}>{m0 ? 'Guardar y recalcular fases' : 'Guardar y crear fases'}</button>}
    </div>
  );
}
