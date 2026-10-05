import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './ui.jsx';

export default function Splash() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav('/perfiles', { replace: true }), 1900);
    return () => clearTimeout(t);
  }, [nav]);
  return (
    <button type="button" className="splash" onClick={() => nav('/perfiles', { replace: true })} aria-label="Entrar a Cumbre">
      <svg width="100%" height="300" viewBox="0 0 390 300" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: 0 }} aria-hidden="true">
        <path d="M0 300 L0 210 L70 150 L120 190 L200 110 L260 170 L320 120 L390 175 L390 300 Z" fill="rgba(255,255,255,0.04)" />
        <path d="M0 300 L0 250 L90 200 L150 235 L230 175 L300 225 L390 195 L390 300 Z" fill="rgba(255,255,255,0.06)" />
      </svg>
      <span style={{ height: 110 }} />
      <span className="col rise" style={{ alignItems: 'center', gap: 18, position: 'relative' }}>
        <span style={{ width: 132, height: 132, borderRadius: 36, background: 'var(--soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={92} />
        </span>
        <span style={{ fontFamily: 'var(--display)', fontSize: 52, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>Cumbre</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#DCE6E1' }}>Cada día suma a tu cima</span>
      </span>
      <span className="col" style={{ alignItems: 'center', gap: 14, position: 'relative' }}>
        <span className="loadbar"><span /></span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9DB2A8' }}>Desarrollada por <b style={{ color: '#fff' }}>EduSoftCare</b></span>
      </span>
    </button>
  );
}
