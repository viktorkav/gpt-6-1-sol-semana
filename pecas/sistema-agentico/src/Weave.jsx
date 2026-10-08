import { useEffect, useRef } from 'react';

// Original parametric sculpture. Motion describes connected paths, never agent activity.
export default function Weave({ active = 0 }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  const redrawRef = useRef(() => {});
  useEffect(() => { activeRef.current = active; redrawRef.current(); }, [active]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame, width = 0, height = 0, time = 0, visible = true;
    const pointer = {x: 0, y: 0, targetX: 0, targetY: 0};
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if(reduced.matches)draw();
    };
    const move = (e) => { const b = canvas.getBoundingClientRect(); pointer.targetX = (e.clientX-b.left)/b.width-.5; pointer.targetY = (e.clientY-b.top)/b.height-.5; };
    const leave = () => { pointer.targetX = 0; pointer.targetY = 0; };
    const draw = () => {
      if (visible) {
        time += reduced.matches ? 0 : .002;
        pointer.x += (pointer.targetX-pointer.x)*.035;
        pointer.y += (pointer.targetY-pointer.y)*.035;
        ctx.clearRect(0,0,width,height);
        const scale = Math.min(width / 6.9, height / 6.3);
        const rotation = -.38 + (reduced.matches ? 0 : pointer.x*.16 + Math.sin(time)*.045);
        const project = (t, f) => {
          const ring = 1.8 + .53*Math.cos(3*t) + f*.2;
          const x = ring*Math.cos(2*t), y = ring*Math.sin(2*t), z = .9*Math.sin(3*t)+f*.33;
          const xr = x*Math.cos(rotation)-y*Math.sin(rotation);
          const yr = x*Math.sin(rotation)+y*Math.cos(rotation);
          const depth = yr*.58+z*.81;
          return {x:width*.5+xr*scale, y:height*.51+(yr*.62-z*.74)*scale, depth};
        };
        const segments = [];
        for(let strand=0; strand<76; strand++) {
          const f = (strand/75-.5)*2;
          for(let section=0; section<72; section++) {
            const t=section/72*Math.PI*2;
            const points=[];
            for(let k=0;k<=5;k++) points.push(project(t+k/5/72*Math.PI*2,f));
            segments.push({points, depth:points[2].depth, strand, section});
          }
        }
        segments.sort((a,b)=>a.depth-b.depth);
        for (const segment of segments) {
          const light = Math.max(0,Math.min(1,(segment.depth+2)/4));
          const group = Math.floor(segment.section/18);
          const selected = group === activeRef.current;
          ctx.beginPath();
          segment.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
          ctx.strokeStyle = `rgba(${Math.round(64+light*136)},${Math.round(121+light*116)},${Math.round(111+light*98)},${.23+light*.54+(selected?.12:0)})`;
          ctx.lineWidth = .65 + light*.42;
          ctx.stroke();
        }
      }
      if(!reduced.matches)frame = requestAnimationFrame(draw);
    };
    redrawRef.current=()=>{if(reduced.matches)draw();};
    const preferenceChange=()=>{cancelAnimationFrame(frame);draw();};
    reduced.addEventListener('change',preferenceChange);
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    const intersection = new IntersectionObserver(entries=>{visible = entries[0].isIntersecting;if(visible&&reduced.matches)draw();}); intersection.observe(canvas);
    canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);
    resize();draw();
    return () => {cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();reduced.removeEventListener('change',preferenceChange);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);redrawRef.current=()=>{};};
  }, []);
  return <canvas ref={canvasRef} className="weave-canvas" aria-hidden="true" />;
}
