import { useEffect, useId, useRef, useState } from 'react';
import './hero-scene.css';

const AGENTS = [
  {
    id: 'context', name: 'Nora', role: 'Contexto', file: 'briefing-mare.md',
    color: '#355dde', tint: '#eaf0ff',
    description: 'Reúne o público, as referências e os limites que dão direção ao lançamento.',
    artifact: 'Um briefing compartilhado.',
  },
  {
    id: 'strategy', name: 'Caio', role: 'Estratégia', file: 'plano-lancamento.md',
    color: '#d56749', tint: '#faeae4',
    description: 'Organiza o contexto em uma sequência clara de entregas e decisões.',
    artifact: 'Um plano que você pode revisar.',
  },
  {
    id: 'creation', name: 'Lia', role: 'Criação', file: 'comunicacao.md',
    color: '#8b57c4', tint: '#f1eafa',
    description: 'Transforma o plano em uma comunicação concreta para apresentar o Projeto Maré.',
    artifact: 'Um rascunho pronto para abrir.',
  },
  {
    id: 'review', name: 'Ivo', role: 'Revisão', file: 'entrega-revisada.md',
    color: '#2b856f', tint: '#e5f2ec',
    description: 'Confere a clareza da entrega e mostra o que ainda depende da sua escolha.',
    artifact: 'Uma entrega com pendências visíveis.',
  },
];

function AgentGlyph({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {type === 'context' && <><path d="M7 5.5h9.5v13H7z"/><path d="M4.5 8v13h9.5M10 9h4M10 12h4M10 15h2.5"/></>}
    {type === 'strategy' && <><path d="M5.5 17.5 11 12l7.5-7.5M11 12h7.5M11 12v-7.5"/><circle cx="5.5" cy="17.5" r="2"/><circle cx="18.5" cy="4.5" r="2"/><circle cx="18.5" cy="12" r="2"/><circle cx="11" cy="4.5" r="2"/></>}
    {type === 'creation' && <><path d="m7 17 1.2-5.1 8.6-8.6 3.9 3.9-8.6 8.6L7 17Z"/><path d="m15 5 4 4M5 8v12h12"/></>}
    {type === 'review' && <><path d="M12 3 20 6v6c0 4.6-5.2 7.8-8 9-2.8-1.2-8-4.4-8-9V6l8-3Z"/><path d="m8.5 11.8 2.3 2.3 4.7-4.8"/></>}
  </svg>;
}

function FileGlyph() {
  return <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9.5 2H4v12h8V4.5L9.5 2Z"/><path d="M9 2v3h3M6 8h4M6 10.5h4"/></svg>;
}

const DESKTOP_PATHS = {
  context: {
    ribbon: 'M517 151C464 131 455 68 380 72L260 93L269 126L377 107C438 103 446 159 512 186Z',
    fibers: [
      'M514 157C458 136 454 76 380 80L264 101',
      'M514 164C455 143 450 84 379 87L265 108',
      'M514 172C453 152 446 94 378 96L267 117',
    ],
  },
  strategy: {
    ribbon: 'M684 149C758 107 734 31 827 36C884 39 899 72 943 87L926 118C859 92 873 71 825 72C771 70 788 139 688 184Z',
    fibers: [
      'M684 157C759 115 742 40 826 44C877 47 899 81 939 95',
      'M686 165C763 124 750 50 826 54C872 57 895 91 935 103',
      'M687 174C771 131 760 62 826 65C868 68 890 98 931 111',
    ],
  },
  creation: {
    ribbon: 'M519 191C458 206 493 277 409 300C365 312 331 285 283 284L280 319C345 317 365 346 420 330C530 300 496 239 526 226Z',
    fibers: [
      'M520 199C461 216 495 281 413 307C369 320 331 292 282 292',
      'M522 208C471 221 501 288 416 315C372 329 332 302 282 302',
      'M524 217C482 231 511 295 419 324C375 338 334 311 281 311',
    ],
  },
  review: {
    ribbon: 'M686 194C746 208 753 259 828 274C872 283 896 260 941 263L944 298C882 291 876 321 820 309C731 290 726 244 680 228Z',
    fibers: [
      'M685 202C744 216 752 267 826 282C872 291 897 269 942 271',
      'M684 211C739 226 750 277 824 291C872 300 897 279 943 280',
      'M682 220C735 237 749 285 822 300C872 311 897 288 943 290',
    ],
  },
};

const MOBILE_PATHS = {
  context: { ribbon: 'M145 80C121 106 45 82 61 144L85 150C74 111 136 128 160 99Z', fibers: ['M149 84C122 111 54 90 69 145', 'M154 90C126 117 65 98 77 148'] },
  strategy: { ribbon: 'M165 80C199 104 276 78 260 145L236 151C245 110 186 127 151 100Z', fibers: ['M161 85C196 111 268 88 252 147', 'M156 92C191 117 256 98 244 149'] },
  creation: { ribbon: 'M144 91C106 119 151 218 91 249L76 228C111 210 78 119 129 80Z', fibers: ['M140 89C101 119 140 215 86 242', 'M135 85C90 119 129 213 82 235'] },
  review: { ribbon: 'M176 91C214 119 169 218 229 249L244 228C209 210 242 119 191 80Z', fibers: ['M180 89C219 119 180 215 234 242', 'M185 85C230 119 191 213 238 235'] },
};

function RibbonField({ selected, prefix, mobile = false }) {
  const paths = mobile ? MOBILE_PATHS : DESKTOP_PATHS;
  return <svg className={`hs-ribbon-field ${mobile ? 'hs-ribbon-mobile' : 'hs-ribbon-desktop'}`} viewBox={mobile ? '0 0 320 350' : '0 0 1200 360'} preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${prefix}-glass`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".7"/><stop offset="1" stopColor="#d3d3e9" stopOpacity=".11"/></linearGradient>
      {AGENTS.map(agent => <linearGradient key={agent.id} id={`${prefix}-${agent.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={agent.color} stopOpacity=".35"/><stop offset=".48" stopColor={agent.color} stopOpacity=".84"/><stop offset="1" stopColor={agent.color} stopOpacity=".5"/></linearGradient>)}
    </defs>
    {!mobile && <g className="hs-architecture-planes" fill={`url(#${prefix}-glass)`} stroke="#bfc2d8" strokeWidth="1">
      <path d="m351 55 475-24 168 111-475 24Z"/>
      <path d="m240 131 526-72 218 145-526 72Z"/>
      <path d="m254 234 567-89 225 146-567 63Z"/>
      <path d="m254 234 225 120v8l-225-119ZM479 354l567-63v8l-567 63Z" fill="#c9cadb" fillOpacity=".25" stroke="none"/>
      <path d="m351 55 168 111M240 131l218 145" stroke="#fff" strokeOpacity=".8"/>
    </g>}
    {mobile && <g className="hs-architecture-planes" fill={`url(#${prefix}-glass)`} stroke="#c6c6dc" strokeWidth=".6"><path d="m30 108 224-37 48 73-224 35Z"/><path d="m20 204 226-39 50 94-226 41Z"/></g>}
    {AGENTS.map(agent => <g key={agent.id} className={`hs-ribbon ${selected === agent.id ? 'is-selected' : ''}`} data-agent={agent.id}>
      <path className="hs-ribbon-body" d={paths[agent.id].ribbon} fill={`url(#${prefix}-${agent.id})`} stroke={agent.color} strokeOpacity=".35" strokeWidth=".6"/>
      {paths[agent.id].fibers.map((path, index) => <path className="hs-ribbon-fiber" key={path} d={path} fill="none" stroke={index === 1 ? '#fff' : agent.color} strokeWidth={index === 1 ? '.8' : '1.15'} strokeOpacity={index === 1 ? '.6' : '.7'}/>) }
      {mobile && (agent.id === 'creation' || agent.id === 'review') && <path d={agent.id === 'creation' ? 'M146 110C148 134 157 142 157 174V229C157 238 121 244 83 262' : 'M174 110C172 134 163 142 163 174V229C163 238 199 244 237 262'} fill="none" stroke={agent.color} strokeWidth="3" strokeOpacity=".65"/>}
    </g>)}
  </svg>;
}

/** A navigable illustration of the concept, with no execution or connected tools. */
export default function HeroScene() {
  const [selected, setSelected] = useState('context');
  const sceneRef = useRef(null);
  const buttonsRef = useRef([]);
  const instance = useId().replace(/:/g, '');
  const agent = AGENTS.find(item => item.id === selected);
  const inspectionId = `${instance}-inspection`;

  useEffect(() => {
    const scene = sceneRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      scene.style.setProperty('--hs-pan-x', '0px');
      scene.style.setProperty('--hs-pan-y', '0px');
    };
    const move = event => {
      if (!visible || preference.matches || event.pointerType === 'touch') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = scene.getBoundingClientRect();
        scene.style.setProperty('--hs-pan-x', `${((event.clientX - rect.left) / rect.width - .5) * 10}px`);
        scene.style.setProperty('--hs-pan-y', `${((event.clientY - rect.top) / rect.height - .5) * 7}px`);
        frame = 0;
      });
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) reset();
    });
    observer.observe(scene);
    scene.addEventListener('pointermove', move);
    scene.addEventListener('pointerleave', reset);
    preference.addEventListener('change', reset);
    return () => {
      reset();
      observer.disconnect();
      scene.removeEventListener('pointermove', move);
      scene.removeEventListener('pointerleave', reset);
      preference.removeEventListener('change', reset);
    };
  }, []);

  const navigate = (event, index) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? AGENTS.length - 1 : (index + delta + AGENTS.length) % AGENTS.length;
    buttonsRef.current[next]?.focus();
  };

  return <figure className="hero-scene" aria-label="Um objetivo distribuído entre quatro agentes e suas entregas">
    <div className="hs-stage" ref={sceneRef}>
      <RibbonField selected={selected} prefix={`${instance}-desktop`}/>
      <RibbonField selected={selected} prefix={`${instance}-mobile`} mobile/>
      <div className="hs-goal">
        <div className="hs-goal-label"><span className="hs-goal-mark" aria-hidden="true"><i/><i/><i/><i/></span><span>Seu objetivo</span></div>
        <p>Preparar o lançamento<br/> do Projeto Maré</p>
        <span className="hs-human-choice"><span aria-hidden="true"/> Você define o rumo</span>
      </div>
      {AGENTS.map((item, index) => <button
        type="button"
        key={item.id}
        ref={node => { buttonsRef.current[index] = node; }}
        className={`hs-agent hs-agent-${item.id} ${selected === item.id ? 'is-selected' : ''}`}
        style={{ '--agent-color': item.color, '--agent-tint': item.tint }}
        aria-label={`${item.name}, agente de ${item.role}. Inspecionar ${item.file}`}
        aria-pressed={selected === item.id}
        aria-controls={inspectionId}
        onClick={() => setSelected(item.id)}
        onFocus={() => setSelected(item.id)}
        onKeyDown={event => navigate(event, index)}
      >
        <span className="hs-agent-top"><span className="hs-agent-glyph"><AgentGlyph type={item.id}/></span><span className="hs-agent-person"><strong>{item.name}</strong><span>{item.role}</span></span><span className="hs-agent-selection" aria-hidden="true"/></span>
        <span className="hs-agent-file"><FileGlyph/><span>{item.file}</span></span>
      </button>)}
    </div>
    <div className="hs-inspection" id={inspectionId} style={{ '--agent-color': agent.color, '--agent-tint': agent.tint }} role="status" aria-live="polite" aria-atomic="true">
      <div className="hs-inspection-agent"><span className="hs-inspection-dot" aria-hidden="true"/><span><strong>{agent.role}</strong><span>{agent.artifact}</span></span></div>
      <p>{agent.description}</p>
      <div className="hs-inspection-file"><FileGlyph/><span>{agent.file}</span></div>
    </div>
    <figcaption className="hs-caption"><span><span className="hs-concept-symbol" aria-hidden="true"/> Mapa interativo do conceito</span><span>Selecione um agente para explorar.</span></figcaption>
  </figure>;
}
