// Mediterranean / Coliseum palette
// Inspired by warm aged stone, cypress trees, and Aegean sky.
//
// Semantic usage:
// - bronze / bronzeDark: structural, primary accent, "stone" elements
// - cypress: vegetation, natural, "dieta" category, healthy/success states
// - aegean: water, hydration, info states
// - terracotta: calories, warnings, sun-baked tones
// - marble: empty tracks, grid lines, soft separators

export const C = {
  // Backgrounds
  pageBg:    '#eddfc8',   // warm Coliseum sand
  cardBg:    '#ffffff',   // polished marble
  cardAlt:   '#faf6f0',   // aged paper
  inputBg:   '#ffffff',

  // Borders & marble
  border:    '#e5e0d6',   // marble vein
  borderSoft:'#f0ece4',
  marble:    '#e5e0d6',
  marbleLight:'#f5f0e8',  // pale stone fill (badges, table headers)

  // Stone — primary accents
  bronze:    '#c4a882',   // sunlit Coliseum stone (main accent)
  bronzeDark:'#9a7040',   // weathered metal (emphasis)
  bronzeDeep:'#7a5830',   // dark bronze (hover, active)

  // Cypress — vegetation / natural / dieta / success
  cypress:    '#5a7842',
  cypressDark:'#3d5a2a',
  cypressLight:'#a8bf8e',
  cypressFaint:'rgba(90,120,66,0.10)',

  // Aegean — water / hydration / info
  aegean:     '#5a8aa0',
  aegeanDark: '#3d6878',
  aegeanSky:  '#b8cdd9',
  aegeanFaint:'rgba(90,138,160,0.10)',

  // Terracotta — calories / warmth / warning
  terracotta:    '#b8633a',
  terracottaDark:'#8a4520',
  terracottaFaint:'rgba(184,99,58,0.10)',

  // Text
  text:      '#1e1812',
  textSub:   '#6b5a40',
  textMuted: '#a0907a',

  // Grid
  gridLine:  '#e8e2d6',
};

// Reusable style objects
export const card = {
  background: C.cardBg,
  borderRadius: 8,
  padding: 20,
  boxShadow: '0 1px 3px rgba(30,24,18,0.07), 0 4px 12px rgba(30,24,18,0.04)',
  border: `1px solid ${C.border}`,
};

export const tooltipStyle = {
  background: C.cardBg,
  border: `1px solid ${C.bronze}`,
  borderRadius: 4,
  fontSize: 12,
  color: C.text,
  boxShadow: '0 2px 8px rgba(30,24,18,0.1)',
};

export const sectionTitle = {
  fontSize: 11,
  fontWeight: 700,
  color: C.bronzeDark,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${C.border}`,
  paddingBottom: 10,
  marginBottom: 16,
};

export const pageHeader = (titleColor = C.text, accentColor = C.bronze) => ({
  fontSize: 22,
  fontWeight: 800,
  color: titleColor,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: 0,
  marginBottom: 4,
});

export const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  background: C.inputBg,
  color: C.text,
  boxSizing: 'border-box',
};

export const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: C.bronzeDark,
  marginBottom: 6,
  display: 'block',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

export const btnPrimary = {
  background: C.bronzeDark,
  color: '#ffffff',
  border: 'none',
  borderRadius: 6,
  padding: '9px 18px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  letterSpacing: '0.02em',
  transition: 'background 0.15s',
};

export const btnSecondary = {
  background: C.marbleLight,
  color: C.bronzeDark,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: '9px 18px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export const badge = (color = C.bronzeDark, bg = C.marbleLight) => ({
  fontSize: 10,
  fontWeight: 700,
  color,
  background: bg,
  border: `1px solid ${C.border}`,
  padding: '3px 9px',
  borderRadius: 99,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  display: 'inline-block',
});

// Category color mapping (semantic)
export const categoryColor = (cat) => {
  switch (cat) {
    case 'ejercicio': return C.bronzeDark;
    case 'dieta':     return C.cypress;
    case 'general':   return C.aegean;
    default:          return C.bronze;
  }
};

// Status color mapping (semantic)
export const statusColor = (status) => {
  switch (status) {
    case 'activo':     return C.bronzeDark;
    case 'completado': return C.cypress;
    case 'pausado':    return C.textMuted;
    default:           return C.bronze;
  }
};
