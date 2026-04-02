// ─── CAZYNO DESIGN SYSTEM ───
// Single source of truth for all colors, sizes, and styles.
// Import this in every component/page instead of hardcoding values.

// Colors
export const C = {
  bg:   '#080c12',
  sbg:  '#0c1018',
  crd:  '#111a25',
  crdH: '#162030',
  b:    '#1a2a38',
  g:    '#00e701',
  gR:   'rgba(0,231,1,',
  p:    '#8b5cf6',
  s:    '#94a3b8',
  m:    '#4b5c6f',
  gold: '#FFD700',
  red:  '#ef4444',
  white:'#fff',
  black:'#000',
};

// Typography styles (use as style prop)
export const T = {
  h1:   { fontFamily:'Orbitron,sans-serif', fontSize:'20px', fontWeight:900, color:C.white, letterSpacing:'0.03em' },
  h2:   { fontFamily:'Orbitron,sans-serif', fontSize:'15px', fontWeight:700, color:C.white },
  h3:   { fontSize:'13px', fontWeight:700, color:C.white },
  body: { fontSize:'13px', fontWeight:500, color:C.s },
  small:{ fontSize:'11px', color:C.m },
  tiny: { fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:C.m },
  mono: { fontSize:'13px', fontFamily:'monospace', fontWeight:700, color:C.white },
};

// Card styles
export const card = {
  background: C.crd,
  border: `1px solid ${C.b}`,
  borderRadius: '16px',
};

// Block header (inside a card, top section with title)
export const blockHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 20px',
  borderBottom: `1px solid ${C.b}`,
};

// Input style
export const input = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  background: C.crd,
  border: `1px solid ${C.b}`,
  color: C.white,
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

// Button styles
export const btn = {
  primary: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '14px 24px', borderRadius: '12px',
    background: C.g, border: 'none', color: C.black,
    fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
  },
  secondary: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '14px 24px', borderRadius: '12px',
    background: C.crd, border: `1px solid ${C.b}`, color: C.white,
    fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
  },
  small: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '8px',
    background: C.crd, border: `1px solid ${C.b}`, color: C.s,
    fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
  },
  icon: {
    width: '36px', height: '36px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: C.crd, border: `1px solid ${C.b}`,
    cursor: 'pointer', transition: 'all 0.15s',
  },
};

// Badge/tag style
export const badge = {
  standard: {
    fontSize: '10px', fontWeight: 800,
    padding: '3px 10px', borderRadius: '8px',
  },
  inline: {
    fontSize: '11px', fontWeight: 700,
    padding: '5px 12px', borderRadius: '8px',
  },
};

// Icon container
export const iconBox = (color, size = 36) => ({
  width: `${size}px`, height: `${size}px`,
  borderRadius: '12px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: `${color}15`, border: `1px solid ${color}25`,
  flexShrink: 0,
});

// Modal overlay
export const modalOverlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.65)',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
  zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '16px',
};

// Modal container
export const modalBox = {
  background: C.bg,
  border: `1px solid ${C.b}`,
  borderRadius: '20px',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
};
