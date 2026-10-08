// Editorial paths reference real catalog records. No recommendation API or inferred metrics.
export const trails = [
  { id:'ia', label:'IA', theme:'IA', videoId:'01z8l4Qbdx0', nextId:'tutorial-5646941de3',
    question:'A IA tira a edição da fila?',
    premise:'Opus e Higgsfield entram no fluxo de cortes de live. O teste passa pela seleção, pela edição e pela revisão.',
    nextLabel:'Da ideia ao fluxo: Obsidian + Claude Code', action:'Explorar IA' },
  { id:'games', label:'Games', theme:'Games', videoId:'BIaETAJLakA', nextId:'VBklS1ISHO0',
    question:'Como um jogo ensina sem explicar?',
    premise:'Uma primeira viagem por Breath of the Wild, olhando para a liberdade, a descoberta e o design. O vídeo contém spoilers.',
    nextLabel:'Outra investigação: 30 horas em Path of Exile 2', action:'Explorar Games' },
  { id:'construir', label:'Construir', theme:'Na prática', videoId:'c5vXh2HeOiM', nextId:'project-qr-code-generator',
    question:'O que dá para fazer com um agente?',
    premise:'Dez aplicações do Jev no OpenClaw. Um ponto de partida para ver o uso de agentes em tarefas concretas.',
    nextLabel:'Uma ferramenta aberta: QR Code Generator', action:'Explorar na prática' }
];
export function resolveTrail(trail, catalog) {
  const video = catalog.find(item => item.id === trail.videoId);
  const next = catalog.find(item => item.id === trail.nextId);
  if (!video || video.type !== 'video' || !next) throw new Error(`Curadoria inválida: ${trail.id}`);
  return { ...trail, video, next, count:catalog.filter(item => item.theme === trail.theme).length };
}
