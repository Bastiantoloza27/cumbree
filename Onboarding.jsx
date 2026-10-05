import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import { ACTIVIDAD, basal } from './nutrition.js';
import { fmt, num, uid } from './format.js';
import { today } from './dates.js';
import { Brand } from './ui.jsx';

export default function Onboarding() {
  const { perfil, actualizarPerfil, update } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({
    sexo: perfil.sexo || 'h', peso: perfil.peso || '', estatura: perfil.estatura || '', edad: perfil.edad || '', actividad: perfil.actividad || 'moderada',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const bmr = basal(f);
  const tdee = bmr * (ACTIVIDAD.find((a) => a.id === f.actividad)?.factor || 1.55);
  const ok = num(f.peso) > 25 && num(f.estatura) > 100 && num(f.edad) > 10;

  const guardar = () => {
    const primera = !perfil.listo;
    actualizarPerfil({ ...f, listo: true });
    if (primera) update((d) => ({ ...d, mediciones: [{ id: uid(), fecha: today(), tipo: 'peso', valor: num(f.peso), fuente: 'manual' }, ...d.mediciones] }));
    nav(primera ? '/meta' : -1);
  };

  return (
    <div className="screen noNav">
      <div className="col" style={{ gap: 2 }}>
        <span className="small b muted">{perfil.listo ? 'Tus datos base' : `Bienvenido, ${perfil.nombre} · 1 minuto`}</span>
        <h1 className="h1">Tus datos base</h1>
        <span className="muted" style={{ fontSize: 13 }}>Con esto calculamos tus calorías y macros. Puedes cambiarlos cuando quieras.</span>
      </div>
      <div className="field">Sexo biológico (para el cálculo)
        <div className="grid2" style={{ gap: 6 }}>
          {[['h', 'Hombre'], ['m', 'Mujer']].map(([id, n]) => <button key={id} type="button" className="seg" aria-pressed={f.sexo === id} onClick={() => setF({ ...f, sexo: id })}>{n}</button>)}
        </div>
      </div>
      <div className="grid3">
        {[['peso', 'Peso', 'kg'], ['estatura', 'Estatura', 'cm'], ['edad', 'Edad', 'años']].map(([k, n, u]) => (
          <label key={k} className="field">{n}
            <span className="row" style={{ background: '#fff', borderRadius: 14, padding: '0 10px', minHeight: 48, gap: 4 }}>
              <input inputMode="decimal" value={f[k]} onChange={set(k)} style={{ width: '100%', minWidth: 0, border: 0, background: 'transparent', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18 }} />
              <span className="small b muted">{u}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="field">Actividad semanal (trabajo y deporte)
        {ACTIVIDAD.map((a) => (
          <button key={a.id} type="button" className="seg" aria-pressed={f.actividad === a.id} onClick={() => setF({ ...f, actividad: a.id })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 14px' }}>
            <span className="b">{a.nombre}</span><span className="small muted">{a.hint}</span>
          </button>
        ))}
      </div>
      <div className="card dark">
        <div className="grid2">
          <div className="col" style={{ gap: 0 }}><span className="small muted b">Mantención estimada</span><span className="big">{ok ? `${fmt(Math.round(tdee / 10) * 10)} kcal` : '—'}</span></div>
          <div className="col" style={{ gap: 0 }}><span className="small muted b">Proteína diaria</span><span className="big" style={{ color: 'var(--accent)' }}>{ok ? `${Math.round(num(f.peso) * 1.8)} g` : '—'}</span></div>
        </div>
        <span className="small" style={{ color: '#DCE6E1' }}>Ecuación de Mifflin-St Jeor × nivel de actividad. Tu meta diaria exacta depende de la fase en que estés y se recalibra con tu peso real.</span>
      </div>
      <button type="button" className="btn accent block" disabled={!ok} onClick={guardar}>{perfil.listo ? 'Guardar' : 'Continuar: crear mi meta'}</button>
      <Brand />
    </div>
  );
}
