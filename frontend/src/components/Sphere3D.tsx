export interface SphereState {
  sAngle: number;
  tiltX: number;
  tiltY: number;
  points: [number, number, number][];
  edges: [number, number][];
  orbitalAngles: number[];
}

const R = 250;

const ORBITALS: { label: string; color: string; gr: string }[] = [
  { label: 'O(n²)',    color: '#fbbf24', gr: 'rgba(251,191,36,'  },
  { label: 'O(log n)', color: '#93c5fd', gr: 'rgba(147,197,253,' },
  { label: 'BFS',      color: '#6ee7b7', gr: 'rgba(110,231,183,' },
  { label: 'DP',       color: '#fbbf24', gr: 'rgba(251,191,36,'  },
  { label: 'Hash',     color: '#c4b5fd', gr: 'rgba(196,181,253,' },
  { label: 'Sort',     color: '#fbbf24', gr: 'rgba(251,191,36,'  },
  { label: 'DFS',      color: '#6ee7b7', gr: 'rgba(110,231,183,' },
  { label: 'O(1)',     color: '#93c5fd', gr: 'rgba(147,197,253,' },
];

export function createSphereState(): SphereState {
  const pts: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 200; i++) {
    const y = 1 - (i / 199) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = phi * i;
    pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  const thr = 105 / R;
  const edges: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i][0] - pts[j][0];
      const dy = pts[i][1] - pts[j][1];
      const dz = pts[i][2] - pts[j][2];
      if (dx * dx + dy * dy + dz * dz < thr * thr) edges.push([i, j]);
    }
  }
  return {
    sAngle: 0, tiltX: 0, tiltY: 0, points: pts, edges,
    orbitalAngles: ORBITALS.map((_, i) => (i / ORBITALS.length) * Math.PI * 2),
  };
}

function rot(p: [number, number, number], a: number, tX: number, tY: number): [number, number, number] {
  const x1 = p[0] * Math.cos(a) + p[2] * Math.sin(a);
  const z1 = -p[0] * Math.sin(a) + p[2] * Math.cos(a);
  const y1 = p[1];
  const y2 = y1 * Math.cos(tX) - z1 * Math.sin(tX);
  const z2 = y1 * Math.sin(tX) + z1 * Math.cos(tX);
  const x3 = x1 * Math.cos(tY) - y2 * Math.sin(tY);
  const y3 = x1 * Math.sin(tY) + y2 * Math.cos(tY);
  return [x3, y3, z2];
}

export function drawSphere(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  state: SphereState,
  mx: number, my: number,
): void {
  state.tiltX += ((my - 0.5) * 0.55 - state.tiltX) * 0.04;
  state.tiltY += ((mx - 0.5) * 0.38 - state.tiltY) * 0.04;

  const proj = state.points.map(p => {
    const [x, y, z] = rot(p, state.sAngle, state.tiltX, state.tiltY);
    return { sx: cx + x * R, sy: cy + y * R, z };
  });

  // Outer glow
  const gOuter = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R * 2.3);
  gOuter.addColorStop(0,   'rgba(29,78,216,0.24)');
  gOuter.addColorStop(0.4, 'rgba(59,130,246,0.1)');
  gOuter.addColorStop(1,   'rgba(59,130,246,0)');
  ctx.fillStyle = gOuter;
  ctx.beginPath(); ctx.arc(cx, cy, R * 2.3, 0, Math.PI * 2); ctx.fill();

  // Pulsing rings (3 waves)
  const now = Date.now() / 2400;
  for (let ring = 0; ring < 3; ring++) {
    const phase = (now + ring * 0.333) % 1;
    const ringR = R * 0.85 + phase * R * 1.15;
    const alpha = (1 - phase) * 0.2;
    ctx.strokeStyle = `rgba(96,165,250,${alpha.toFixed(3)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke();
  }

  // Edges
  ctx.lineWidth = 0.55;
  for (const [i, j] of state.edges) {
    const depth = ((proj[i].z + proj[j].z) / 2 + 1) / 2;
    ctx.strokeStyle = `rgba(96,165,250,${(0.05 + 0.5 * depth).toFixed(2)})`;
    ctx.beginPath();
    ctx.moveTo(proj[i].sx, proj[i].sy);
    ctx.lineTo(proj[j].sx, proj[j].sy);
    ctx.stroke();
  }

  // Points
  for (const p of proj) {
    const d = (p.z + 1) / 2;
    ctx.fillStyle = `rgba(147,197,253,${(0.1 + 0.9 * d).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(p.sx, p.sy, 0.5 + d * 2.4, 0, Math.PI * 2); ctx.fill();
  }

  // Orbitals
  ctx.textAlign = 'center';
  ctx.font = '11px "JetBrains Mono",monospace';
  for (let i = 0; i < ORBITALS.length; i++) {
    const { label, color, gr } = ORBITALS[i];
    const a = state.orbitalAngles[i];
    const ox = cx + Math.cos(a) * (R + 115);
    const oy = cy + Math.sin(a) * (R * 0.3);

    const halo = ctx.createRadialGradient(ox, oy, 0, ox, oy, 15);
    halo.addColorStop(0, gr + '0.6)');
    halo.addColorStop(0.5, gr + '0.15)');
    halo.addColorStop(1, gr + '0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(ox, oy, 15, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.88;
    ctx.fillText(label, ox, oy - 18);
    ctx.globalAlpha = 1;

    state.orbitalAngles[i] += 0.007;
  }

  state.sAngle += 0.005;
}
