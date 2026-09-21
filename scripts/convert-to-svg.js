const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

async function convertImage(srcPath, destPath, options = {}) {
  return new Promise((resolve, reject) => {
    potrace.trace(srcPath, options, (err, svg) => {
      if (err) return reject(err);
      fs.writeFileSync(destPath, svg);
      console.log(`Successfully converted ${srcPath} -> ${destPath} (${svg.length} bytes)`);
      resolve(svg);
    });
  });
}

async function run() {
  try {
    const mapSrc = path.join(__dirname, '../public/indonesia-map.png');
    const mapDest = path.join(__dirname, '../public/indonesia-map.svg');
    // For map: black/dark islands on white background
    await convertImage(mapSrc, mapDest, {
      threshold: 200,
      optTolerance: 0.3,
      turdSize: 3,
      color: '#334155' // Slate-700
    });

    const logoSrc = path.join(__dirname, '../public/logo.png');
    const logoDest = path.join(__dirname, '../public/logo.svg');
    const logoDest2 = path.join(__dirname, '../public/jejak-logo.svg');
    
    // Convert logo
    await convertImage(logoSrc, logoDest, {
      optTolerance: 0.1,
      turdSize: 2
    });
    fs.copyFileSync(logoDest, logoDest2);
    console.log(`Copied logo to ${logoDest2}`);

    console.log('All images converted to SVG successfully!');
  } catch (err) {
    console.error('Error during conversion:', err);
    process.exit(1);
  }
}

run();
