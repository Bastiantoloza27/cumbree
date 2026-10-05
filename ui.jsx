import { createContext, useCallback, useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const P = {
  hoy: 'M3 20l6-10 4 6 3-4 5 8z',
  diario: 'M5 4h14v16H5zM9 9h6M9 13h6',
  semana: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  metas: 'M5 21V4M5 4h11l-2 4 2 4H5',
  coach: 'M4 5h16v11H9l-5 4z',
  plus: 'M12 5v14M5 12h14',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  edit: 'M4 20h4L19 9l-4-4L4 16z',
  mic: 'M9 3h6v11H9zM5 11a7 7 0 0 0 14 0M12 18v3',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7z',
  barcode: 'M4 6v12M8 6v12M11 6v12M15 6v12M18 6v12M20 6v12',
  search: 'M11 17a6 6 0 1 0 0-12a6 6 0 0 0 0 12zM20 20l-4.5-4.5',
  flame: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1.2 2.5 2 2.5 0-3-1-5 1-8z',
  weight: 'M6 12h12M4 9v6M20 9v6M8 7v10M16 7v10',
  padel: 'M9 15a5 5 0 1 1 6-6l-6 6zM9 15l-5 5',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
  ruler: 'M3 8h18v8H3zM7 8v3M11 8v4M15 8v3M19 8v4',
  face: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM8 14s1.5 2 4 2 4-2 4-2',
  user: 'M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  lock: 'M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3',
  doc: 'M6 3h9l3 3v15H6zM9 10h6M9 14h6',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
};

export function Icon({ name, size = 22, stroke = 'currentColor', width = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name]} />
    </svg>
  );
}

export function Logo({ size = 64, line = '#FFFFFF', dot = 'var(--accent)', w = 6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 34 L20 48 L34 26 L42 36 L54 14" stroke={line} strokeWidth={w} />
      <circle cx="55" cy="12" r="5" fill={dot} />
    </svg>
  );
}

export function Brand() {
  return <div className="footerBrand">Desarrollada por <b>EduSoftCare</b></div>;
}

export function Header({ title, eyebrow, back = -1, right }) {
  const nav = useNavigate();
  return (
    <div className="row">
      {back !== false && (
        <button type="button" className="iconBtn" aria-label="Volver" onClick={() => (typeof back === 'string' ? nav(back) : nav(back))}>
          <Icon name="back" size={20} width={2.4} />
        </button>
      )}
      <div className="col grow" style={{ gap: 0 }}>
        {eyebrow && <span className="small muted b">{eyebrow}</span>}
        <h1 className="h1" style={{ fontSize: 22 }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

export function Nav() {
  const items = [
    ['/hoy', 'Hoy', 'hoy'], ['/diario', 'Diario', 'diario'], null, ['/semana', 'Semana', 'semana'], ['/metas', 'Metas', 'metas'], ['/coach', 'Coach', 'coach'],
  ];
  return (
    <nav className="nav" aria-label="Navegación principal">
      {items.map((it, i) => it ? (
        <NavLink key={it[0]} to={it[0]} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon name={it[2]} />{it[1]}
        </NavLink>
      ) : (
        <Link key={i} to="/registrar" aria-label="Registrar algo"><span className="plus"><Icon name="plus" width={2.6} /></span></Link>
      ))}
    </nav>
  );
}

export function Bar({ pct, color = 'var(--accent)', height = 8, bg }) {
  return (
    <div className="bar" style={{ height, ...(bg ? { background: bg } : {}) }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  );
}

export function Ring({ pct, size = 104, color = 'var(--dark)', children }) {
  const r = 44, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 104 104" aria-hidden="true">
        <circle cx="52" cy="52" r={r} fill="none" stroke="#E2EAE5" strokeWidth="10" />
        <circle cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, pct / 100)))} transform="rotate(-90 52 52)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    </div>
  );
}

export function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="between">
          <h2 className="h2">{title}</h2>
          <button type="button" className="iconBtn" aria-label="Cerrar" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, step = 1, min = 0, label, format = (v) => v }) {
  return (
    <span className="row" style={{ gap: 4 }}>
      <button type="button" className="iconBtn" style={{ background: 'var(--ground)', width: 36, height: 36 }} aria-label={`Menos ${label}`} onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}>−</button>
      <span className="b small" style={{ minWidth: 54, textAlign: 'center' }}>{format(value)}</span>
      <button type="button" className="iconBtn" style={{ background: 'var(--ground)', width: 36, height: 36 }} aria-label={`Más ${label}`} onClick={() => onChange(+(value + step).toFixed(2))}>+</button>
    </span>
  );
}

const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(null), 2200); }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
