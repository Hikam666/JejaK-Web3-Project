const fs = require('fs');

const svg = fs.readFileSync('public/logo.svg', 'utf8');
const match = svg.match(/<path d="([^"]+)"/);
if (!match) throw new Error("No path found");

const d = match[1];
const subpaths = d.split(/(?=M\s)/g);

const circlePath = subpaths[0].trim();
const ribbonPath = subpaths[1].trim();
const shieldPath = subpaths[2].trim();
const starPath = subpaths[3].trim();

const innerSymbols = `${ribbonPath} ${shieldPath} ${starPath}`;

const newSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" fill="none">
  <!-- Dark Circle Emblem Background -->
  <path d="${circlePath}" fill="#0B0F19" />
  <!-- Opaque White Emblem: Ribbon J, Shield & Star -->
  <path d="${innerSymbols}" fill="#FFFFFF" fill-rule="evenodd" />
</svg>`;

fs.writeFileSync('public/logo.svg', newSvg);
fs.writeFileSync('public/jejak-logo.svg', newSvg);
console.log('Successfully rebuilt public/logo.svg and public/jejak-logo.svg with opaque white symbols and dark circle background!');
