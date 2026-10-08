import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, BookOpen, Network, FileText, ShieldCheck, CornerDownLeft, RotateCcw, Check } from 'lucide-react';

const chapters = [
  {title:'O ponto de partida é o que você quer.',label:'Intenção',text:'Em vez de transportar o trabalho entre apps, reúna o contexto em um objetivo. O plano mostra os papéis e os arquivos que cada etapa vai produzir.'},
  {title:'Cada agente tem um lugar na trama.',label:'Execução',text:'Contexto, estratégia, criação e revisão têm cores próprias. O trabalho ganha forma em documentos legíveis, com a origem de cada resultado à vista.'},
  {title:'Há caminhos que só você pode abrir.',label:'Intervenção',text:'A decisão humana interrompe o avanço. Escolha o próximo passo, pause o ritmo ou registre uma orientação antes de continuar.'},
  {title:'Um resultado não precisa ser definitivo.',label:'Memória',text:'Abra o arquivo, baixe uma cópia e reverta a entrega. Ela sai dos resultados ativos, mas a criação e a reversão continuam no histórico.'},
];
const roles = [ ['Nora','Contexto',BookOpen], ['Caio','Estratégia',Network], ['Lia','Criação',FileText], ['Ivo','Revisão',ShieldCheck] ];

export default function Discovery() {
  const [stage,setStage]=useState(0);
  const refs=useRef([]);
  useEffect(()=>{
    let frame=0;
    const update=()=>{frame=0;let next=0;refs.current.forEach((node,i)=>{if(node && node.getBoundingClientRect().top<innerHeight*.56) next=i;});setStage(next);};
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);update();
    return()=>{window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);cancelAnimationFrame(frame);};
  },[]);
  return <section id="ideia" className="discovery" aria-labelledby="discovery-title">
    <div className="discovery-heading"><span className="section-kicker">01 / Uma nova unidade de trabalho</span><h2 id="discovery-title">O desktop vira<br/><em>um lugar de intenção.</em></h2><p>Uma proposta de sistema operacional pensado para delegar objetivos com supervisão. Veja como o trabalho muda de lugar.</p></div>
    <div className="work-unit"><div><small>ENTRE APLICATIVOS</small><p>Abrir <span>→</span> copiar <span>→</span> trocar <span>→</span> conferir</p><span>Você transporta o trabalho a cada etapa.</span></div><ArrowRight size={23} aria-hidden="true"/><div><small>EM TORNO DE UMA INTENÇÃO</small><p>Objetivo <span>→</span> plano <span>→</span> sua decisão <span>→</span> entrega</p><span>Agentes e arquivos compartilham um contexto.</span></div></div>
    <div className="discovery-layout">
      <div className="discovery-chapters">{chapters.map((c,i)=><article className={`discovery-chapter ${stage===i?'is-current':''}`} id={`conceito-${i+1}`} key={c.label} ref={el=>refs.current[i]=el}><span className="chapter-number">0{i+1} <span>{c.label}</span></span><h3>{c.title}</h3><p>{c.text}</p>{i===3?<a className="text-link" href="#ambiente">Experimente o caminho completo <ArrowRight size={18}/></a>:<a className="chapter-next" href={`#conceito-${i+2}`} aria-label={`Próximo: ${chapters[i+1].label}`}><ArrowDown size={18}/></a>}</article>)}</div>
      <div className="discovery-stage" data-stage={stage}>
        <div className="concept-topline"><span className="concept-window-dots"><i/><i/><i/></span><span>Uma intenção em quatro momentos</span><span>CONCEITO</span></div>
        <div className="concept-space" aria-hidden="true">
          <div className="concept-orbit orbit-one"/><div className="concept-orbit orbit-two"/>
          <div className="concept-goal"><span className="concept-goal-mark">↗</span><small>INTENÇÃO</small><strong>Preparar um lançamento</strong><span>Projeto Maré · exemplo fictício</span></div>
          <div className="concept-agent-rail">{roles.map(([name,role,Icon],i)=><div className={`concept-agent agent-color-${i}`} key={name}><span><Icon size={20}/></span><strong>{name}</strong><small>{role}</small><div className="concept-agent-line"/></div>)}</div>
          <div className="concept-output"><FileText size={22}/><div><small>RESULTADO LOCAL</small><strong>comunicacao.md</strong><p>Documento para abrir e revisar.</p></div><Check size={18}/></div>
          <div className="concept-decision"><CornerDownLeft size={24}/><div><small>AUTONOMIA ENCONTRA UM LIMITE</small><strong>Sua decisão abre o próximo passo.</strong><span>Rascunho ou pacote simulado?</span></div></div>
          <div className="concept-memory"><RotateCcw size={21}/><div><strong>Arquivo revertido</strong><span>O histórico preserva o caminho.</span></div><span className="memory-line"/></div>
        </div>
        <nav className="concept-navigation" aria-label="Momentos do conceito">{chapters.map((c,i)=><a href={`#conceito-${i+1}`} key={c.label} aria-current={stage===i?'step':undefined}><span>0{i+1}</span>{c.label}</a>)}</nav>
        <p className="concept-disclaimer">Ilustração do conceito. A simulação operável está logo abaixo.</p>
      </div>
    </div>
  </section>;
}
