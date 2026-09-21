const fs = require('fs');
const svg = fs.readFileSync('public/logo.svg', 'utf8');
const match = svg.match(/<path d="([^"]+)"/);
if (match) {
  const d = match[1];
  const subpaths = d.split(/(?=M\s)/g);
  console.log('Total subpaths:', subpaths.length);
  subpaths.forEach((sp, i) => {
    console.log(i, sp.slice(0, 40) + '... length: ' + sp.length);
  });
}
