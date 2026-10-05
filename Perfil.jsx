import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, exportarDatos } from './store.jsx';
import { TEMAS } from './themes.js';
import { nivel } from './derived.js';
import { fmt } from './format.js';
import { Brand, Header, Icon, useToast } from './ui.jsx';

export default function Perfil() {
  const { perfil, data, actualizarPerfil, update, salir, borrarPerfil } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [aj, setAj] = useState(data.ajustes);
  const [pin, setPin] = useState(perfil.pin || '');
  const guardarAjustes = () => { update((d) => ({ ...d, ajustes: { ...d.ajustes, ...aj } })); actualizarPerfil({ pin }); toast('Ajustes guardados'); };
  return (
    <div className="screen noNav">
      <Header title="Perfil" eyebrow={`Nivel ${nivel(data.xp)} · ${fmt(data.xp)} XP`} back="/hoy" />
      <div className="card row" style={{ flexDirection: 'row' }}>
        <span style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--dark)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 22 }}>{perfil.nombre.charAt(0)}</span>
        <span className="col grow" style={{ gap: 0 }}><span className="h2">{perfil.nombre}</span><span className="small muted">{perfil.peso} kg · {perfil.estatura} cm · {perfil.edad} años</span></span>
        <Link to="/bienvenida" className="btn white" style={{ background: 'var(--ground)', minHeight: 40 }}>Editar</Link>
      </div>

      <div className="field">Color de tu app
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))' }}>
          {Object.entries(TEMAS).map(([id, t]) => (
            <button key={id} type="button" aria-pressed={perfil.tema === id} aria-label={t.nombre} onClick={() => actualizarPerfil({ tema: id })}
              style={{ border: `2px solid ${perfil.tema === id ? 'var(--ink)' : 'transparent'}`, background: perfil.tema === id ? '#fff' : 'transparent', borderRadius: 16, padding: '8px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <span style={{ width: 44, height: 44, borderRadius: 999, background: t.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 18, height: 18, borderRadius: 999, background: t.accent }} /></span>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{t.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <span className="h2" style={{ fontSize: 17 }}>Coach con IA</span>
        <span className="small muted">Sin configurar, el coach funciona en modo local (registro por texto y reglas). Para respuestas completas y análisis de fotos, conecta un modelo compatible con OpenAI. En la versión Base44 esto se hace en el servidor y no necesitas poner una clave aquí.</span>
        <label className="field" style={{ fontSize: 13 }}>URL del endpoint<input className="input" style={{ background: 'var(--ground)' }} placeholder="https://api.openai.com/v1/chat/completions" value={aj.coachUrl} onChange={(e) => setAj({ ...aj, coachUrl: e.target.value })} /></label>
        <label className="field" style={{ fontSize: 13 }}>Clave de API (solo para pruebas personales)<input className="input" type="password" style={{ background: 'var(--ground)' }} value={aj.coachKey} onChange={(e) => setAj({ ...aj, coachKey: e.target.value })} /></label>
        <label className="field" style={{ fontSize: 13 }}>Modelo<input className="input" style={{ background: 'var(--ground)' }} value={aj.coachModelo} onChange={(e) => setAj({ ...aj, coachModelo: e.target.value })} /></label>
      </div>
      <div className="card">
        <span className="h2" style={{ fontSize: 17 }}>Preferencias</span>
        <label className="between" style={{ fontSize: 14, fontWeight: 700 }}>Meta de agua (vasos de 250 ml)<input className="input" style={{ width: 80, background: 'var(--ground)' }} inputMode="numeric" value={aj.aguaMeta} onChange={(e) => setAj({ ...aj, aguaMeta: +e.target.value || 8 })} /></label>
        <label className="between" style={{ fontSize: 14, fontWeight: 700 }}>% de calorías del reloj que se suman<input className="input" style={{ width: 80, background: 'var(--ground)' }} inputMode="numeric" value={Math.round(aj.factorEjercicio * 100)} onChange={(e) => setAj({ ...aj, factorEjercicio: (+e.target.value || 0) / 100 })} /></label>
        <label className="between" style={{ fontSize: 14, fontWeight: 700 }}>PIN del perfil<input className="input" style={{ width: 100, background: 'var(--ground)' }} inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} /></label>
        {data.ajustes.ajusteKcal ? <span className="small muted">Ajuste automático de calorías por tus revisiones: {data.ajustes.ajusteKcal > 0 ? '+' : ''}{data.ajustes.ajusteKcal} kcal.</span> : null}
        <button type="button" className="btn primary" onClick={guardarAjustes}>Guardar ajustes</button>
      </div>
      <div className="col" style={{ gap: 8 }}>
        <Link to="/meta" className="btn white"><Icon name="metas" size={18} /> Editar mi meta</Link>
        <button type="button" className="btn white" onClick={() => exportarDatos(perfil, data)}><Icon name="doc" size={18} /> Exportar mis datos</button>
        <button type="button" className="btn ghost" onClick={() => { salir(); nav('/perfiles'); }}>Cerrar sesión y cambiar de perfil</button>
        <button type="button" className="btn" style={{ background: 'transparent', color: 'var(--bad)' }} onClick={() => { if (window.confirm(`¿Borrar el perfil de ${perfil.nombre} y todos sus datos? No se puede deshacer.`)) { borrarPerfil(perfil.id); nav('/perfiles'); } }}>Borrar este perfil</button>
      </div>
      <Brand />
    </div>
  );
}
