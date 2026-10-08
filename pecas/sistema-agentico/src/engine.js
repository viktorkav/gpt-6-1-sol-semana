const AGENTS = [
  {id:'context',name:'Nora',role:'Contexto'},
  {id:'planner',name:'Caio',role:'Estratégia'},
  {id:'writer',name:'Lia',role:'Criação'},
  {id:'reviewer',name:'Ivo',role:'Revisão'},
];
export const MISSIONS = [
  {id:'launch',title:'Preparar um lançamento',description:'Do briefing a uma comunicação pronta para revisar.',goal:'Preparar a apresentação do Projeto Maré, uma biblioteca de recursos para criadores — exemplo fictício.',agents:AGENTS.map(a=>({...a}))},
  {id:'research',title:'Investigar uma ideia',description:'Organizar referências e transformar sinais em uma recomendação.',goal:'Investigar como o Projeto Maré pode organizar trabalho por objetivos — pesquisa de exemplo com síntese predeterminada.',agents:AGENTS.map(a=>({...a}))},
  {id:'recording',title:'Planejar uma gravação',description:'Recuperar um briefing e entregar um roteiro revisável.',goal:'Planejar um vídeo de apresentação do Projeto Maré com um briefing fictício e recuperação de erro simulada.',agents:AGENTS.map(a=>({...a}))},
];
const stamp = time => typeof time==='string' && /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(time) ? time : '00:00:00';
function event(s,label,detail,kind='info',time){s.sequence++;s.history.push({id:`event-${s.sequence}`,time:stamp(time),label,detail,kind});}
function syncAgents(s){s.agents=s.agents.map((a,i)=>({...a,status:i<s.step?'done':i===s.step?(s.status==='awaiting'?'waiting':['running','paused','error'].includes(s.status)?'working':'idle'):'idle'}));}
export function createState(missionId='launch',time){
 const mission=MISSIONS.find(m=>m.id===missionId)||MISSIONS[0];
 const s={missionId:mission.id,status:'ready',step:0,agents:mission.agents.map(a=>({...a,status:'idle'})),artifacts:[],history:[],decision:null,instruction:'',error:null,sequence:0};
 event(s,'Ambiente preparado','Missão de exemplo carregada. Nenhuma conta, API ou arquivo real está conectado.','info',time); return s;
}
const intro='# Projeto Maré\n\nEXEMPLO FICTÍCIO · SIMULAÇÃO LOCAL\nCenário e entregas predeterminados; nenhum trabalho externo foi executado.\n\n';
function contents(s){
 const instruction=s.instruction?`\n\nInstrução humana registrada: ${s.instruction}\nAplicação nesta simulação: a orientação acompanha o documento para revisão humana.`:'';
 const choice=s.decision==='send'?'Escolha: simular envio. Pacote de comunicação preparado apenas para esta demonstração; nenhum envio real ocorreu.':'Escolha: manter rascunho. Comunicação pronta para revisão humana; nenhum envio real ocorreu.';
 const blocks={
 launch:[
 ['briefing-mare.md','Briefing de exemplo: apresentar uma biblioteca fictícia de referências para criadores. Público: equipes pequenas de conteúdo. Problema: materiais dispersos e contexto perdido. Resultado esperado: uma apresentação clara do propósito, sem prometer funções reais. Tom: direto e acolhedor.'],
 ['plano-lancamento.md','Plano de exemplo\n1. Explicar o problema de referências dispersas.\n2. Apresentar a proposta fictícia do Projeto Maré.\n3. Convidar a equipe a revisar a comunicação.\nDecisão humana: manter o texto como rascunho ou simular seu envio. Nenhum canal está conectado.'],
 ['comunicacao.md','Rascunho de exemplo\nAssunto: Conheça o Projeto Maré\nOlá, equipe. Neste cenário fictício, o Projeto Maré reúne referências, decisões e entregas em torno de objetivos. A proposta é ajudar criadores a retomar o contexto de cada projeto. Revise o conceito e sinalize quais recursos fariam sentido na sua rotina.'],
 ['entrega-revisada.md',`Revisão de exemplo\nClareza: propósito e público descritos.\nEscopo: proposta fictícia; nenhuma disponibilidade comercial afirmada.\nPendência humana: validar público, calendário e canal.\n\n${choice}`],
 ],
 research:[
 ['referencias.md','Fontes de referência, previamente selecionadas; não consultadas durante a execução da demo:\n- Apple, camadas de interface: https://developer.apple.com/videos/play/wwdc2025/219/\n- Anthropic, supervisão de agentes: https://www.anthropic.com/research/trustworthy-agents\n- Perplexity, controle humano: https://www.perplexity.ai/comet/resources\nAs fontes são reais; a síntese abaixo é uma saída fixa do exemplo.'],
 ['plano-pesquisa.md','Plano de exemplo\nPergunta: como tornar delegação compreensível no Projeto Maré?\nEixos: visibilidade da intenção, decisões humanas e artefatos revisáveis.\nMétodo fictício: comparar princípios documentais já selecionados. Limite: nenhuma pesquisa nova ou validação com usuários nesta demo.'],
 ['sintese.md','Síntese predeterminada de exemplo\nHipótese de design: uma missão deve reunir objetivo, plano, decisões e resultados. A supervisão deve mostrar o efeito da escolha. Pausar impede próximos passos; reverter um arquivo preserva o histórico. Estas são inferências de design do cenário fictício, não alegações sobre os produtos citados.'],
 ['recomendacao.md',`Recomendação de exemplo\nPrototipar uma missão pequena com quatro etapas e testar compreensão com criadores antes de ampliar o conceito. Questões abertas: o objetivo fica claro? A decisão humana aparece no momento certo? O arquivo permite revisão?\n\n${choice}`],
 ],
 recording:[
 ['briefing-gravacao.md','Briefing de exemplo recuperado\nTema: apresentar o Projeto Maré, conceito fictício para criadores. Público: pessoas interessadas em organização de trabalho. Formato: explicação com demonstração local. Não usar afirmações de desempenho nem sugerir automação real.'],
 ['plano-gravacao.md','Plano de exemplo\nAbertura: referências espalhadas dificultam retomar contexto.\nDesenvolvimento: mostrar objetivo, quatro etapas e decisão humana.\nFecho: abrir um artefato e explicar a reversão local.\nPreparação humana: revisar texto, cenário e equipamento.'],
 ['roteiro.md','Roteiro de exemplo\n“Imagine reunir referências e decisões ao redor de uma intenção. O Projeto Maré é um conceito fictício para explorar essa ideia. Nesta demonstração, quatro agentes seguem um roteiro predeterminado. Você pode pausar, intervir e revisar arquivos. A decisão muda a saída local; não dispara ações externas.”'],
 ['checklist-gravacao.md',`Checklist de exemplo\n[ ] Revisar a narração e deixar explícita a simulação.\n[ ] Conferir áudio, enquadramento e iluminação manualmente.\n[ ] Mostrar decisão e artefato na captura.\n[ ] Validar fatos antes da gravação real.\n\n${choice}`],
 ],
 };
 const [name,body]=blocks[s.missionId][s.step];return {name,type:'text/markdown',content:intro+body+instruction,reverted:false};
}
export function transition(state,action){
 if(!action||typeof action.type!=='string')return state;
 const {type}=action;
 const valid=type==='START'?state.status==='ready':type==='TICK'?state.status==='running':type==='PAUSE'?state.status==='running':type==='RESUME'?state.status==='paused':type==='DECIDE'?state.status==='awaiting'&&['draft','send'].includes(action.choice):type==='INTERVENE'?['running','paused','awaiting'].includes(state.status)&&typeof action.instruction==='string'&&action.instruction.trim().length>0:type==='RECOVER'?state.status==='error'&&state.missionId==='recording':type==='REVERT'?state.artifacts.some(a=>a.id===action.artifactId&&!a.reverted):false;
 if(!valid)return state;
 const s={...state,agents:state.agents.map(a=>({...a})),artifacts:state.artifacts.map(a=>({...a})),history:state.history.map(h=>({...h}))};
 const log=(label,detail,kind)=>event(s,label,detail,kind,action.time);
 if(type==='START'){s.status='running';log('Missão iniciada','Execução local de exemplo iniciada.');}
 if(type==='PAUSE'){s.status='paused';log('Missão pausada','Próximos avanços suspensos. Os arquivos existentes permanecem disponíveis.');}
 if(type==='RESUME'){s.status='running';log('Missão retomada','A simulação continua na etapa atual.');}
 if(type==='INTERVENE'){s.instruction=action.instruction.trim();log('Instrução registrada',s.instruction,'intervention');}
 if(type==='DECIDE'){s.decision=action.choice;s.status='running';log('Decisão humana',action.choice==='send'?'Simular envio, sem conexão externa.':'Manter entrega como rascunho.','decision');}
 if(type==='REVERT'){s.artifacts.find(a=>a.id===action.artifactId).reverted=true;log('Artefato revertido','Arquivo retirado do resultado ativo; conteúdo e histórico preservados.','revert');}
 if(type==='RECOVER'){s.error=null;s.status='running';log('Briefing de exemplo recuperado','A fonte fictícia ausente foi substituída por um briefing local de exemplo.','recovery');}
 if(type==='TICK'){
  const recovered=s.history.some(h=>h.kind==='recovery');
  if(s.missionId==='recording'&&s.step===0&&!recovered){s.status='error';s.error='Briefing indisponível no cenário de exemplo. Use o briefing local para continuar.';log('Erro simulado',s.error,'error');}
  else{const file=contents(s);s.sequence++;s.artifacts.push({...file,id:`artifact-${s.sequence}`}); const role=s.agents[s.step].role;s.step++;s.status=s.step===2?'awaiting':s.step===4?'completed':'running';log(`${role} concluído`,`${file.name} criado nesta simulação.`);if(s.status==='awaiting')log('Decisão necessária','Escolha manter rascunho ou simular envio.','decision');if(s.status==='completed')log('Missão concluída','Entregas de exemplo disponíveis para revisão. Nenhuma ação externa foi executada.','complete');}
 }
 syncAgents(s);return s;
}
