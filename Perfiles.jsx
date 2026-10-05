import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import { TEMAS } from './themes.js';
import { uid } from './format.js';
import { nivel } from './derived.js';
import { Brand, Icon, Logo, Sheet } from './ui.jsx';

function PerfilCard({ p, onClick }) {
  const t = TEMAS[p.tema] || TEMAS.bosque;
  let resumen = '';
  try {
    const d = JSON.parse(localStorage.getItem(`cumbre:datos:${p.id}`) || '{}');
    resumen = `Nivel ${nivel(d.xp)}${d.meta ? ` · ${d.meta.titulo}` : ''}`;
  } catch { /* */ }
  return (
    <button type="button" onClick={onClick} style={{ background: t.dark, color: '#fff', border: 0, borderRadius: 26, padding: 18, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
      <span style={{ width: 60, height: 60, borderRadius: 999, background: t.accent, color: t.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 26, fontWeight: 800, flex: 'none' }}>{p.nombre.charAt(0).toUpperCase()}</span>
      <span className="col grow" style={{ gap: 2 }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 800 }}>{p.nombre}</span>
        <span style={{ fontSize: 13, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumen}</span>
      </span>
      {p.pin ? <Icon name="lock" stroke={t.accent} /> : <Icon name="next" stroke={t.accent} width={2.4} />}
    </button>
  );
}

export default function Perfiles() {
  const { perfiles, entrar, crearPerfil } = useStore();
  const nav = useNavigate();
  const [nuevo, setNuevo] = useState(false);
  const [pinDe, setPinDe] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nombre: '', tema: 'bosque', pin: '' });

  const abrir = (p) => {
    if (p.pin) { setPinDe(p); setPin(''); setError(''); return; }
    entrar(p.id); nav('/hoy');
  };
  const validarPin = (e) => {
    e.preventDefault();
    if (pin === pinDe.pin) { entrar(pinDe.id); setPinDe(null); nav('/hoy'); } else setError('PIN incorrecto');
  };
  const crear = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    crearPerfil({ id: uid(), nombre: form.nombre.trim(), tema: form.tema, pin: form.pin.trim(), listo: false, creado: new Date().toISOString() });
    setNuevo(false);
    nav('/bienvenida');
  };

  return (
    <div className="screen noNav" style={{ paddingTop: 'calc(40px + env(safe-area-inset-top))' }}>
      <div className="row"><Logo size={34} line="var(--dark)" dot="#9DB85A" /><span className="h2" style={{ fontSize: 22 }}>Cumbre</span></div>
      <div className="col" style={{ gap: 4 }}>
        <h1 className="h1" style={{ fontSize: 30 }}>¿Quién entra?</h1>
        <span className="muted" style={{ fontSize: 14 }}>Cada perfil tiene su meta, su diario, su coach y su color. Nadie ve lo del otro.</span>
      </div>
      {perfiles.map((p) => <PerfilCard key={p.id} p={p} onClick={() => abrir(p)} />)}
      <button type="button" className="card dashed" style={{ minHeight: 60, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', fontWeight: 800, fontSize: 15, cursor: 'pointer' }} onClick={() => setNuevo(true)}>
        <Icon name="plus" width={2.4} /> {perfiles.length ? 'Crear perfil nuevo' : 'Crear mi perfil'}
      </button>
      <span className="grow" />
      <div className="card" style={{ flexDirection: 'row', gap: 10, fontSize: 13, lineHeight: 1.45 }}>
        <Icon name="lock" size={20} />
        <span>Puedes proteger cada perfil con un PIN. Los datos de este prototipo se guardan solo en este dispositivo; en la versión Base44 cada persona entra con su propia cuenta.</span>
      </div>
      <Brand />

      <Sheet open={nuevo} onClose={() => setNuevo(false)} title="Nuevo perfil">
        <form className="col" style={{ gap: 12 }} onSubmit={crear}>
          <label className="field">Nombre<input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej.: Mamá" autoFocus /></label>
          <div className="field">Color de tu app
            <div className="grid3" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
              {Object.entries(TEMAS).map(([id, t]) => (
                <button key={id} type="button" aria-pressed={form.tema === id} aria-label={t.nombre} onClick={() => setForm({ ...form, tema: id })}
                  style={{ border: `2px solid ${form.tema === id ? 'var(--ink)' : 'transparent'}`, background: form.tema === id ? '#fff' : 'transparent', borderRadius: 16, padding: '8px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <span style={{ width: 40, height: 40, borderRadius: 999, background: t.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 16, height: 16, borderRadius: 999, background: t.accent }} /></span>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{t.nombre}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="field">PIN de 4 dígitos (opcional)<input className="input" inputMode="numeric" maxLength={4} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })} /></label>
          <button className="btn primary block" disabled={!form.nombre.trim()}>Crear y continuar</button>
        </form>
      </Sheet>

      <Sheet open={!!pinDe} onClose={() => setPinDe(null)} title={`Hola, ${pinDe?.nombre || ''}`}>
        <form className="col" style={{ gap: 12 }} onSubmit={validarPin}>
          <label className="field">Ingresa tu PIN<input className="input big" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} autoFocus /></label>
          {error && <span className="small b" style={{ color: 'var(--bad)' }}>{error}</span>}
          <button className="btn primary block">Entrar</button>
        </form>
      </Sheet>
    </div>
  );
}
