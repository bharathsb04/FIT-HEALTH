const fs = require('fs');
const path = require('path');

const levels = ['beginner', 'intermediate', 'advanced'];
const muscles = [
  { name: 'chest', title: 'Chest / Pectorals', icon: 'M4 7h16M4 12h16M4 17h16' },
  { name: 'back', title: 'Back & Lats', icon: 'M12 2v20M5 7l7 5 7-5M5 17l7-5 7 5' },
  { name: 'shoulders', title: 'Shoulders / Delts', icon: 'M3 12h18M6 8l6-4 6 4M6 16l6 4 6-4' },
  { name: 'legs', title: 'Legs & Quads', icon: 'M8 3v18M16 3v18M5 14h6M13 14h6' },
  { name: 'arms', title: 'Arms & Biceps/Triceps', icon: 'M7 7l10 10M17 7L7 17' },
  { name: 'core', title: 'Core & Abs', icon: 'M6 6h12v12H6zM10 6v12M14 6v12M6 10h12M6 14h12' },
  { name: 'cardio', title: 'Cardio & Conditioning', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' }
];

const levelColors = {
  beginner: { start: '#10b981', end: '#06b6d4', label: 'BEGINNER' },
  intermediate: { start: '#06b6d4', end: '#3b82f6', label: 'INTERMEDIATE' },
  advanced: { start: '#f59e0b', end: '#ef4444', label: 'ADVANCED' }
};

levels.forEach(level => {
  const dir = path.join(__dirname, '..', 'frontend', 'public', 'exercises', level);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const col = levelColors[level];
  muscles.forEach(m => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c17"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#04060d"/>
    </linearGradient>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${col.start}"/>
      <stop offset="100%" stop-color="${col.end}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <rect x="20" y="20" width="760" height="410" rx="16" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <circle cx="400" cy="180" r="64" fill="rgba(255,255,255,0.03)" stroke="${col.start}" stroke-width="2" stroke-opacity="0.4"/>
  <g transform="translate(376, 156) scale(2)" fill="none" stroke="url(#grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="${m.icon}"/>
  </g>
  <rect x="330" y="260" width="140" height="26" rx="6" fill="${col.start}" fill-opacity="0.15" stroke="${col.start}" stroke-width="1.2"/>
  <text x="400" y="278" text-anchor="middle" fill="${col.start}" font-family="system-ui, sans-serif" font-size="11" font-weight="900" letter-spacing="1.5">${col.label}</text>
  <text x="400" y="325" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="22" font-weight="800">${m.title}</text>
  <text x="400" y="355" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" font-weight="500">Fit Health Precision Biomechanics &amp; Form Guide</text>
</svg>`;
    fs.writeFileSync(path.join(dir, `${m.name}.svg`), svg);
  });
});

console.log('Successfully generated local SVG assets for all 3 levels and 7 muscle groups!');
