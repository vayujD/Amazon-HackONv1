import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512
};

async function generateFavicons() {
  const svgPath = path.join(__dirname, '../public/favicon.svg');
  const outputDir = path.join(__dirname, '../public');

  // Read the SVG file
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate each size
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, filename));
    
    console.log(`Generated ${filename}`);
  }
}

generateFavicons().catch(console.error); 