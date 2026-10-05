export const TEMAS = {
  bosque:    { nombre: 'Bosque',    dark: '#0F2A22', accent: '#C8F03C', track: '#2B4A40', ground: '#EEF3EF', soft: '#18382E' },
  oceano:    { nombre: 'Océano',    dark: '#0E2340', accent: '#5CE1E6', track: '#24406A', ground: '#EDF2F8', soft: '#16305A' },
  rosa:      { nombre: 'Rosa',      dark: '#4A1035', accent: '#FF8FC7', track: '#6E2552', ground: '#F9EEF4', soft: '#5E1A45' },
  atardecer: { nombre: 'Atardecer', dark: '#3A1C0C', accent: '#FFB547', track: '#5C3420', ground: '#F8F1EA', soft: '#4A2615' },
  violeta:   { nombre: 'Violeta',   dark: '#1E1442', accent: '#B9A8FF', track: '#3A2E6E', ground: '#F1EFF9', soft: '#2A1F58' },
};

export function aplicarTema(id) {
  const t = TEMAS[id] || TEMAS.bosque;
  const r = document.documentElement.style;
  r.setProperty('--dark', t.dark);
  r.setProperty('--accent', t.accent);
  r.setProperty('--track', t.track);
  r.setProperty('--ground', t.ground);
  r.setProperty('--soft', t.soft);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t.dark);
}
