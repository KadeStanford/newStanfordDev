// Shared by the WebGL animation and its lightweight, stationary SVG fallback.
export const orbitTilt = { x: .22, y: -.30 };
export function orbitPose(angle, bottom, phase = 0) {
  const theta = angle + phase;
  return { x: 265 * Math.sin(theta), y: 330 * Math.cos(theta), rotation: Math.atan2(-330 * Math.sin(theta), 265 * Math.cos(theta)) + (bottom ? Math.PI : 0) };
}
export function orbitAngles(advances, bottom) {
  const total = advances.reduce((a, b) => a + b, 0);
  let cursor = -total / 2;
  return advances.map(advance => {
    const angle = (cursor + advance / 2) / total * (bottom ? 1.85 : 2.25);
    cursor += advance;
    return bottom ? Math.PI - angle : angle;
  });
}
export function orbitProjection({ x, y, rotation }) {
  const cx = Math.cos(orbitTilt.x), sx = Math.sin(orbitTilt.x);
  const cy = Math.cos(orbitTilt.y), sy = Math.sin(orbitTilt.y);
  const c = Math.cos(rotation), s = Math.sin(rotation);
  return [cy*c, -(sx*sy*c+cx*s), cy*s, cx*c-sx*sy*s, 300+cy*x, 400-(sx*sy*x+cx*y)];
}
