import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#3B0A18" />
      <stop offset="60%" stop-color="#151316" />
      <stop offset="100%" stop-color="#0B0B0D" />
    </radialGradient>
    <linearGradient id="maroonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#922D48" />
      <stop offset="50%" stop-color="#6D1028" />
      <stop offset="100%" stop-color="#3B0A18" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)" />
  <rect x="16" y="16" width="480" height="480" rx="90" fill="none" stroke="#30262B" stroke-width="4" />
  
  <!-- Outer Ring with 214 tick -->
  <circle cx="256" cy="230" r="140" fill="none" stroke="#30262B" stroke-width="12" />
  <circle cx="256" cy="230" r="140" fill="none" stroke="url(#maroonGrad)" stroke-width="12" stroke-dasharray="660 880" stroke-linecap="round" transform="rotate(-90 256 230)" />
  
  <!-- Emblem Center -->
  <path d="M256 130 L320 250 L285 250 L256 195 L227 250 L192 250 Z" fill="url(#maroonGrad)" />
  <path d="M210 265 L302 265 L290 288 L222 288 Z" fill="#F4F0F1" />
  <circle cx="256" cy="230" r="18" fill="#F4F0F1" />
  
  <!-- Text Brand -->
  <text x="256" y="405" font-family="'Cairo', sans-serif" font-weight="900" font-size="44" fill="#F4F0F1" text-anchor="middle" letter-spacing="4">ABSKA</text>
  <text x="256" y="445" font-family="'Tajawal', sans-serif" font-weight="700" font-size="22" fill="#922D48" text-anchor="middle" letter-spacing="3">214 • التحوّل الشامل</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

// Function to generate raw PNG buffer
function createPNG(width, height, rBg = 11, gBg = 11, bBg = 13, rCenter = 109, gCenter = 16, bCenter = 40) {
  // 1 scanline filter byte (0) per row, then width * 4 bytes RGBA
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter byte None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if inside circle ring or center
      const inRing = dist >= radius - 8 && dist <= radius + 8;
      const inCenter = dist < radius * 0.45;

      if (inRing || inCenter) {
        rawData[pxOffset] = rCenter;
        rawData[pxOffset + 1] = gCenter;
        rawData[pxOffset + 2] = bCenter;
        rawData[pxOffset + 3] = 255;
      } else {
        // Subtle gradient background
        const factor = 1 - Math.min(dist / (width * 0.7), 1);
        rawData[pxOffset] = Math.min(255, Math.floor(rBg + factor * 25));
        rawData[pxOffset + 1] = Math.min(255, Math.floor(gBg + factor * 5));
        rawData[pxOffset + 2] = Math.min(255, Math.floor(bBg + factor * 10));
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG chunks
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    // calculate crc32
    let c = 0xffffffff;
    const combined = Buffer.concat([typeBuf, data]);
    for (let i = 0; i < combined.length; i++) {
      c ^= combined[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    c ^= 0xffffffff;
    crcBuf.writeInt32BE(c, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate PNGs
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 11, 11, 13, 146, 45, 72));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(32, 32));

// Generate manifest.webmanifest
const manifest = {
  id: "/",
  name: "ABSKA — 214 التحوّل الشامل",
  short_name: "ABSKA 214",
  description: "نظام شخصي متكامل لإحداث تحوّل شامل في الحياة خلال 214 يومًا مع تخزين دائم وعمل دون إنترنت.",
  theme_color: "#0B0B0D",
  background_color: "#0B0B0D",
  display: "standalone",
  orientation: "portrait",
  dir: "rtl",
  lang: "ar",
  start_url: "/",
  scope: "/",
  icons: [
    {
      src: "/pwa-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/pwa-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/pwa-maskable-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable"
    }
  ]
};

fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2), 'utf-8');
console.log('PWA Assets Generated Successfully.');
