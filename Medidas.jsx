import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import { XP } from './derived.js';
import { today, corto } from './dates.js';
import { num, uid, fmt1 } from './format.js';
import { Header, Icon, useToast } from './ui.jsx';

const TIPOS = [['peso', 'Peso', 'kg'], ['cintura', 'Cintura', 'cm'], ['cadera', 'Cadera', 'cm'], ['brazo', 'Brazo', 'cm'], ['pecho', 'Pecho', 'cm'], ['muslo', 'Muslo', 'cm'], ['grasa', '% grasa (bioimpedancia)', '%']];

export default function Medidas() {
  const { data, update, sumarXP } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const ultima = (t) => data.mediciones.filter((m) => m.tipo === t).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const primera = (t) => data.mediciones.filter((m) => m.tipo === t).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  const [v, setV] = useState(() => Object.fromEntries(TIPOS.map(([t]) => [t, ''])));
  const fotos = data.fotos || [];
  const subirFoto = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); const s = Math.min(1, 640 / Math.max(img.width, img.height));
      c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      update((d) => ({ ...d, fotos: [{ id: uid(), fecha: today(), dataUrl: c.toDataURL('image/jpeg', 0.7) }, ...(d.fotos || [])].slice(0, 24) }));
      toast('Foto guardada (solo en este dispositivo)');
    };
    img.src = URL.createObjectURL(file);
  };
  const guardar = () => {
    const nuevas = TIPOS.filter(([t]) => num(v[t]) > 0).map(([t]) => ({ id: uid(), fecha: today(), tipo: t, valor: num(v[t]), fuente: 'manual' }));
    if (!nuevas.length) return;
    update((d) => ({ ...d, mediciones: [...nuevas, ...d.mediciones] }));
    sumarXP(XP.medidas, 'Control de medidas');
    toast(<span>Control guardado · <b>+{XP.medidas} XP</b></span>);
    nav('/progreso');
  };
  return (
    <div className="screen noNav">
      <Header title="Medidas y fotos" eyebrow="Control mensual · misma hora y condiciones" />
      <div className="card" style={{ padding: '6px 14px', gap: 0 }}>
        {TIPOS.map(([t, n, u]) => {
          const ul = ultima(t); const pr = primera(t);
          const delta = ul && pr && ul.id !== pr.id ? ul.valor - pr.valor : null;
          return (
            <div key={t} className="row" style={{ minHeight: 56, borderBottom: '1px solid var(--line)' }}>
              <span className="col grow" style={{ gap: 0 }}><span className="b" style={{ fontSize: 14 }}>{n}</span>
                <span className="small" style={{ color: delta !== null && ((t === 'brazo' || t === 'pecho' || t === 'muslo') ? delta > 0 : delta < 0) ? 'var(--ok)' : 'var(--muted)', fontWeight: 700 }}>{ul ? `Último: ${fmt1(ul.valor)} ${u} (${corto(ul.fecha)})${delta !== null ? ` · ${delta > 0 ? '+' : ''}${fmt1(delta)} desde el inicio` : ''}` : 'Sin registro'}</span></span>
              <label className="unitInput"><input inputMode="decimal" value={v[t]} onChange={(e) => setV({ ...v, [t]: e.target.value })} aria-label={n} placeholder={ul ? fmt1(ul.valor) : ''} /><span className="small b muted" style={{ width: 22 }}>{u}</span></label>
            </div>
          );
        })}
      </div>
      <div className="field">Fotos de progreso
        <div className="grid3">
          {fotos.slice(0, 5).map((f) => <figure key={f.id} style={{ margin: 0 }}><img src={f.dataUrl} alt={`Progreso ${corto(f.fecha)}`} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 16 }} /><figcaption className="small b muted" style={{ textAlign: 'center' }}>{corto(f.fecha)}</figcaption></figure>)}
          <label style={{ aspectRatio: '3/4', borderRadius: 16, border: '2px dashed #9DB2A8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            <Icon name="camera" />Agregar<input type="file" accept="image/*" className="sr" onChange={subirFoto} />
          </label>
        </div>
        <span className="small muted" style={{ fontWeight: 500 }}>Privadas: se guardan solo en este dispositivo. Usa la misma luz y pose para comparar.</span>
      </div>
      <button type="button" className="btn primary block" onClick={guardar}>Guardar control · +{XP.medidas} XP</button>
    </div>
  );
}
