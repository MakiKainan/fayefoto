export interface PersonaVectorAsset {
  id: string;
  name: string;
  category: 'persona' | 'fallen-angels';
  svg: string;
  dataUrl: string;
}

function svgToDataUrl(svgString: string): string {
  const cleanSvg = svgString.replace(/\n/g, '').replace(/\s+/g, ' ');
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
}

// 1. Phantom Mask (Joker's signature winged masquerade mask)
const SVG_PHANTOM_MASK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="120" height="80">
  <defs>
    <filter id="p5-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="3" stdDeviation="1" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>
  <!-- Outer sharp wings -->
  <polygon points="10,25 35,10 60,30 85,10 110,25 105,55 80,68 60,52 40,68 15,55" fill="#E5191C" stroke="#0F0F0F" stroke-width="4" filter="url(#p5-glow)"/>
  <!-- Mask faceplate -->
  <polygon points="15,28 35,14 60,32 85,14 105,28 100,50 78,62 60,48 42,62 20,50" fill="#FDFDFD" stroke="#0F0F0F" stroke-width="3"/>
  <!-- Left Eye Cutout -->
  <polygon points="30,30 46,26 44,40 28,42" fill="#0F0F0F"/>
  <polygon points="33,33 43,30 41,38 31,39" fill="#E5191C"/>
  <!-- Right Eye Cutout -->
  <polygon points="90,30 74,26 76,40 92,42" fill="#0F0F0F"/>
  <polygon points="87,33 77,30 79,38 89,39" fill="#E5191C"/>
  <!-- Nose bridge contour -->
  <polygon points="57,32 63,32 60,44" fill="#0F0F0F"/>
</svg>`;

// 2. Calling Card "Take Your Heart" flame insignia
const SVG_CALLING_CARD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Skewed card base -->
  <polygon points="10,18 90,8 80,88 5,95" fill="#0F0F0F" stroke="#E5191C" stroke-width="4"/>
  <polygon points="14,22 86,13 77,84 10,90" fill="#E5191C"/>
  <!-- Burning flame silhouette -->
  <path d="M50 20 C42 35 30 45 32 60 C34 72 45 78 52 77 C60 76 68 70 66 56 C64 48 58 42 58 35 C58 30 54 24 50 20 Z" fill="#FDFDFD" stroke="#0F0F0F" stroke-width="3"/>
  <!-- Inner flame tongue -->
  <path d="M50 42 C46 50 42 56 44 65 C46 72 52 74 54 73 C58 72 61 68 59 62 C57 56 53 50 50 42 Z" fill="#0F0F0F"/>
  <!-- Star accent -->
  <polygon points="76,28 79,35 86,36 81,41 83,48 76,44 70,48 72,41 67,36 74,35" fill="#FFEA00" stroke="#0F0F0F" stroke-width="2"/>
</svg>`;

// 3. Persona 5 Star (The iconic tilted asymmetric five-point star)
const SVG_PERSONA_STAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Offset shadow -->
  <polygon points="50,6 64,36 96,38 71,60 79,92 50,74 21,92 29,60 4,38 36,36" fill="#000000" transform="translate(4, 5)"/>
  <!-- Outer red border star -->
  <polygon points="50,6 64,36 96,38 71,60 79,92 50,74 21,92 29,60 4,38 36,36" fill="#E5191C" stroke="#FDFDFD" stroke-width="4"/>
  <!-- Inner black core star -->
  <polygon points="50,20 59,42 82,43 64,59 70,82 50,69 30,82 36,59 18,43 41,42" fill="#0F0F0F"/>
  <!-- Center white star -->
  <polygon points="50,32 55,44 67,45 57,54 61,66 50,59 39,66 43,54 33,45 45,44" fill="#FDFDFD"/>
</svg>`;

// 4. All-Out Attack Burst ("FINISH" comic flash)
const SVG_ALL_OUT_ATTACK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 90" width="110" height="90">
  <!-- Jagged comic explosion -->
  <polygon points="55,5 68,28 98,15 88,38 108,52 85,62 92,85 68,75 55,88 42,75 18,85 25,62 2,52 22,38 12,15 42,28" fill="#E5191C" stroke="#0F0F0F" stroke-width="4"/>
  <polygon points="55,14 65,32 88,22 80,40 96,52 78,59 84,77 65,70 55,79 45,70 26,77 32,59 14,52 30,40 22,22 45,32" fill="#FFEA00" stroke="#0F0F0F" stroke-width="2"/>
  <polygon points="55,22 62,35 78,28 72,42 84,52 70,57 74,69 62,63 55,70 48,63 36,69 40,57 26,52 38,42 32,28 48,35" fill="#FDFDFD"/>
  <!-- Lightning flash -->
  <polygon points="62,25 45,50 56,50 44,72 68,44 54,44" fill="#E5191C" stroke="#0F0F0F" stroke-width="2"/>
</svg>`;

// 5. Phantom Dagger
const SVG_PHANTOM_DAGGER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Angled blade -->
  <g transform="rotate(45 50 50)">
    <polygon points="50,10 60,55 50,65 40,55" fill="#FDFDFD" stroke="#0F0F0F" stroke-width="3"/>
    <!-- Blade fuller / bevel -->
    <polygon points="50,15 54,54 50,60" fill="#CCCCCC"/>
    <polygon points="50,15 46,54 50,60" fill="#FFFFFF"/>
    <!-- Crossguard -->
    <polygon points="25,60 75,60 70,68 30,68" fill="#E5191C" stroke="#0F0F0F" stroke-width="3"/>
    <!-- Grip -->
    <rect x="44" y="68" width="12" height="24" fill="#0F0F0F" rx="2"/>
    <!-- Red ribbon wrap -->
    <polygon points="44,72 56,76 56,80 44,76" fill="#E5191C"/>
    <polygon points="44,82 56,86 56,90 44,86" fill="#E5191C"/>
    <!-- Pommel -->
    <polygon points="42,92 58,92 50,98" fill="#FFEA00" stroke="#0F0F0F" stroke-width="2"/>
  </g>
</svg>`;

// 6. Crimson Rose
const SVG_CRIMSON_ROSE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Thorns / Stem -->
  <path d="M50 55 Q45 75 52 95" stroke="#0F0F0F" stroke-width="5" fill="none"/>
  <polygon points="46,68 38,62 48,72" fill="#0F0F0F"/>
  <polygon points="52,78 60,72 50,82" fill="#0F0F0F"/>
  <!-- Outer Petals (Geometric comic style) -->
  <polygon points="25,40 50,18 75,40 70,60 50,68 30,60" fill="#99000A" stroke="#0F0F0F" stroke-width="3"/>
  <polygon points="32,35 50,24 68,35 62,55 50,60 38,55" fill="#E5191C" stroke="#0F0F0F" stroke-width="2"/>
  <!-- Inner Rose Core -->
  <polygon points="40,32 50,28 60,32 58,45 50,48 42,45" fill="#FDFDFD" stroke="#0F0F0F" stroke-width="2"/>
  <polygon points="45,35 50,32 55,35 53,42 50,44 47,42" fill="#E5191C"/>
</svg>`;

// 7. Rebel Skull
const SVG_REBEL_SKULL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Crossbones -->
  <polygon points="12,18 88,82 82,88 6,24" fill="#E5191C" stroke="#0F0F0F" stroke-width="3"/>
  <polygon points="88,18 12,82 18,88 94,24" fill="#E5191C" stroke="#0F0F0F" stroke-width="3"/>
  <!-- Skull Cranium -->
  <polygon points="25,28 40,15 60,15 75,28 78,50 65,58 35,58 22,50" fill="#FDFDFD" stroke="#0F0F0F" stroke-width="4"/>
  <!-- Jaw -->
  <polygon points="35,58 65,58 60,76 40,76" fill="#FDFDFD" stroke="#0F0F0F" stroke-width="3"/>
  <!-- Eye sockets (Angular) -->
  <polygon points="32,36 44,32 42,46 30,48" fill="#0F0F0F"/>
  <polygon points="68,36 56,32 58,46 70,48" fill="#0F0F0F"/>
  <!-- Teeth notches -->
  <line x1="47" y1="64" x2="47" y2="72" stroke="#0F0F0F" stroke-width="2"/>
  <line x1="53" y1="64" x2="53" y2="72" stroke="#0F0F0F" stroke-width="2"/>
</svg>`;

// 8. Morgana / Gentleman Top Hat
const SVG_TOP_HAT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 90" width="100" height="90">
  <g transform="rotate(-8 50 45)">
    <!-- Hat Brim -->
    <ellipse cx="50" cy="72" rx="42" ry="12" fill="#0F0F0F" stroke="#FDFDFD" stroke-width="3"/>
    <!-- Hat Crown -->
    <polygon points="26,70 30,22 70,22 74,70" fill="#0F0F0F" stroke="#FDFDFD" stroke-width="3"/>
    <!-- Top Cap -->
    <ellipse cx="50" cy="22" rx="20" ry="7" fill="#252528" stroke="#FDFDFD" stroke-width="2"/>
    <!-- Crimson Band -->
    <polygon points="27,62 30,52 70,52 73,62" fill="#E5191C" stroke="#0F0F0F" stroke-width="2"/>
    <!-- Gold Buckle -->
    <rect x="44" y="52" width="12" height="10" fill="#FFEA00" stroke="#0F0F0F" stroke-width="2"/>
    <rect x="47" y="54" width="6" height="6" fill="#0F0F0F"/>
  </g>
</svg>`;

// 9. Fallen Angels 35mm Film Clapper
const SVG_FILM_CLAPPER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Body -->
  <polygon points="12,38 88,38 88,88 12,88" fill="#0F0F0F" stroke="#00E676" stroke-width="3"/>
  <rect x="18" y="44" width="64" height="38" fill="#031207" stroke="rgba(0,230,118,0.3)" stroke-width="1.5"/>
  <text x="50" y="62" fill="#00E676" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" text-anchor="middle">FA 1995</text>
  <text x="50" y="74" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="7" text-anchor="middle">TAKE 04</text>
  <!-- Angled Clapper Stick -->
  <g transform="rotate(-12 12 38)">
    <polygon points="12,24 88,24 88,38 12,38" fill="#0F0F0F" stroke="#00E676" stroke-width="3"/>
    <!-- Stripes -->
    <polygon points="20,24 30,24 22,38 12,38" fill="#00E676"/>
    <polygon points="40,24 50,24 42,38 32,38" fill="#00E676"/>
    <polygon points="60,24 70,24 62,38 52,38" fill="#00E676"/>
    <polygon points="80,24 88,24 82,38 72,38" fill="#00E676"/>
  </g>
</svg>`;

// 10. Fallen Angels Neon Cocktail Glass
const SVG_NEON_COCKTAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 100" width="90" height="100">
  <!-- Triangular glass bowl -->
  <polygon points="15,20 75,20 45,60" fill="rgba(0, 230, 118, 0.2)" stroke="#00E676" stroke-width="3.5"/>
  <!-- Liquid -->
  <polygon points="26,35 64,35 45,60" fill="#00E676"/>
  <!-- Stem & Base -->
  <line x1="45" y1="60" x2="45" y2="88" stroke="#00E676" stroke-width="3.5"/>
  <line x1="25" y1="88" x2="65" y2="88" stroke="#00E676" stroke-width="3.5"/>
  <!-- Neon cherry on stick -->
  <line x1="45" y1="20" x2="65" y2="8" stroke="#E5191C" stroke-width="3"/>
  <circle cx="68" cy="8" r="7" fill="#E5191C" stroke="#FFFFFF" stroke-width="2"/>
</svg>`;

// 11. Comic "TAKE YOUR HEART" Speech Bubble
const SVG_TAKE_YOUR_HEART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70" width="120" height="70">
  <polygon points="8,10 112,5 106,52 65,54 55,68 50,55 14,58" fill="#0F0F0F" stroke="#E5191C" stroke-width="3"/>
  <polygon points="12,14 108,10 102,48 18,54" fill="#E5191C"/>
  <text x="60" y="27" fill="#FDFDFD" font-family="'Anton', 'Bebas Neue', 'Impact', sans-serif" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">TAKE YOUR</text>
  <text x="60" y="44" fill="#FFEA00" font-family="'Anton', 'Bebas Neue', 'Impact', sans-serif" font-size="15" font-weight="900" text-anchor="middle" letter-spacing="1.5">HEART!</text>
</svg>`;

// 12. Metaverse Eye
const SVG_METAVERSE_EYE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100" height="80">
  <!-- Diamond eye boundary -->
  <polygon points="10,40 50,15 90,40 50,65" fill="#0F0F0F" stroke="#E5191C" stroke-width="4"/>
  <polygon points="16,40 50,20 84,40 50,60" fill="#E5191C"/>
  <!-- Iris -->
  <circle cx="50" cy="40" r="14" fill="#FDFDFD" stroke="#0F0F0F" stroke-width="3"/>
  <circle cx="50" cy="40" r="8" fill="#0F0F0F"/>
  <polygon points="50,34 53,39 58,40 54,43 55,48 50,45 45,48 46,43 42,40 47,39" fill="#FFEA00"/>
</svg>`;

export const PERSONA_VECTOR_ASSETS: PersonaVectorAsset[] = [
  {
    id: 'phantom-mask',
    name: 'Phantom Mask',
    category: 'persona',
    svg: SVG_PHANTOM_MASK,
    dataUrl: svgToDataUrl(SVG_PHANTOM_MASK),
  },
  {
    id: 'calling-card',
    name: 'Calling Card',
    category: 'persona',
    svg: SVG_CALLING_CARD,
    dataUrl: svgToDataUrl(SVG_CALLING_CARD),
  },
  {
    id: 'persona-star',
    name: 'Persona Star',
    category: 'persona',
    svg: SVG_PERSONA_STAR,
    dataUrl: svgToDataUrl(SVG_PERSONA_STAR),
  },
  {
    id: 'all-out-attack',
    name: 'All-Out Attack',
    category: 'persona',
    svg: SVG_ALL_OUT_ATTACK,
    dataUrl: svgToDataUrl(SVG_ALL_OUT_ATTACK),
  },
  {
    id: 'take-your-heart',
    name: 'Take Your Heart',
    category: 'persona',
    svg: SVG_TAKE_YOUR_HEART,
    dataUrl: svgToDataUrl(SVG_TAKE_YOUR_HEART),
  },
  {
    id: 'phantom-dagger',
    name: 'Phantom Dagger',
    category: 'persona',
    svg: SVG_PHANTOM_DAGGER,
    dataUrl: svgToDataUrl(SVG_PHANTOM_DAGGER),
  },
  {
    id: 'crimson-rose',
    name: 'Crimson Rose',
    category: 'persona',
    svg: SVG_CRIMSON_ROSE,
    dataUrl: svgToDataUrl(SVG_CRIMSON_ROSE),
  },
  {
    id: 'rebel-skull',
    name: 'Rebel Skull',
    category: 'persona',
    svg: SVG_REBEL_SKULL,
    dataUrl: svgToDataUrl(SVG_REBEL_SKULL),
  },
  {
    id: 'top-hat',
    name: 'Mona Hat',
    category: 'persona',
    svg: SVG_TOP_HAT,
    dataUrl: svgToDataUrl(SVG_TOP_HAT),
  },
  {
    id: 'metaverse-eye',
    name: 'Metaverse Eye',
    category: 'persona',
    svg: SVG_METAVERSE_EYE,
    dataUrl: svgToDataUrl(SVG_METAVERSE_EYE),
  },
  {
    id: 'film-clapper',
    name: '35mm Clapper',
    category: 'fallen-angels',
    svg: SVG_FILM_CLAPPER,
    dataUrl: svgToDataUrl(SVG_FILM_CLAPPER),
  },
  {
    id: 'neon-cocktail',
    name: 'Neon Drink',
    category: 'fallen-angels',
    svg: SVG_NEON_COCKTAIL,
    dataUrl: svgToDataUrl(SVG_NEON_COCKTAIL),
  },
];
