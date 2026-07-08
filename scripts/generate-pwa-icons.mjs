import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.resolve(__dirname, '../public/icons')
const svgPath = path.join(iconsDir, 'jobsync-icon.svg')
const svgBuffer = readFileSync(svgPath)

await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'))
await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'))

// Maskable icons need ~20% padding so the safe zone survives platform masking.
const maskableSize = 512
const contentSize = Math.round(maskableSize * 0.6)
const contentBuffer = await sharp(svgBuffer).resize(contentSize, contentSize).png().toBuffer()

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: '#1E3A5F',
  },
})
  .composite([{ input: contentBuffer, gravity: 'center' }])
  .png()
  .toFile(path.join(iconsDir, 'icon-512-maskable.png'))

console.log('Generated icon-192.png, icon-512.png, icon-512-maskable.png')
