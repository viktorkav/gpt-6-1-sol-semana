import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, Play, Pause, RotateCcw, Check, FileText, Folder, Layers3, ShieldCheck, SlidersHorizontal, X, Download, CircleHelp, Clock3, ChevronRight, Sparkles, Network, ListChecks, AlertTriangle, Send, Eye, CornerDownLeft, Command, BookOpen, CheckCheck } from 'lucide-react';
import HeroScene from './HeroScene.jsx';
import Discovery from './Discovery.jsx';
import { MISSIONS, createState, transition } from './engine.js';

const now = () => new Date().toLocaleTimeString('pt-BR', {hour12:false});
const statusLabels = {ready:'Pronto para delegar',running:'Em movimento',paused:'Missão pausada',awaiting:'Sua decisão',error:'Precisa de contexto',completed:'Missão concluída'};
const agentLabels = {idle:'Aguardando',working:'Trabalhando',done:'Concluído',waiting:'Aguardando você'};
const agentIcons = [BookOpen, Network, FileText, ShieldCheck];
const agentTasks={launch:['Reunir o contexto do briefing','Organizar a sequência do lançamento','Preparar a comunicação','Conferir e consolidar a entrega'],research:['Reunir as referências de exemplo','Estruturar a pergunta de pesquisa','Produzir uma síntese dos sinais','Revisar a recomendação'],recording:['Recuperar e organizar o briefing','Definir a sequência da gravação','Preparar o roteiro do vídeo','Conferir o checklist da entrega']};
const principles = [
  {title:'Contexto',text:'Entende o objetivo e organiza as informações de partida.'},
  {title:'Estratégia',text:'Transforma a intenção em passos que você pode revisar.'},
  {title:'Criação',text:'Materializa o plano em arquivos que você pode abrir.'},
  {title:'Revisão',text:'Confere a entrega e deixa um registro de cada ação.'},
];
function Mark({small=false}) {return <svg className={small?'mark small':'mark'} viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M9 31V9M20 31V9M31 31V9M9 15L31 25M9 25L31 15" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>;}
function Modal({title,onClose,children}) {
  const ref=useRef(null);
  useEffect(()=>{
    const previous=document.activeElement;
    const dialog=ref.current;
    dialog.showModal();
    const handle=(e)=>{if(e.key==='Escape'){e.preventDefault();onClose();}};
    dialog.addEventListener('keydown',handle);
    return()=>{dialog.removeEventListener('keydown',handle);dialog.close();previous?.focus();};
  },[]);
  return <dialog ref={ref} className="modal" onClick={e=>{if(e.target===e.currentTarget)onClose();}} aria-labelledby="modal-title"><div className="modal-head"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Fechar diálogo" onClick={onClose}><X size={20}/></button></div>{children}</dialog>;
}
function download(content,name,type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob([content],{type}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function Environment() {
  const [state,setState]=useState(()=>createState('launch',now()));
  const [view,setView]=useState('plan');
  const [selectedFile,setSelectedFile]=useState(null);
  const [modal,setModal]=useState(null);
  const [instruction,setInstruction]=useState('');
  const [instructionError,setInstructionError]=useState('');
  const [toast,setToast]=useState('');
  const [tab,setTab]=useState('files');
  const mission=MISSIONS.find(m=>m.id===state.missionId);
  const dispatch=(action)=>setState(current=>transition(current,{...action,time:now()}));
  useEffect(()=>{
    if(state.status!=='running'||modal)return;
    const timer=setTimeout(()=>dispatch({type:'TICK'}),1800);
    return()=>clearTimeout(timer);
  },[state.status,state.step,modal]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(timer);},[toast]);
  const artifacts=state.artifacts.filter(a=>!a.reverted);
  const file=state.artifacts.find(a=>a.id===selectedFile&&!a.reverted)||artifacts.at(-1);
  const switchMission=(id)=>{
    if(id===state.missionId)return;
    if(['running','paused','awaiting','error'].includes(state.status))setModal({type:'switch',missionId:id});
    else reset(id);
  };
  const reset=(id)=>{setState(createState(id,now()));setSelectedFile(null);setView('plan');setTab('files');setModal(null);setToast('Ambiente de exemplo preparado.');};
  const openIntervention=()=>{setInstruction(state.instruction||'');setInstructionError('');setModal({type:'intervene'});};
  const applyIntervention=(e)=>{e.preventDefault();if(!instruction.trim()){setInstructionError('Escreva uma orientação antes de aplicar.');return;}dispatch({type:'INTERVENE',instruction:instruction.trim()});setModal(null);setToast('Orientação registrada. Ela será incluída nos próximos artefatos.');};
  const revert=()=>{dispatch({type:'REVERT',artifactId:modal.artifactId});setSelectedFile(null);setModal(null);setToast('Arquivo revertido. O registro continua no histórico.');};
  const tabKeys=(e)=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?'files':e.key==='End'?'activity':tab==='files'?'activity':'files';setTab(next);document.getElementById(next==='files'?'files-tab':'activity-tab')?.focus();};
  return <section id="ambiente" className="environment-section" aria-labelledby="environment-title">
    <div className="section-heading"><div><div className="section-kicker">02 / O ambiente em suas mãos</div><h2 id="environment-title">Abra a missão.<br/>Acompanhe a trama.</h2></div><p>Aqui, o conceito responde aos seus comandos. Escolha uma missão e experimente pausa, decisão e reversão.</p></div>
    <div className="environment" data-status={state.status}>
      <div className="env-topbar"><a className="env-brand" href="#inicio" aria-label="trama, voltar ao início"><Mark small/><span>trama</span></a><div className="workspace-name">Espaço de trabalho <span>/</span> Pessoal</div><span className="simulation-tag"><span/> Simulação local</span><button className="icon-button help-button" aria-label="Sobre a demonstração" onClick={()=>setModal({type:'about'})}><CircleHelp size={17}/></button></div>
      <div className="env-body">
        <aside className="sidebar" aria-label="Missões de exemplo"><div className="sidebar-label">Seu espaço</div><button className={`side-link ${view==='plan'?'active':''}`} onClick={()=>setView('plan')}><Layers3 size={17}/> Missões <span>3</span></button><button className={`side-link ${view==='history'?'active':''}`} onClick={()=>setView('history')}><Clock3 size={17}/> Histórico <span>{state.history.length}</span></button><div className="sidebar-label mission-label">Missões de exemplo</div>{MISSIONS.map((m,i)=><button key={m.id} className={`mission-choice ${state.missionId===m.id?'selected':''}`} onClick={()=>switchMission(m.id)} aria-pressed={state.missionId===m.id}><span className="mission-dot"/>{m.title}<ChevronRight size={14}/></button>)}<div className="sidebar-bottom"><div className="scope-icon"><ShieldCheck size={20}/></div><strong>Você define o limite.</strong><p>Apenas dados de exemplo.<br/>Nenhum acesso ao seu sistema.</p><button onClick={()=>setModal({type:'about'})}>Ver permissões <ArrowUpRight size={13}/></button></div></aside>
        <div className="mission-main">
          <div className="mission-breadcrumb"><span>Missões</span><ChevronRight size={13}/><span>{mission.title}</span><span className="session-label">Sessão de exemplo</span></div>
          <div className="mission-header"><div><div className="status-label" aria-live="polite"><span className={`status-dot ${state.status}`}/>{statusLabels[state.status]}</div><h3>{mission.title}</h3><p>{mission.goal||mission.description}</p></div><button className="icon-button restart" aria-label="Reiniciar missão" onClick={()=>setModal({type:'reset'})}><RotateCcw size={17}/></button></div>
          <div className="mission-controls">
            {state.status==='ready'&&<button className="button dark compact" onClick={()=>dispatch({type:'START'})}><Play size={15} fill="currentColor"/>Delegar missão</button>}
            {state.status==='running'&&<button className="button dark compact" onClick={()=>dispatch({type:'PAUSE'})}><Pause size={15}/>Pausar missão</button>}
            {state.status==='paused'&&<button className="button dark compact" onClick={()=>dispatch({type:'RESUME'})}><Play size={15}/>Retomar missão</button>}
            {state.status==='completed'&&<span className="complete-label"><CheckCheck size={17}/> Entrega pronta para revisar</span>}
            {state.status==='awaiting'&&<span className="awaiting-label"><ShieldCheck size={17}/> A próxima ação depende de você</span>}
            {state.status==='error'&&<span className="error-label"><AlertTriangle size={17}/> Execução interrompida</span>}
            <button className="button secondary compact" onClick={openIntervention} disabled={!['running','paused','awaiting'].includes(state.status)}><SlidersHorizontal size={15}/>Intervir</button>
            <span className="mission-permission"><Eye size={13}/> Supervisão ativa</span>
          </div>
          {view==='plan'?<>
          <div className="plan-heading"><h4><Network size={16}/> Plano da missão</h4><span>{Math.min(state.step,4)} de 4 etapas</span></div>
          <div className="agent-plan">{state.agents.map((agent,i)=>{const Icon=agentIcons[i];return <div className={`agent-row ${agent.status} agent-color-${i}`} key={agent.id}><div className="agent-track"><span className="agent-number">{agent.status==='done'?<Check size={13}/>:String(i+1).padStart(2,'0')}</span>{i<3&&<span className="track-line"/>}</div><div className="agent-glyph"><Icon size={18}/></div><div className="agent-content"><strong>{agent.name}<span> / {agent.role}</span></strong><p>{agentTasks[state.missionId][i]}</p></div><span className="agent-state">{state.status==='paused'&&agent.status==='working'?'Pausado':state.status==='error'&&agent.status==='working'?'Interrompido':agentLabels[agent.status]||agent.status}{agent.status==='working'&&state.status==='running'&&<span className="activity-dots"><i/><i/><i/></span>}</span></div>;})}</div>
          {state.status==='paused'&&<div className="context-note"><Pause size={16}/><div><strong>Um respiro, sem perder o fio.</strong><p>O plano e os arquivos ficam preservados. Retome quando quiser.</p></div></div>}
          {state.status==='awaiting'&&<div className="decision-panel"><div className="decision-title"><span className="decision-symbol"><CornerDownLeft size={18}/></span><div><small>Ponto de decisão</small><h4>Até onde vamos com esta entrega?</h4></div></div><p>Os próximos arquivos vão seguir a sua escolha. Tudo acontece somente nesta simulação.</p><div className="decision-options"><button onClick={()=>dispatch({type:'DECIDE',choice:'draft'})}><FileText size={17}/><strong>Manter em rascunho</strong><span>Organizar para sua revisão</span></button><button onClick={()=>dispatch({type:'DECIDE',choice:'send'})}><Send size={17}/><strong>Preparar envio simulado</strong><span>Gerar pacote, sem enviar nada</span></button></div></div>}
          {state.status==='error'&&<div className="error-panel" role="alert"><AlertTriangle size={20}/><div><h4>Faltou uma peça do contexto.</h4><p>{state.error||'O briefing de gravação não está no conjunto de exemplo.'}</p><button className="button secondary compact" onClick={()=>dispatch({type:'RECOVER'})}>Usar briefing de exemplo <ArrowRight size={15}/></button></div></div>}
          {state.instruction&&<div className="instruction-note"><SlidersHorizontal size={14}/><div><small>Sua orientação</small><p>{state.instruction}</p></div></div>}
          <div className="mission-bottom"><span><ShieldCheck size={14}/> Limite: criar e revisar arquivos de exemplo</span><button onClick={()=>setView('history')}>Ver histórico <ArrowUpRight size={14}/></button></div>
          </>:<div className="history-view"><div className="plan-heading"><h4><Clock3 size={16}/> Histórico desta missão</h4><button onClick={()=>setView('plan')}>Voltar ao plano</button></div><p className="history-intro">Cada mudança deixa um registro. Reverter uma entrega não apaga o que aconteceu.</p><ol className="history-list" tabIndex={0} aria-label="Eventos desta missão">{[...state.history].reverse().map(entry=><li key={entry.id}><span className={`history-bullet ${entry.kind}`}/><time>{entry.time}</time><div><strong>{entry.label}</strong><p>{entry.detail}</p></div></li>)}</ol><button className="button secondary compact" onClick={()=>download(JSON.stringify(state,null,2),'trama-sessao-simulada.json','application/json')}><Download size={14}/> Exportar registro</button></div>}
        </div>
        <aside className="artifact-panel" aria-label="Arquivos e resultados"><div className="artifact-tabs" role="tablist" aria-label="Painel de resultados" onKeyDown={tabKeys}><button id="files-tab" role="tab" tabIndex={tab==='files'?0:-1} aria-selected={tab==='files'} aria-controls="artifact-content" onClick={()=>setTab('files')}><Folder size={15}/>Arquivos <span>{artifacts.length}</span></button><button id="activity-tab" role="tab" tabIndex={tab==='activity'?0:-1} aria-selected={tab==='activity'} aria-controls="artifact-content" onClick={()=>setTab('activity')}>Atividade</button></div>
          <div id="artifact-content" role="tabpanel" aria-labelledby={tab==='files'?'files-tab':'activity-tab'}>
          {tab==='files'?<>{artifacts.length===0?<div className="empty-state"><div className="empty-files"><FileText size={26}/><span/><FileText size={26}/></div><strong>O começo de uma entrega.</strong><p>Ao delegar, os arquivos aparecem aqui. Você pode abrir, baixar e reverter cada um.</p><span className="empty-path">/ missão / resultados</span></div>:<><div className="files-list">{artifacts.map(a=><button key={a.id} className={`file-row ${file?.id===a.id?'selected':''}`} onClick={()=>setSelectedFile(a.id)}><FileText size={16}/><span>{a.name}</span><Check size={13}/></button>)}</div>{file&&<div className="file-preview"><div className="preview-title"><span>Prévia do arquivo</span><span>.{file.name.split('.').at(-1)}</span></div><pre tabIndex={0} aria-label={`Conteúdo de ${file.name}`}>{file.content}</pre><div className="file-actions"><button onClick={()=>{download(file.content,file.name);setToast('Download do arquivo de exemplo iniciado.');}}><Download size={14}/>Baixar</button><button onClick={()=>setModal({type:'revert',artifactId:file.id,name:file.name})}><RotateCcw size={14}/>Reverter</button></div></div>}</>}
          {state.artifacts.some(a=>a.reverted)&&<p className="reverted-note"><RotateCcw size={13}/> {state.artifacts.filter(a=>a.reverted).length} arquivo(s) revertido(s). Registro no histórico.</p>}</>:<div className="activity-list" tabIndex={0} aria-label="Eventos recentes">{[...state.history].reverse().map(entry=><div className="activity-entry" key={entry.id}><span className={`history-bullet ${entry.kind}`}/><strong>{entry.label}</strong><time>{entry.time}</time><p>{entry.detail}</p></div>)}</div>}</div><div className="artifact-footer"><span className="local-dot"/> Dados apenas nesta sessão do navegador</div>
        </aside>
      </div>
      <div className="env-statusbar"><span><span className="local-dot"/> Ambiente isolado de demonstração</span><span>4 agentes simulados <span className="statusbar-separator">/</span> Nenhuma ação externa</span></div>
    </div>
    <p className="demo-disclaimer"><CircleHelp size={14}/> Esta é uma simulação determinística. Os agentes, arquivos e decisões são exemplos locais; nenhum modelo de IA é executado.</p>
    <div className="toast" role="status" aria-live="polite">{toast&&<><Check size={16}/>{toast}</>}</div>
    {modal&&<Modal title={modal.type==='about'?'Um ambiente de possibilidades':modal.type==='intervene'?'Mude o rumo da missão':modal.type==='revert'?'Reverter este arquivo?':modal.type==='switch'?'Começar outra missão?':'Reiniciar esta missão?'} onClose={()=>setModal(null)}>
      {modal.type==='about'&&<div className="about-dialog"><p>trama é um conceito fictício de sistema operacional. Esta demonstração executa um roteiro de estados no seu navegador.</p><div className="permission-row"><Check size={17}/><span>Criar, visualizar e baixar arquivos de exemplo</span></div><div className="permission-row"><Check size={17}/><span>Pausar, intervir e reverter resultados simulados</span></div><div className="permission-row muted"><X size={17}/><span>Sem acesso a contas, pastas ou apps do computador</span></div><div className="permission-row muted"><X size={17}/><span>Sem modelos de IA, envio de mensagens ou publicação</span></div><p className="dialog-note">A sessão é temporária. Para guardar o registro, abra Histórico e exporte o arquivo JSON. Recarregar a página inicia uma sessão vazia.</p><button className="button dark" onClick={()=>setModal(null)}>Entendi</button></div>}
      {modal.type==='intervene'&&<form onSubmit={applyIntervention}><p>A simulação aguarda enquanto este diálogo está aberto. A orientação será anexada aos próximos arquivos para revisão; esta demo não reescreve os textos com IA.</p><label className="input-label" htmlFor="instruction">Sua orientação</label><textarea id="instruction" autoFocus value={instruction} maxLength={300} onChange={e=>{setInstruction(e.target.value);setInstructionError('');}} placeholder="Ex.: deixe a entrega mais concisa e destaque os próximos passos." aria-invalid={!!instructionError} aria-describedby={instructionError?'instruction-error':'instruction-hint'} rows={4}/><div className="input-meta"><span id="instruction-hint">Até 300 caracteres</span><span>{instruction.length}/300</span></div>{instructionError&&<p id="instruction-error" className="form-error" role="alert">{instructionError}</p>}<div className="dialog-actions"><button type="button" className="button secondary" onClick={()=>setModal(null)}>Cancelar</button><button className="button dark" type="submit">Aplicar orientação <Check size={16}/></button></div></form>}
      {modal.type==='revert'&&<><p><strong>{modal.name}</strong> vai sair dos resultados ativos. O histórico preserva a criação e a reversão. Nenhum arquivo real será alterado.</p><div className="dialog-actions"><button className="button secondary" onClick={()=>setModal(null)}>Manter arquivo</button><button className="button dark" onClick={revert}><RotateCcw size={15}/>Reverter arquivo</button></div></>}
      {(modal.type==='switch'||modal.type==='reset')&&<><p>Os arquivos e o histórico desta sessão serão limpos. Você pode cancelar e exportar o registro no Histórico antes de continuar.</p><div className="dialog-actions"><button className="button secondary" onClick={()=>setModal(null)}>Cancelar</button><button className="button dark" onClick={()=>reset(modal.missionId||state.missionId)}>{modal.type==='switch'?'Trocar missão':'Reiniciar'}</button></div></>}
    </Modal>}
  </section>;
}

export default function App(){
  return <><a className="skip-link" href="#ambiente">Pular para a demonstração</a><header className="site-header"><a className="wordmark" href="#inicio" aria-label="trama início"><Mark/><span>trama</span><small>OS</small></a><nav aria-label="Navegação principal"><a href="#ideia">A ideia</a><a href="#ambiente">O ambiente</a><a href="#supervisao">Seu comando</a></nav><a className="header-cta" href="#ambiente">Abrir demonstração <ArrowUpRight size={17}/></a></header>
    <main><section className="hero" id="inicio" aria-labelledby="hero-title"><div className="hero-copy"><div className="concept-label"><span className="concept-label-mark">✳</span> SISTEMA OPERACIONAL AGÊNTICO · CONCEITO FICTÍCIO</div><h1 id="hero-title">Dê uma intenção.<br/><span>Abra uma trama.</span></h1><p>Um lugar onde objetivos conectam agentes, decisões e arquivos.<br className="desktop-break"/> Você dá a direção. O trabalho ganha um caminho.</p><div className="hero-actions"><a className="button dark" href="#ambiente">Entrar no ambiente <ArrowUpRight size={18}/></a><a className="hero-discover" href="#ideia">Descobrir a ideia <ArrowDown size={17}/></a></div></div><HeroScene/><div className="hero-caption"><span>INTENÇÃO → PLANO → SUA DECISÃO → ENTREGA</span><p>Uma proposta de futuro. Uma demonstração local, hoje.</p></div></section>
    <Discovery/>
    <Environment/>
    <section id="supervisao" className="supervision-section" aria-labelledby="supervision-title"><div className="supervision-title"><span className="section-kicker">03 / A autonomia tem contorno</span><h2 id="supervision-title">Mais iniciativa.<br/><em>Seu comando, sempre.</em></h2><p>O plano propõe. O limite é visível. Você decide quando o caminho precisa mudar.</p><a href="#ambiente" className="text-link">Experimente uma decisão <ArrowUpRight size={18}/></a></div><div className="supervision-features"><article><span className="feature-pause"><Pause size={24}/></span><div><small>CONTROLE DE RITMO</small><h3>Um respiro, sem perder o fio.</h3><p>Pause a missão e mantenha contexto e arquivos. Registre uma orientação antes de retomar.</p></div></article><article><span className="feature-history"><Eye size={24}/></span><div><small>VISIBILIDADE DO TRABALHO</small><h3>Cada ação tem um rastro.</h3><p>Abra os resultados e acompanhe cada mudança no histórico da missão.</p></div></article><article><span className="feature-revert"><RotateCcw size={24}/></span><div><small>MEMÓRIA REVERSÍVEL</small><h3>Voltar também é um caminho.</h3><p>Reverta um arquivo simulado. O resultado sai do espaço ativo; o registro permanece.</p></div></article></div></section>
    <section className="closing"><div className="closing-threads" aria-hidden="true"><i/><i/><i/><i/></div><Mark/><span className="section-kicker">SEU PRÓXIMO PASSO</span><h2>O que vamos<br/>colocar em movimento?</h2><a className="button dark" href="#ambiente">Dê o primeiro objetivo <ArrowUpRight size={18}/></a><p>Três missões de exemplo. Nenhuma ação externa.</p></section>
    </main><footer className="site-footer"><a href="#inicio" className="wordmark"><Mark small/><span>trama</span><small>OS</small></a><p>Conceito fictício criado para o experimento ViktorKav.<br/>Demonstração de estados locais. Nenhum OS ou IA real.</p><div><a href="./referencias-revisao.html" target="_blank" rel="noreferrer">Referências <ArrowUpRight size={14}/></a><a href="./revisao.html" target="_blank" rel="noreferrer">Notas desta revisão <ArrowUpRight size={14}/></a><a href="./notas.html" target="_blank" rel="noreferrer">Entrega inicial <ArrowUpRight size={14}/></a></div><span>2026</span></footer></>;
}
