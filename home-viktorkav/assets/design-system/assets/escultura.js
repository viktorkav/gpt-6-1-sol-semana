/** Esculturas do OBS adaptadas à web. Canvas 2D, uma vista, repouso SVG.
 * Retorna dispose para React/Svelte; não consulta dados nem altera o conteúdo. */
export function pontosDaEscultura(forma = 'orbita', tempo = 12, meridianos = 72, paralelos = 28) {
  const pontos = [];
  const giro = tempo * .12, inclina = .62 + Math.sin(tempo * .09) * .18;
  for (let i = 0; i < meridianos; i++) for (let j = 0; j < paralelos; j++) {
    const u = i / meridianos * Math.PI * 2, v = j / paralelos * Math.PI * 2;
    const dobra = forma === 'dobra' ? .6 : forma === 'volume' ? .22 : .12;
    const raio = 1.45 + Math.cos(v) * .5 + Math.sin(u * 3 + tempo * .2) * dobra;
    const x = raio * Math.cos(u), y = raio * Math.sin(u);
    const z = Math.sin(v) * .58 + Math.sin(u * 2 + tempo * .16) * dobra;
    const rx = x * Math.cos(giro) - y * Math.sin(giro);
    const ry = x * Math.sin(giro) + y * Math.cos(giro);
    pontos.push([rx, ry * Math.cos(inclina) - z * Math.sin(inclina), ry * Math.sin(inclina) + z * Math.cos(inclina)]);
  }
  return pontos.sort((a,b) => a[2]-b[2]);
}

export function montarEscultura(elemento) {
  if (!elemento || elemento.dataset.renderizada) return () => {};
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const movimento = matchMedia('(prefers-reduced-motion: reduce)');
  const pequeno = matchMedia('(max-width: 640px)');
  let visivel = false, quadro = 0, ultimo = 0, vivo = true;
  let largura = 0, altura = 0, palette;
  const origem = performance.now();
  elemento.append(canvas);
  function cores() {
    const css = getComputedStyle(elemento);
    palette = [css.getPropertyValue('--bancada-assinatura-texto').trim() || '#81d3ea', css.getPropertyValue('--bancada-profundidade').trim() || '#9aa9d8', css.getPropertyValue('--bancada-tinta').trim() || '#f2f2f4'];
  }
  function desenhar(tempo = 12) {
    if (!vivo || !largura || !altura) return;
    ctx.clearRect(0,0,largura,altura);
    const escala = Math.min(largura / 5.4, altura / 4.5);
    const pontos = pontosDaEscultura(elemento.dataset.escultura,tempo,pequeno.matches ? 48 : 72,pequeno.matches ? 20 : 28);
    for (let i=0;i<pontos.length;i++) {
      const [x,y,z]=pontos[i], perspectiva=4.5/(4.5-z*.28), luz=(z+2.5)/5;
      ctx.globalAlpha=Math.max(.18,Math.min(1,luz));
      ctx.fillStyle=i%13===0?palette[2]:z<-.4?palette[1]:palette[0];
      const tamanho=(z>0?1.8:1.1)*perspectiva;
      ctx.fillRect(largura*.5+x*escala*perspectiva,altura*.53+y*escala*perspectiva,tamanho,tamanho);
    }
    ctx.globalAlpha=1;
    elemento.dataset.renderizada='sim';
  }
  function animar(agora) {
    if (agora-ultimo>=33) { desenhar(12+(agora-origem)/1000);ultimo=agora; }
    quadro=requestAnimationFrame(animar);
  }
  function sincronizar() {
    cancelAnimationFrame(quadro);quadro=0;
    if (!vivo) return;
    if (visivel && !document.hidden && !movimento.matches && !pequeno.matches) quadro=requestAnimationFrame(animar);
    else desenhar();
    elemento.dataset.movimento=quadro?'ativo':'repouso';
  }
  function dimensionar() {
    const caixa=elemento.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
    largura=caixa.width;altura=caixa.height;
    canvas.width=Math.round(largura*dpr);canvas.height=Math.round(altura*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);desenhar();
  }
  cores();dimensionar();
  const tamanho=new ResizeObserver(dimensionar);tamanho.observe(elemento);
  const vista=new IntersectionObserver(([entry])=>{visivel=entry.isIntersecting;sincronizar();});vista.observe(elemento);
  const tema=new MutationObserver(()=>{cores();desenhar();});
  tema.observe(document.documentElement,{attributes:true,attributeFilter:['data-modo']});
  movimento.addEventListener('change',sincronizar);pequeno.addEventListener('change',sincronizar);
  document.addEventListener('visibilitychange',sincronizar);
  return () => {
    vivo=false;cancelAnimationFrame(quadro);tamanho.disconnect();vista.disconnect();tema.disconnect();
    movimento.removeEventListener('change',sincronizar);pequeno.removeEventListener('change',sincronizar);
    document.removeEventListener('visibilitychange',sincronizar);canvas.remove();
    delete elemento.dataset.renderizada;delete elemento.dataset.movimento;
  };
}

export function iniciarEsculturas(raiz = document) {
  const disposes=[...raiz.querySelectorAll('[data-escultura]')].map(montarEscultura);
  return () => disposes.forEach(dispose=>dispose());
}
