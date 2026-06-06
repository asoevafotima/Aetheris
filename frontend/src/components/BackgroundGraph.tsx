import { useEffect, useRef } from 'react';
import { createSphereState, drawSphere, type SphereState } from './Sphere3D';

const NODE_LABELS = ['Graph','DP','Greedy','Math','Strings','Trees','BFS','DFS','Sort','Hash','Heap','Binary','Floyd','Dijkstra'];
const CODE_FLOATS = [
  'dp[i][j]','O(n log n)','visited[v]','graph[u].push(v)','while (l < r)',
  'ans = max(ans, x)','sort(a, a+n)','queue<int> q','#include<bits>','return dp[n]',
  'bfs(src)','dfs(v, par)','memo[i] = -1','prefix[i]+=a','push_back(x)','auto& [u,v]',
];

// palette for light mode — 5 vivid accent colors
const LIGHT_PALETTE = ['#6366f1','#06b6d4','#f59e0b','#10b981','#f43f5e'];

const N       = 55;
const EDGE_D  = 230;
const MAX_PKT = 20;

interface Node      { x: number; y: number; vx: number; vy: number; label: string | null; r: number; ci: number }
interface Packet    { fi: number; ti: number; p: number; sp: number; gold: boolean }
interface CodeFloat { text: string; x: number; y: number; vx: number; vy: number; a: number; ta: number; sz: number; ci: number }
interface Streak    { x: number; y: number; len: number; vx: number; life: number }

export function BackgroundGraph({ noSphere = false, light = false }: { noSphere?: boolean; light?: boolean } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let W = 0, H = 0;
    let nodes: Node[] = [];
    let pkts: Packet[] = [];
    let floats: CodeFloat[] = [];
    let streaks: Streak[] = [];
    let sphere: SphereState = createSphereState();

    function init() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;

      nodes = Array.from({ length: N }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        label: i < NODE_LABELS.length ? NODE_LABELS[i] : null,
        r: light ? 3 + Math.random() * 2 : 1.8 + Math.random() * 1.6,
        ci: Math.floor(Math.random() * LIGHT_PALETTE.length),
      }));

      floats = CODE_FLOATS.map((text, i) => ({
        text,
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        a: 0,
        ta: 0.04 + Math.random() * 0.07,
        sz: 10 + Math.floor(Math.random() * 4),
        ci: i % LIGHT_PALETTE.length,
      }));

      pkts = [];
      streaks = [];
      sphere = createSphereState();
    }

    function hexAlpha(hex: string, alpha: number): string {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
    }

    function spawnPkt() {
      if (pkts.length >= MAX_PKT) return;
      for (let t = 0; t < 20; t++) {
        const fi = Math.floor(Math.random() * N);
        const ti = Math.floor(Math.random() * N);
        if (fi === ti) continue;
        const dx = nodes[fi].x - nodes[ti].x;
        const dy = nodes[fi].y - nodes[ti].y;
        if (dx * dx + dy * dy < EDGE_D * EDGE_D) {
          pkts.push({ fi, ti, p: 0, sp: 0.003 + Math.random() * 0.007, gold: Math.random() > 0.6 });
          return;
        }
      }
    }

    function frameDark() {
      const { x: mx, y: my } = mouse.current;
      const pw = (mx - 0.5) * 16;
      const ph = (my - 0.5) * 16;

      ctx.fillStyle = '#04080f';
      ctx.fillRect(0, 0, W, H);

      const g1 = ctx.createRadialGradient(W*0.12-pw*0.4, H*0.38-ph*0.4, 0, W*0.12-pw*0.4, H*0.38-ph*0.4, W*0.42);
      g1.addColorStop(0, 'rgba(29,78,216,0.2)'); g1.addColorStop(1, 'rgba(29,78,216,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
      const g2 = ctx.createRadialGradient(W*0.88-pw*0.25, H*0.55-ph*0.25, 0, W*0.88-pw*0.25, H*0.55-ph*0.25, W*0.35);
      g2.addColorStop(0, 'rgba(245,158,11,0.1)'); g2.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'left';
      for (const f of floats) {
        ctx.font = `${f.sz}px "JetBrains Mono",monospace`;
        ctx.fillStyle = f.ci % 2 === 0
          ? `rgba(251,191,36,${f.a.toFixed(2)})`
          : `rgba(147,197,253,${f.a.toFixed(2)})`;
        ctx.fillText(f.text, f.x + pw * 0.3, f.y + ph * 0.3);
        f.a += (f.ta - f.a) * 0.015; f.x += f.vx; f.y += f.vy;
        if (f.x < -140) f.x = W + 80; if (f.x > W + 140) f.x = -80;
        if (f.y < -20)  f.y = H + 20; if (f.y > H + 20)  f.y = -20;
      }

      for (const s of streaks) {
        const grad = ctx.createLinearGradient(s.x - s.len, s.y, s.x, s.y);
        grad.addColorStop(0, 'rgba(96,165,250,0)');
        grad.addColorStop(1, `rgba(147,197,253,${(0.5 * s.life).toFixed(2)})`);
        ctx.strokeStyle = grad; ctx.lineWidth = 0.85;
        ctx.beginPath(); ctx.moveTo(s.x - s.len, s.y); ctx.lineTo(s.x, s.y); ctx.stroke();
        s.x += s.vx; s.life -= 0.012;
      }
      streaks = streaks.filter(s => s.life > 0 && s.x < W + s.len);
      if (Math.random() < 0.025) streaks.push({ x: -10, y: Math.random() * H, len: 40 + Math.random() * 80, vx: 4.5 + Math.random() * 5, life: 1 });

      const dn = nodes.map(n => ({ x: n.x + pw, y: n.y + ph, label: n.label, r: n.r, ci: n.ci }));
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = dn[i].x - dn[j].x, dy = dn[i].y - dn[j].y, d2 = dx*dx + dy*dy;
          if (d2 < EDGE_D * EDGE_D) {
            const alpha = (1 - Math.sqrt(d2) / EDGE_D) * 0.18;
            ctx.strokeStyle = `rgba(96,165,250,${alpha.toFixed(2)})`; ctx.lineWidth = 0.65;
            ctx.beginPath(); ctx.moveTo(dn[i].x, dn[i].y); ctx.lineTo(dn[j].x, dn[j].y); ctx.stroke();
          }
        }
      }

      for (const pkt of pkts) {
        const f = dn[pkt.fi], t = dn[pkt.ti];
        const x = f.x + (t.x - f.x) * pkt.p, y = f.y + (t.y - f.y) * pkt.p;
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 10);
        halo.addColorStop(0, pkt.gold ? 'rgba(251,191,36,0.8)' : 'rgba(147,197,253,0.8)');
        halo.addColorStop(0.4, pkt.gold ? 'rgba(245,158,11,0.22)' : 'rgba(96,165,250,0.22)');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = pkt.gold ? 'rgba(251,191,36,0.95)' : 'rgba(147,197,253,0.95)';
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();
        pkt.p += pkt.sp;
      }
      pkts = pkts.filter(p => p.p < 1);
      if (Math.random() < 0.07) spawnPkt();

      const GOLD_LABELS = new Set(['DP','Hash','Sort','Greedy','Binary']);
      ctx.font = '10px "JetBrains Mono",monospace'; ctx.textAlign = 'center';
      for (const n of dn) {
        const gold = n.label !== null && GOLD_LABELS.has(n.label);
        const col = gold ? 'rgba(251,191,36,' : 'rgba(147,197,253,';
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r*4);
        ng.addColorStop(0, col+'0.18)'); ng.addColorStop(1, col+'0)');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(n.x, n.y, n.r*4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = col+'0.7)'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx.fill();
        if (n.label) { ctx.fillStyle = col+'0.42)'; ctx.fillText(n.label, n.x, n.y - n.r - 5); }
      }

      if (!noSphere) drawSphere(ctx, W/2, H/2, sphere, mx, my);
    }

    function frameLight() {
      const { x: mx, y: my } = mouse.current;
      const pw = (mx - 0.5) * 10;
      const ph = (my - 0.5) * 10;

      ctx.clearRect(0, 0, W, H);

      // soft pastel blobs — 3 accent orbs
      const orbs = [
        { cx: W*0.15 - pw*0.3, cy: H*0.25 - ph*0.3, r: W*0.38, c: [99,102,241] },
        { cx: W*0.85 - pw*0.2, cy: H*0.65 - ph*0.2, r: W*0.30, c: [6,182,212]  },
        { cx: W*0.50 - pw*0.15,cy: H*0.88 - ph*0.15,r: W*0.25, c: [244,63,94]  },
      ];
      for (const o of orbs) {
        const g = ctx.createRadialGradient(o.cx, o.cy, 0, o.cx, o.cy, o.r);
        g.addColorStop(0, `rgba(${o.c},0.07)`);
        g.addColorStop(1, `rgba(${o.c},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      // displaced node positions
      const dn = nodes.map(n => ({ x: n.x + pw, y: n.y + ph, label: n.label, r: n.r, ci: n.ci }));

      // edges — gradient between two node colors
      ctx.lineWidth = 0.7;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = dn[i].x - dn[j].x, dy = dn[i].y - dn[j].y, d2 = dx*dx + dy*dy;
          if (d2 < EDGE_D * EDGE_D) {
            const dist = Math.sqrt(d2);
            const alpha = (1 - dist / EDGE_D) * 0.22;
            const grad = ctx.createLinearGradient(dn[i].x, dn[i].y, dn[j].x, dn[j].y);
            grad.addColorStop(0, hexAlpha(LIGHT_PALETTE[dn[i].ci], alpha));
            grad.addColorStop(1, hexAlpha(LIGHT_PALETTE[dn[j].ci], alpha));
            ctx.strokeStyle = grad;
            ctx.beginPath(); ctx.moveTo(dn[i].x, dn[i].y); ctx.lineTo(dn[j].x, dn[j].y); ctx.stroke();
          }
        }
      }

      // data packets
      for (const pkt of pkts) {
        const f = dn[pkt.fi], t = dn[pkt.ti];
        const x = f.x + (t.x - f.x) * pkt.p, y = f.y + (t.y - f.y) * pkt.p;
        const col = LIGHT_PALETTE[f.ci];
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 8);
        halo.addColorStop(0, hexAlpha(col, 0.55));
        halo.addColorStop(1, hexAlpha(col, 0));
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = hexAlpha(col, 0.9);
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI*2); ctx.fill();
        pkt.p += pkt.sp;
      }
      pkts = pkts.filter(p => p.p < 1);
      if (Math.random() < 0.06) spawnPkt();

      // nodes — hollow rings with colored glow
      ctx.textAlign = 'center';
      ctx.font = '10px "JetBrains Mono",monospace';
      for (const n of dn) {
        const col = LIGHT_PALETTE[n.ci];
        // outer soft glow
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
        ng.addColorStop(0, hexAlpha(col, 0.12));
        ng.addColorStop(1, hexAlpha(col, 0));
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(n.x, n.y, n.r*5, 0, Math.PI*2); ctx.fill();
        // filled dot
        ctx.fillStyle = hexAlpha(col, 0.7);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx.fill();
        // ring
        ctx.strokeStyle = hexAlpha(col, 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 3, 0, Math.PI*2); ctx.stroke();
        // label
        if (n.label) {
          ctx.fillStyle = hexAlpha(col, 0.5);
          ctx.fillText(n.label, n.x, n.y - n.r - 7);
        }
      }

      // floating code text — colored by palette
      ctx.textAlign = 'left';
      for (const f of floats) {
        ctx.font = `${f.sz}px "JetBrains Mono",monospace`;
        ctx.fillStyle = hexAlpha(LIGHT_PALETTE[f.ci], f.a * 0.45);
        ctx.fillText(f.text, f.x + pw*0.2, f.y + ph*0.2);
        f.a += (f.ta - f.a) * 0.015; f.x += f.vx; f.y += f.vy;
        if (f.x < -140) f.x = W + 80; if (f.x > W+140) f.x = -80;
        if (f.y < -20)  f.y = H + 20; if (f.y > H+20)  f.y = -20;
      }
    }

    function frame() {
      if (light) frameLight(); else frameDark();

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) { n.x = 0; n.vx = Math.abs(n.vx); }
        if (n.x > W) { n.x = W; n.vx = -Math.abs(n.vx); }
        if (n.y < 0) { n.y = 0; n.vy = Math.abs(n.vy); }
        if (n.y > H) { n.y = H; n.vy = -Math.abs(n.vy); }
      }
      raf = requestAnimationFrame(frame);
    }

    init();
    window.addEventListener('resize', init);
    const onMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener('mousemove', onMouse);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [noSphere, light]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
