'use strict';

const path = require('node:path');
const { createCanvas, loadImage } = require('canvas');

const ASSETS = path.join(__dirname, '..', 'assets', 'Image');
const asset = (name) => path.join(ASSETS, name);

/** Dibuja el avatar a pantalla completa y encima una imagen PNG de /assets/Image. */
async function avatarWithOverlay(avatarUrl, overlayFile, size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const [avatar, overlay] = await Promise.all([loadImage(avatarUrl), loadImage(asset(overlayFile))]);
  ctx.drawImage(avatar, 0, 0, size, size);
  ctx.drawImage(overlay, 0, 0, size, size);
  return canvas.toBuffer('image/png');
}

module.exports = { asset, avatarWithOverlay, createCanvas, loadImage };
