const fs = require('fs');
const { createCanvas } = require('canvas');

// This script requires installing canvas: npm install canvas
// But we'll use a simpler approach with just Node.js built-in modules

// Create a simple colorful icon using data URIs that we know work
// Let's create proper PNG files using a different method

const createIcon = (size) => {
  // Create a minimal PNG with proper headers
  // For now, let's use a simple solid color square as a test

  const canvas = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad${size})" rx="${size * 0.1875}"/>
    <text x="${size/2}" y="${size * 0.68}" font-family="Arial, sans-serif" font-size="${size * 0.625}" font-weight="bold" text-anchor="middle" fill="white">E</text>
    <path d="M ${size * 0.25} ${size * 0.82} Q ${size * 0.5} ${size * 0.74} ${size * 0.75} ${size * 0.82}" stroke="white" stroke-width="${size * 0.03125}" fill="none" stroke-linecap="round"/>
  </svg>`;

  return canvas;
};

// Save SVG files as backup
fs.writeFileSync('icon16-backup.svg', createIcon(16));
fs.writeFileSync('icon48-backup.svg', createIcon(48));
fs.writeFileSync('icon128-backup.svg', createIcon(128));

console.log('Created backup SVG icons');
