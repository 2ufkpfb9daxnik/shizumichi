import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createPng(width, height, rgbaAt) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = rgbaAt(x, y);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function roundedRectSdf(x, y, size, radius) {
  const qx = Math.abs(x - size / 2) - (size / 2 - radius);
  const qy = Math.abs(y - size / 2) - (size / 2 - radius);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - radius;
}

function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function samplePath(segments, steps = 64) {
  const pts = [];
  for (const seg of segments) {
    for (let i = 0; i <= steps; i++) {
      pts.push(cubic(seg[0], seg[1], seg[2], seg[3], i / steps));
    }
  }
  return pts;
}

function strokeDist(x, y, pts) {
  let min = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((x - ax) * dx + (y - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    min = Math.min(min, dist(x, y, ax + dx * t, ay + dy * t));
  }
  return min;
}

function mapPoint(px, py, origin, scale) {
  return [origin + px * scale, origin + py * scale];
}

function drawIcon(size, { maskable = false, round = true } = {}) {
  const padRatio = maskable ? 0.22 : 0.16;
  const pad = size * padRatio;
  const inner = size - pad * 2;
  const scale = inner / 32;
  const origin = pad;
  const bg = [15, 76, 67];
  const fg = [255, 255, 255];
  const corner = round ? size * (maskable ? 0.22 : 0.22) : 0;

  const valley = samplePath(
    [
      [
        mapPoint(6, 22, origin, scale),
        mapPoint(10, 13, origin, scale),
        mapPoint(14, 9, origin, scale),
        mapPoint(16, 9, origin, scale),
      ],
      [
        mapPoint(16, 9, origin, scale),
        mapPoint(18, 9, origin, scale),
        mapPoint(22, 13, origin, scale),
        mapPoint(26, 22, origin, scale),
      ],
    ],
    48
  );

  const waveA = samplePath(
    [
      [
        mapPoint(22, 11, origin, scale),
        mapPoint(24.2, 12.4, origin, scale),
        mapPoint(25.6, 14.6, origin, scale),
        mapPoint(26.2, 17.4, origin, scale),
      ],
    ],
    24
  );
  const waveB = samplePath(
    [
      [
        mapPoint(24.4, 8.8, origin, scale),
        mapPoint(27.4, 10.8, origin, scale),
        mapPoint(29.4, 14, origin, scale),
        mapPoint(30, 17.6, origin, scale),
      ],
    ],
    24
  );

  const stroke = size * (maskable ? 0.028 : 0.032);
  const waveStroke = size * (maskable ? 0.024 : 0.028);
  const cx = origin + 16 * scale;
  const cy = origin + 9 * scale;
  const cr = 2.2 * scale;

  return createPng(size, size, (x, y) => {
    const sdf = round ? roundedRectSdf(x + 0.5, y + 0.5, size, corner) : -1;
    const aa = 1.1;
    let cover = sdf >= aa ? 0 : sdf <= -aa ? 1 : 0.5 - sdf / (2 * aa);
    if (!round) cover = 1;

    const px = x + 0.5;
    const py = y + 0.5;
    const onValley = strokeDist(px, py, valley) <= stroke;
    const onWaveA = strokeDist(px, py, waveA) <= waveStroke;
    const onWaveB = strokeDist(px, py, waveB) <= waveStroke;
    const onDot = dist(px, py, cx, cy) <= cr;
    const onLogo = onValley || onWaveA || onWaveB || onDot;

    const r = onLogo ? fg[0] : bg[0];
    const g = onLogo ? fg[1] : bg[1];
    const b = onLogo ? fg[2] : bg[2];
    return [r, g, b, Math.round(cover * 255)];
  });
}

const files = {
  "icon-192.png": drawIcon(192),
  "icon-512.png": drawIcon(512),
  "icon-maskable-512.png": drawIcon(512, { maskable: true }),
  "apple-touch-icon.png": drawIcon(180, { round: false }),
};

for (const [name, buf] of Object.entries(files)) {
  writeFileSync(join(outDir, name), buf);
  console.log("wrote", name, buf.length, "bytes");
}
