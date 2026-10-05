import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from './store.jsx';
import { useHoy } from './derived.js';
import { PROMPT_SISTEMA, contexto, llamarModelo, extraerRegistro, respuestaLocal } from './coach.js';
import { uid } from './format.js';
import { Icon } from './ui.jsx';
import Propuesta from './Propuesta.jsx';

const SUGERENCIAS = ['¿Qué como antes de entrenar?', '¿Cuánta proteína me falta?', '¿En qué fase estoy?', 'Almorcé cazuela y una marraqueta'];

export default function Coach() {
  const { perfil, data, update } = useStore();
  const h = useHoy();
  const [msg, setMsg] = useState('');
  const [foto, setFoto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const fin = useRef(null);
  const conModelo = !!(data.ajustes.coachUrl || data.ajustes.coachKey);
  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth' }); }, [data.chat.length, cargando]);

  const push = (m) => update((d) => ({ ...d, chat: [...d.chat, { id: uid(), fecha: new Date().toISOString(), ...m }].slice(-80) }));
  const ctx = { perfil, meta: data.meta, fase: h.fase, semanaN: h.semanaN, objetivos: h.objetivos, totales: h.totales, sesionHoy: h.sesionHoy, peso: h.peso, revision: h.revision };

  const enviar = async (texto) => {
    const t = (texto ?? msg).trim();
    if (!t && !foto) return;
    push({ rol: 'yo', texto: t || 'Foto de mi comida', foto });
    setMsg(''); const f = foto; setFoto(null);
    if (!conModelo) {
      const r = f && !t ? { texto: 'Para analizar fotos necesito un modelo de IA conectado (Perfil → Coach). Mientras, descríbeme el plato y lo registro.' } : respuestaLocal(t, ctx);
      push({ rol: 'coach', texto: r.texto, registro: r.registro || null });
      return;
    }
    setCargando(true);
    try {
      const historial = data.chat.slice(-10).map((m) => ({ role: m.rol === 'yo' ? 'user' : 'assistant', content: m.texto }));
      const contenido = f ? [{ type: 'text', text: t || 'Registra esta comida.' }, { type: 'image_url', image_url: { url: f } }] : t;
      const raw = await llamarModelo(data.ajustes, [{ role: 'system', content: PROMPT_SISTEMA }, { role: 'system', content: contexto(ctx) }, ...historial, { role: 'user', content: contenido }]);
      const { texto: limpio, registro } = extraerRegistro(raw);
      push({ rol: 'coach', texto: limpio, registro });
    } catch (e) {
      const r = respuestaLocal(t, ctx);
      push({ rol: 'coach', texto: `${r.texto}\n\n(No pude conectar con el modelo: ${e.message}. Respondí con el modo local.)`, registro: r.registro || null });
    } finally { setCargando(false); }
  };

  const leerFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); const s = Math.min(1, 768 / Math.max(img.width, img.height));
      c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      setFoto(c.toDataURL('image/jpeg', 0.8));
    };
    img.src = URL.createObjectURL(file);
  };
  const cerrarRegistro = (id) => update((d) => ({ ...d, chat: d.chat.map((m) => (m.id === id ? { ...m, registrado: true } : m)) }));

  return (
    <div className="screen" style={{ paddingBottom: 190 }}>
      <div className="row">
        <span style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="hoy" stroke="var(--accent)" /></span>
        <div className="col grow" style={{ gap: 0 }}>
          <h1 className="h1" style={{ fontSize: 20 }}>Tu nutricionista deportivo</h1>
          <span className="small b muted">{conModelo ? 'Coach IA conectado' : 'Modo local · conecta IA en Perfil'} · ve tu meta, semana y diario</span>
        </div>
      </div>
      {data.chat.length === 0 && (
        <div className="bubble bot">Hola, {perfil.nombre}. Puedo registrar lo que comes (escríbelo o díctalo), decirte qué comer según tu entrenamiento y explicarte tu fase. ¿Partimos?</div>
      )}
      {data.chat.map((m) => (
        <div key={m.id} className="col" style={{ gap: 8 }}>
          <div className={`bubble ${m.rol === 'yo' ? 'me' : 'bot'}`}>
            {m.foto && <img src={m.foto} alt="Foto enviada" style={{ width: '100%', borderRadius: 12, marginBottom: 6 }} />}
            {m.texto}
          </div>
          {m.registro?.registrar?.length > 0 && !m.registrado && (
            <Propuesta items={m.registro.registrar} comida={m.registro.comida} fecha={h.fecha} metodo={m.foto ? 'foto' : 'coach'} onDone={() => cerrarRegistro(m.id)} />
          )}
          {m.registrado && <span className="small b muted" style={{ alignSelf: 'flex-start' }}>✓ Registrado en tu diario</span>}
        </div>
      ))}
      {cargando && <div className="bubble bot muted">Pensando…</div>}
      <div ref={fin} />
      <div style={{ position: 'fixed', bottom: 'calc(74px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '8px 14px', background: 'var(--ground)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="row" style={{ overflowX: 'auto', gap: 6 }}>{SUGERENCIAS.map((s) => <button key={s} type="button" className="chip" style={{ flex: 'none' }} onClick={() => enviar(s)}>{s}</button>)}</div>
        {foto && <div className="row"><img src={foto} alt="Foto a enviar" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10 }} /><button type="button" className="chip" onClick={() => setFoto(null)}>Quitar foto</button></div>}
        <form className="row" onSubmit={(e) => { e.preventDefault(); enviar(); }} style={{ background: '#fff', borderRadius: 999, padding: '6px 6px 6px 8px', border: '1.5px solid #DCE6E1' }}>
          <label className="iconBtn" style={{ background: 'var(--ground)', width: 40, height: 40, borderRadius: 999 }} aria-label="Adjuntar foto">
            <Icon name="camera" size={18} /><input type="file" accept="image/*" capture="environment" onChange={leerFoto} className="sr" />
          </label>
          <label className="sr" htmlFor="msg">Mensaje al coach</label>
          <input id="msg" className="grow" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Pregúntale a tu coach…" style={{ border: 0, background: 'transparent', fontSize: 15, minHeight: 40, minWidth: 0 }} />
          <button className="iconBtn" aria-label="Enviar" style={{ background: 'var(--dark)', color: 'var(--accent)', width: 40, height: 40, borderRadius: 999 }}><Icon name="next" size={18} width={2.6} /></button>
        </form>
        <span style={{ fontSize: 10, textAlign: 'center' }} className="muted">Orientación general basada en evidencia. No reemplaza a un nutricionista o médico. <Link to="/perfil">Ajustes</Link></span>
      </div>
    </div>
  );
}
