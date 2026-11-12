/**
 * Math utilities for the continuous SVG pipeline spine.
 * Computes S-curves, responsive control points, and progress interpolation.
 */

export function generateSpinePath(width, height, nodes = []) {
  if (height <= 0 || width <= 0) return 'M 0 0';

  const isMobile = width <= 768;

  if (isMobile) {
    const railX = 28;
    let d = `M ${railX} 0 L ${railX} ${height}`;

    if (nodes.length > 0) {
      d = `M ${railX} 0`;
      let currentY = 0;
      for (const node of nodes) {
        if (node.y > currentY && node.y < height) {
          d += ` L ${railX} ${node.y - 12}`;
          d += ` Q ${railX} ${node.y} ${railX + 8} ${node.y}`;
          d += ` Q ${railX} ${node.y} ${railX} ${node.y + 12}`;
          currentY = node.y + 12;
        }
      }
      d += ` L ${railX} ${height}`;
    }
    return d;
  }

  const centerX = Math.round(width * 0.18);
  const amplitude = Math.min(width * 0.05, 48);

  if (nodes.length <= 1) {
    const segments = Math.max(4, Math.floor(height / 400));
    const step = height / segments;
    let d = `M ${centerX} 0`;

    for (let i = 0; i < segments; i++) {
      const startY = i * step;
      const endY = (i + 1) * step;
      const midY = (startY + endY) / 2;
      const sign = i % 2 === 0 ? 1 : -1;
      const c1x = centerX + sign * amplitude;
      const c2x = centerX - sign * amplitude;
      d += ` C ${c1x} ${midY - step * 0.25}, ${c2x} ${midY + step * 0.25}, ${centerX} ${endY}`;
    }
    return d;
  }

  let d = `M ${nodes[0].x} 0 L ${nodes[0].x} ${nodes[0].y * 0.5}`;
  let prev = { x: nodes[0].x, y: nodes[0].y * 0.5 };

  for (let i = 0; i < nodes.length; i++) {
    const curr = nodes[i];
    const dy = curr.y - prev.y;
    const c1x = prev.x;
    const c1y = prev.y + dy * 0.5;
    const c2x = curr.x;
    const c2y = curr.y - dy * 0.5;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${curr.x} ${curr.y}`;
    prev = curr;
  }

  d += ` L ${prev.x} ${height}`;
  return d;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function interpolate(a, b, t) {
  return a + (b - a) * t;
}
