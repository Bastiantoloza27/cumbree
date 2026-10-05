import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy } from './derived.js';
import { buscarProducto, analizar, porcionAMacros } from './product.js';
import { comidaPorHora } from './foods.js';
import { num } from './format.js';
import { Header, Icon, Ring, useToast } from './ui.jsx';
import { agregarComidas } from './Propuesta.jsx';

export default function Producto() {
  const { data, update, sumarXP } = useStore();
  const h = useHoy();
  const nav = useNavigate();
  const toast = useToast();
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState('inicio'); // inicio | escaneando | cargando | listo | noEncontrado | error
  const [prod, setProd] = useState(null);
  const [gramos, setGramos] = useState('');
  const video = useRef(null);
  const stream = useRef(null);
  const puedeEscanear = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const detener = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; };
  useEffect(() => detener, []);

  const consultar = async (c) => {
    detener();
    setEstado('cargando');
    try {
      const p = await buscarProducto(c.trim());
      if (!p) { setEstado('noEncontrado'); return; }
      setProd(p); setGramos(String(p.porcionG || 100)); setEstado('listo');
      update((d) => ({ ...d, escaneos: [{ codigo: c, nombre: p.nombre, fecha: new Date().toISOString() }, ...(d.escaneos || [])].slice(0, 30) }));
    } catch { setEstado('error'); }
  };

  const escanear = async () => {
    try {
      setEstado('escaneando');
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.current.srcObject = stream.current;
      await video.current.play();
      const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
      const loop = async () => {
        if (!stream.current) return;
        const r = await det.detect(video.current).catch(() => []);
        if (r[0]?.rawValue) { setCodigo(r[0].rawValue); consultar(r[0].rawValue); } else requestAnimationFrame(loop);
      };
      loop();
    } catch { setEstado('inicio'); toast('No se pudo abrir la cámara. Escribe el código.'); }
  };

  const an = prod ? analizar(prod, { enDeficit: (h.fase?.kcalFactor ?? 1) < 1, faltaProteina: h.objetivos.p - h.totales.p }) : null;
  const mac = prod ? porcionAMacros(prod, num(gramos)) : null;
  const registrar = () => {
    agregarComidas(update, sumarXP, h.fecha, comidaPorHora(), [{ nombre: `${prod.nombre}${prod.marca ? ` (${prod.marca.split(',')[0]})` : ''}`, porcion: `${gramos} g`, cantidad: 1, ...mac, confianza: 'alta', fuente: 'Open Food Facts' }], 'escáner');
    toast('Producto registrado'); nav('/diario');
  };
  const color = an ? (an.score >= 70 ? 'var(--ok)' : an.score >= 45 ? 'var(--carb)' : 'var(--brasa)') : 'var(--dark)';

  return (
    <div className="screen noNav">
      <Header title={prod && estado === 'listo' ? prod.nombre : 'Analizar producto'} eyebrow={prod && estado === 'listo' ? `${prod.marca || ''} ${prod.cantidad || ''}` : 'Escanea o escribe el código de barras'} />
      {estado !== 'listo' && (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: estado === 'escaneando' ? 260 : 0 }}>
            <video ref={video} playsInline muted style={{ width: '100%', display: estado === 'escaneando' ? 'block' : 'none' }} />
          </div>
          {puedeEscanear && estado !== 'escaneando' && <button type="button" className="btn primary block" onClick={escanear}><Icon name="camera" /> Abrir cámara</button>}
          <form className="row" onSubmit={(e) => { e.preventDefault(); if (codigo.trim()) consultar(codigo); }}>
            <input className="input grow big" inputMode="numeric" placeholder="7801234567890" aria-label="Código de barras" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} />
            <button className="btn primary">Buscar</button>
          </form>
          {!puedeEscanear && <span className="small muted">Tu navegador no permite escanear con la cámara (iPhone/Safari). Escribe los números bajo el código de barras.</span>}
          {estado === 'cargando' && <div className="empty">Consultando Open Food Facts…</div>}
          {estado === 'noEncontrado' && <div className="card"><span className="b">No encontré ese producto.</span><span className="small muted">Regístralo a mano en el Diario con los datos de la etiqueta, o pregúntale al coach.</span><Link className="btn white" to="/diario">Ir al diario</Link></div>}
          {estado === 'error' && <div className="card"><span className="b">Sin conexión con la base de productos.</span><span className="small muted">Intenta de nuevo en un momento.</span></div>}
          {(data.escaneos || []).length > 0 && (
            <div className="col"><span className="eyebrow muted">Escaneados recientes</span>
              {data.escaneos.slice(0, 5).map((e) => <button key={e.fecha} type="button" className="chip" style={{ textAlign: 'left' }} onClick={() => { setCodigo(e.codigo); consultar(e.codigo); }}>{e.nombre}</button>)}
            </div>
          )}
        </>
      )}
      {estado === 'listo' && an && (
        <>
          <div className="card row" style={{ flexDirection: 'row', gap: 16 }}>
            <Ring pct={an.score} size={92} color={color}><span style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 800 }}>{an.score}</span><span className="small b muted">de 100</span></Ring>
            <div className="col grow"><span className="h2">{an.veredicto}</span><span className="small" style={{ lineHeight: 1.4 }}>Evaluado según tu fase {h.fase?.nombre?.toLowerCase() || ''} y lo que te falta hoy.</span></div>
          </div>
          <div className="wrap">{an.sellos.map((s) => <span key={s} className="sello">{s}</span>)}<span className="tag light" style={{ fontSize: 11, padding: '5px 8px' }}>Open Food Facts</span></div>
          <div className="grid2">
            <div className="card" style={{ gap: 2, padding: 12 }}><span className="small b muted">Proteína cada 100 kcal</span><span className="big">{an.protPor100kcal.toFixed(1).replace('.', ',')} g</span><span className="small muted">Ideal: 6 g o más</span></div>
            <div className="card" style={{ gap: 2, padding: 12 }}><span className="small b muted">Por 100 {prod.liquido ? 'ml' : 'g'}</span><span className="big">{Math.round(prod.por100.kcal)} kcal</span><span className="small muted">Azúcar {prod.por100.azucar} g · sodio {Math.round(prod.por100.sodio)} mg</span></div>
          </div>
          <div className="card" style={{ gap: 6, fontSize: 13 }}>
            {an.pros.map((p) => <span key={p}><b style={{ color: 'var(--ok)' }}>+ </b>{p}</span>)}
            {an.contras.map((p) => <span key={p}><b style={{ color: 'var(--bad)' }}>− </b>{p}</span>)}
          </div>
          {an.alternativa && (
            <div className="card dark" style={{ gap: 6 }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>Mejor alternativa</span>
              <span className="b">{an.alternativa.nombre}</span><span className="small" style={{ color: '#DCE6E1' }}>{an.alternativa.porcion} · {an.alternativa.p} g proteína · {an.alternativa.kcal} kcal</span>
            </div>
          )}
          <div className="card row" style={{ flexDirection: 'row' }}>
            <span className="b grow">Cantidad</span>
            <label className="unitInput"><input inputMode="decimal" value={gramos} onChange={(e) => setGramos(e.target.value)} aria-label="Gramos" /><span className="small b muted">{prod.liquido ? 'ml' : 'g'}</span></label>
            <span className="small b">{mac.kcal} kcal · P {mac.p}</span>
          </div>
          <div className="row">
            <button type="button" className="btn ghost grow" onClick={() => { setProd(null); setEstado('inicio'); setCodigo(''); }}>Otro</button>
            <button type="button" className="btn primary grow" onClick={registrar}>Registrar</button>
          </div>
        </>
      )}
    </div>
  );
}
