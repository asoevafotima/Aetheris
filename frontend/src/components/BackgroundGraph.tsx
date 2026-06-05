import { useEffect, useRef } from 'react';
import { createSphereState, drawSphere, type SphereState } from './Sphere3D';

const NODE_LABELS = ['Graph','DP','Greedy','Math','Strings','Trees','BFS','DFS','Sort','Hash','Heap','Binary','Floyd','Dijkstra'];
const CODE_FLOATS = [
  'dp[i][j]','O(n log n)','visited[v]','graph[u].push(v)','while (l < r)',
  'ans = max(ans, x)','sort(a, a+n)','queue<int> q','#include<bits>','return dp[n]',
  'bfs(src)','dfs(v, par)','memo[i] = -1','prefix[i]+=a','push_back(x)','auto& [u,v]',
];

interface Node      { x: number; y: number; vx: number; vy: number; label: string | null; r: number }
interface Packet    { fi: number; ti: number; p: number; sp: number; gold: boolean }
interface CodeFloat { text: string; x: number; y: number; vx: number; vy: number; a: number; ta: number; sz: number; gold: boolean }
interface Streak    { x: number; y: number; len: number; vx: number; life: number }

interface Props {
  noSphere?: boolean;
  subtle?: boolean; // reduced opacity/speed for dashboard use
}

export function BackgroundGraph({ noSphere = false, subtle = false }: Props) {
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

    // Tune params based on subtle mode
    const N       = subtle ? 30  : 60;
    const EDGE_D  = subtle ? 200 : 230;
    const MAX_PKT = subtle ? 8   : 25;
    const SPEED   = subtle ? 0.5 : 1.0;
    const EDGE_A  = subtle ? 0.07 : 0.18;    // max edge opacity
    const ORB1_A  = subtle ? 0.08 : 0.20;    // blue orb opacity
    const ORB2_A  = subtle ? 0.05 : 0.10;    // gold orb opacity
    const NODE_A  = subtle ? 0.45 : 0.70;    // node dot opacity
    const HALO_A  = subtle ? 0.10 : 0.18;    // node halo opacity
    const PKT_SP  = subtle ? 0.5  : 1.0;
    const FLOAT_TA_MIN = subtle ? 0.018 : 0.04;
    const FLOAT_TA_MAX = subtle ? 0.035 : 0.08;
    const STREAK_A = subtle ? 0.25 : 0.50;
    const PARALLAX = subtle ? 6 : 16;

    function init() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;

      nodes = Array.from({ length: N }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.33 * SPEED,
        vy: (Math.random() - 0.5) * 0.33 * SPEED,
        label: i < NODE_LABELS.length ? NODE_LABELS[i] : null,
        r: 1.8 + Math.random() * 1.6,
      }));

      floats = CODE_FLOATS.map(text => ({
        text,
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.1 * SPEED,
        vy: (Math.random() - 0.5) * 0.1 * SPEED,
        a: 0,
        ta: FLOAT_TA_MIN + Math.random() * (FLOAT_TA_MAX - FLOAT_TA_MIN),
        sz: 10 + Math.floor(Math.random() * 4),
        gold: Math.random() > 0.55,
      }));

      pkts = [];
      streaks = [];
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
          pkts.push({ fi, ti, p: 0, sp: (0.003 + Math.random() * 0.007) * PKT_SP, gold: Math.random() > 0.6 });
          return;
        }
      }
    }

    function frame() {
      const { x: mx, y: my } = mouse.current;
      const pw = (mx - 0.5) * PARALLAX;
      const ph = (my - 0.5) * PARALLAX;

      ctx.fillStyle = '#04080f';
      ctx.fillRect(0, 0, W, H);

      // Blue orb left
      const g1 = ctx.createRadialGradient(W*0.12-pw*0.4, H*0.38-ph*0.4, 0, W*0.12-pw*0.4, H*0.38-ph*0.4, W*0.42);
      g1.addColorStop(0, `rgba(29,78,216,${ORB1_A})`);
      g1.addColorStop(1, 'rgba(29,78,216,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

      // Gold orb right
      const g2 = ctx.createRadialGradient(W*0.88-pw*0.25, H*0.55-ph*0.25, 0, W*0.88-pw*0.25, H*0.55-ph*0.25, W*0.35);
      g2.addColorStop(0, `rgba(245,158,11,${ORB2_A})`);
      g2.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

      // Floating code text
      ctx.textAlign = 'left';
      for (const f of floats) {
        ctx.font = `${f.sz}px "JetBrains Mono",monospace`;
        ctx.fillStyle = f.gold
          ? `rgba(251,191,36,${f.a.toFixed(3)})`
          : `rgba(147,197,253,${f.a.toFixed(3)})`;
        ctx.fillText(f.text, f.x + pw * 0.3, f.y + ph * 0.3);
        f.a  += (f.ta - f.a) * 0.015;
        f.x  += f.vx;
        f.y  += f.vy;
        if (f.x < -140) f.x = W + 80;
        if (f.x > W + 140) f.x = -80;
        if (f.y < -20)  f.y = H + 20;
        if (f.y > H + 20) f.y = -20;
      }

      // Shooting streaks
      for (const s of streaks) {
        const grad = ctx.createLinearGradient(s.x - s.len, s.y, s.x, s.y);
        grad.addColorStop(0, 'rgba(96,165,250,0)');
        grad.addColorStop(1, `rgba(147,197,253,${(STREAK_A * s.life).toFixed(3)})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(s.x - s.len, s.y);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        s.x    += s.vx * SPEED;
        s.life -= subtle ? 0.008 : 0.012;
      }
      streaks = streaks.filter(s => s.life > 0 && s.x < W + s.len);
      if (Math.random() < (subtle ? 0.012 : 0.025)) {
        streaks.push({
          x: -10,
          y: Math.random() * H,
          len: 40 + Math.random() * 80,
          vx: 4.5 + Math.random() * 5,
          life: 1,
        });
      }

      // Parallax nodes
      const dn = nodes.map(n => ({ x: n.x + pw, y: n.y + ph, label: n.label, r: n.r }));

      // Edges
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = dn[i].x - dn[j].x;
          const dy = dn[i].y - dn[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < EDGE_D * EDGE_D) {
            const alpha = (1 - Math.sqrt(d2) / EDGE_D) * EDGE_A;
            ctx.strokeStyle = `rgba(96,165,250,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(dn[i].x, dn[i].y);
            ctx.lineTo(dn[j].x, dn[j].y);
            ctx.stroke();
          }
        }
      }

      // Packets
      for (const pkt of pkts) {
        const f = dn[pkt.fi], t = dn[pkt.ti];
        const x = f.x + (t.x - f.x) * pkt.p;
        const y = f.y + (t.y - f.y) * pkt.p;
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 10);
        if (pkt.gold) {
          halo.addColorStop(0, 'rgba(251,191,36,0.8)');
          halo.addColorStop(0.4, `rgba(245,158,11,${subtle ? 0.12 : 0.22})`);
        } else {
          halo.addColorStop(0, 'rgba(147,197,253,0.8)');
          halo.addColorStop(0.4, `rgba(96,165,250,${subtle ? 0.12 : 0.22})`);
        }
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = pkt.gold ? `rgba(251,191,36,${subtle ? 0.6 : 0.95})` : `rgba(147,197,253,${subtle ? 0.6 : 0.95})`;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        pkt.p += pkt.sp;
      }
      pkts = pkts.filter(p => p.p < 1);
      if (Math.random() < (subtle ? 0.04 : 0.07)) spawnPkt();

      // Nodes
      const GOLD_LABELS = new Set(['DP','Hash','Sort','Greedy','Binary']);
      ctx.font = '10px "JetBrains Mono",monospace';
      ctx.textAlign = 'center';
      for (const n of dn) {
        const gold = n.label !== null && GOLD_LABELS.has(n.label);
        const col  = gold ? 'rgba(251,191,36,' : 'rgba(147,197,253,';
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        ng.addColorStop(0, col + `${HALO_A})`);
        ng.addColorStop(1, col + '0)');
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col + `${NODE_A})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
        if (n.label) {
          ctx.fillStyle = col + `${subtle ? 0.22 : 0.42})`;
          ctx.fillText(n.label, n.x, n.y - n.r - 5);
        }
      }

      if (!noSphere) drawSphere(ctx, W / 2, H / 2, sphere, mx, my);

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
  }, [noSphere, subtle]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
