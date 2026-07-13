const sharp = require('sharp');

const size = 256;
const radius = Math.round(size * 0.20); // 20% border radius
const svgMask = `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`;

sharp('public/faveicon.png')
  .resize(size, size, { fit: 'cover' })
  .composite([{
    input: Buffer.from(svgMask),
    blend: 'dest-in'
  }])
  .png()
  .toFile('public/faveicon_rounded.png')
  .then(info => {
    console.log('Done! Rounded square favicon created:', info);
    const fs = require('fs');
    fs.copyFileSync('public/faveicon_rounded.png', 'public/faveicon.png');
    fs.unlinkSync('public/faveicon_rounded.png');
    console.log('faveicon.png updated successfully!');
  })
  .catch(err => console.error('Error:', err));
