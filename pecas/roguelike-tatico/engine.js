export const SIZE=7;
export const CLASSES={
 sentinel:{name:'Sentinela',hero:'Iara',hp:24,move:3,range:1,attack:5,jump:2,color:'#f3b472',skill:'Maré de pedra',desc:'6 dano e empurrão. Quedas ou choque: +3.',glyph:'shield'},
 ranger:{name:'Cartógrafa',hero:'Noa',hp:18,move:4,range:3,attack:4,jump:1,color:'#b0d8cc',skill:'Linha do horizonte',desc:'7 dano, alcance 4. A altura amplia alcance.',glyph:'bow'},
 healer:{name:'Vinculadora',hero:'Sol',hp:18,move:4,range:3,attack:3,jump:1,color:'#f0d79c',skill:'Costurar a luz',desc:'Restaura 8 vida de um aliado a até 3 casas.',glyph:'staff'}
};
export const ENCOUNTERS=[
 {name:'O cais esquecido',sub:'Expulse os vigias para abrir a primeira passagem.',enemies:[['walker',4,1],['walker',5,3],['spitter',3,0]]},
 {name:'Jardim de basalto',sub:'As ruínas guardam o caminho até o observatório.',enemies:[['walker',4,1],['walker',5,3],['spitter',3,0],['spitter',6,1]]},
 {name:'A escadaria partida',sub:'A sombra se adensa. Preserve luz para o que vem.',enemies:[['walker',3,1],['walker',5,3],['spitter',5,0],['walker',6,2]]},
 {name:'O coração do eclipse',sub:'Quebre o Astrólito e devolva o horizonte ao arquipélago.',enemies:[['boss',4,1],['spitter',6,2],['walker',3,0]]}
];
export const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export const key=(x,y)=>`${x},${y}`;
export const alive=u=>u.hp>0;
export const team=s=>s.units.filter(u=>u.side==='ally'&&alive(u));
export const foes=s=>s.units.filter(u=>u.side==='enemy'&&alive(u));
export const tile=(s,x,y)=>s.tiles.find(t=>t.x===x&&t.y===y);
export const occupant=(s,x,y)=>s.units.find(u=>alive(u)&&u.x===x&&u.y===y);
const clone=s=>JSON.parse(JSON.stringify(s));
function rng(seed){let n=seed>>>0;return ()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
export function createRun(seed=4107){const s={seed,variant:((seed-4107)%4+4)%4,stage:0,round:1,phase:'player',energy:3,energyMax:5,relics:[],kills:0,totalTurns:0,route:'calm',history:[],tiles:[],units:Object.keys(CLASSES).map((type,i)=>({id:type,type,side:'ally',...CLASSES[type],name:CLASSES[type].hero,maxHp:CLASSES[type].hp,ap:2,shield:0,x:i,y:5}))};startEncounter(s);return s;}
export function startEncounter(s){
 const random=rng(s.seed+s.stage*7919);s.round=1;s.phase='player';s.tiles=[];
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  if((x===0&&y===0)||(x===6&&y===6)||(x===0&&y===1)||(x===5&&y===6))continue;
  const plateau=s.stage===0?(x>=3&&x<=5&&y<=3):s.stage===1?(x>=2&&x<=5&&y>=1&&y<=3):s.stage===2?(x>=3&&y<=4):(x>=2&&x<=5&&y>=1&&y<=4);const summit=s.stage===0?(x===4&&y===1):s.stage===1?(x===3&&y===2):s.stage===2?(x>=4&&y<=2):(x>=3&&x<=4&&y>=2&&y<=3);let h=plateau?2+(summit?1:0):1;const raised=s.variant===1?[[1,2],[4,4]]:s.variant===2?[[1,3],[2,3],[6,3]]:s.variant===3?[[2,3],[4,4]]:[];if(raised.some(([tx,ty])=>tx===x&&ty===y))h=2;if(s.variant===2&&x===5&&y===3)h=1;if(s.variant===3&&x===3&&y===2)h=1;const fragments=s.variant===1?[[1,2],[5,5]]:s.variant===2?[[1,3],[6,3]]:s.variant===3?[[2,3],[4,4]]:[[2,3],[5,4]];
  s.tiles.push({x,y,h,kind:random()<.16?'moss':'stone',fragment:fragments.some(([fx,fy])=>fx===x&&fy===y)});
 }
 const starts=[[1,5],[0,4],[2,5]];
 s.units=s.units.filter(u=>u.side==='ally').map((u,i)=>({...u,x:starts[i][0],y:starts[i][1],ap:alive(u)?2:0,shield:0}));
 ENCOUNTERS[s.stage].enemies.forEach(([type,x,y],i)=>{if(s.variant===1){if(i===0&&type!=='boss'){x++;type='spitter';}if(i===1)y--;}else if(s.variant===2){if(i===0&&type!=='boss')x--;if(i===1)x=Math.min(6,x+1);if(i===2){x--;if(type!=='boss')type='walker';}if(i===3)x--;}else if(s.variant===3){if(i===0&&type!=='boss')y++;if(i===1)y--;if(i===2)y++;}const boss=type==='boss',ranged=type==='spitter';const hp=boss?34:8+s.stage*2+(ranged?0:2)+(s.route==='risk'?2:0);s.units.push({id:`e${s.stage}-${i}`,side:'enemy',type,x,y,hp,maxHp:hp,ap:0,shield:0,name:boss?'Astrólito':ranged?'Olho da sombra':'Vigia oco',move:boss?2:3,range:boss?2:ranged?3:1,attack:boss?6:3+s.stage,jump:2,order:i+1});});
 s.energy=Math.min(s.energyMax,s.energy+(s.stage?2:0));log(s,`${ENCOUNTERS[s.stage].name}. A expedição avança.`);
}
export function reachable(s,u){
 const best=new Map([[key(u.x,u.y),{x:u.x,y:u.y,cost:0,path:[]}]]);const q=[best.get(key(u.x,u.y))];
 while(q.length){q.sort((a,b)=>a.cost-b.cost);const p=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,t=tile(s,x,y),prev=tile(s,p.x,p.y);if(!t||Math.abs(t.h-prev.h)>u.jump)continue;const occ=occupant(s,x,y);if(occ&&occ.id!==u.id&&occ.side!==u.side)continue;const cost=p.cost+1+Math.max(0,t.h-prev.h);if(cost>u.move)continue;const k=key(x,y);if(!best.has(k)||cost<best.get(k).cost){const entry={x,y,cost,path:[...p.path,{x,y}]};best.set(k,entry);q.push(entry);}}}
 return [...best.values()].filter(p=>!occupant(s,p.x,p.y)||occupant(s,p.x,p.y).id===u.id);
}
export function height(s,u){return tile(s,u.x,u.y)?.h||0;}
export function attackRange(s,u,target,mode='attack'){if(mode==='skill'&&u.type==='healer')return 3;const base=mode==='skill'&&u.type==='ranger'?4:u.range;return base+(u.range>1&&height(s,u)>height(s,target)?1:0);}
export function damage(s,u,target,mode='attack'){let n=mode==='skill'?(u.type==='ranger'?7:6):u.attack; if(u.side==='ally')n+=s.relics.filter(r=>r==='edge').length;if(height(s,u)>height(s,target))n++;if(height(s,u)<height(s,target))n=Math.max(1,n-1);return Math.max(0,n-target.shield);}
export function canAttack(s,u,target,mode='attack'){return alive(target)&&target.id!==u.id&&dist(u,target)<=attackRange(s,u,target,mode)&&(u.range>1||Math.abs(height(s,u)-height(s,target))<=2);}
export function pulseTiles(s){if(s.stage!==3&&s.round<4)return [];const n=(s.round+s.stage)%SIZE;return s.tiles.filter(t=>s.round%2?t.x===n:t.y===n);}
export function intent(s,enemy){
 const allies=team(s);if(!allies.length)return null;
 const possibilities=reachable(s,enemy);let best=null;
 for(const p of possibilities)for(const target of allies){const moved={...enemy,x:p.x,y:p.y};const attacks=canAttack(s,moved,target);const guarded=target.shield>0&&dist(enemy,target)<4;const score=(attacks?100:0)-dist(moved,target)*7-target.hp*.2+(guarded?12:0)-p.cost*.5+(height(s,moved)>height(s,target)?2:0);if(!best||score>best.score)best={enemy:enemy.id,target:target.id,x:p.x,y:p.y,damage:attacks?damage(s,moved,target):0,score,path:p.path};}
 return best;
}
export function intents(s){const copy=clone(s),plans=[];for(const e of foes(copy)){const p=intent(copy,e);if(!p)continue;plans.push(p);e.x=p.x;e.y=p.y;const u=copy.units.find(u=>u.id===p.target);if(u&&p.damage)u.hp=Math.max(0,u.hp-p.damage);}return plans;}
export function danger(s,id){if(s.phase!=='player')return 0;const copy=clone(s);return enemyTurn(copy).filter(e=>e.type==='hit'&&e.id===id).reduce((n,e)=>n+e.n,0);}
function log(s,message){s.history.unshift(message);s.history=s.history.slice(0,30);}
function hurt(s,target,n,events){target.hp=Math.max(0,target.hp-n);events.push({type:'hit',id:target.id,n});if(!alive(target)){events.push({type:'death',id:target.id});if(target.side==='enemy')s.kills++;log(s,`${target.name} caiu.`);}}
function status(s){if(!team(s).length){s.phase='defeat';log(s,'A luz da expedição se apagou.');}else if(!foes(s).length){s.phase=s.stage===3?'victory':'reward';log(s,s.phase==='victory'?'O horizonte voltou. O mapa está completo.':'Passagem aberta. Escolha como seguir.');}}
export function validate(s,id,mode,target){
 const u=s.units.find(u=>u.id===id);if(s.phase!=='player')return 'Aguarde sua fase.';if(!u||u.side!=='ally'||!alive(u))return 'Selecione um cartógrafo vivo.';if(u.ap<1)return 'Sem ações. Selecione outro aliado ou termine o turno.';
 if(mode==='guard')return null;if(mode==='skill'&&s.energy<1)return 'Sem luz. Recolha um fragmento ou use o ataque básico.';
 if(mode==='move'){if(!target||!reachable(s,u).some(p=>p.x===target.x&&p.y===target.y&&p.cost>0))return 'Destino fora do alcance ou ocupado.';return null;}
 const v=s.units.find(v=>v.id===target?.id);if(!v)return 'Escolha uma unidade como alvo.';
 if(mode==='skill'&&u.type==='healer'){if(v.side!=='ally'||!alive(v)||dist(u,v)>3)return 'Cure um aliado vivo a até 3 casas.';if(v.hp===v.maxHp)return 'Esse aliado já está com a vida completa.';return null;}
 if(v.side!=='enemy'||!canAttack(s,u,v,mode))return 'Inimigo fora do alcance. Mova-se ou escolha outro alvo.';return null;
}
export function act(s,id,mode,target){const error=validate(s,id,mode,target);if(error)return {ok:false,error,events:[]};const u=s.units.find(u=>u.id===id),events=[];u.ap--;
 if(mode==='move'){const p=reachable(s,u).find(p=>p.x===target.x&&p.y===target.y);const from={x:u.x,y:u.y};u.x=p.x;u.y=p.y;events.push({type:'move',id,from,path:p.path});const t=tile(s,u.x,u.y);if(t.fragment){t.fragment=false;s.energy=Math.min(s.energyMax,s.energy+1);log(s,`${u.name} recolheu um fragmento de luz.`);}log(s,`${u.name} avançou até altura ${t.h}.`);}
 else if(mode==='guard'){u.shield=3+(s.relics.includes('ward')?1:0);u.ap=0;log(s,`${u.name} protegeu sua posição (${u.shield} bloqueio).`);events.push({type:'guard',id});}
 else{if(mode==='skill')s.energy--;const v=s.units.find(v=>v.id===target.id);if(mode==='skill'&&u.type==='healer'){const n=Math.min(v.maxHp-v.hp,8+(s.relics.includes('mend')?3:0));v.hp+=n;events.push({type:'heal',id:v.id,n});log(s,`${u.name} restaurou ${n} vida de ${v.name}.`);}else{const n=damage(s,u,v,mode);hurt(s,v,n,events);log(s,`${u.name} causou ${n} dano em ${v.name}.`);if(mode==='skill'&&u.type==='sentinel'&&alive(v)){const dx=Math.sign(v.x-u.x),dy=dx?0:Math.sign(v.y-u.y),x=v.x+dx,y=v.y+dy,t=tile(s,x,y),occ=occupant(s,x,y);if(!t||occ||height(s,v)-t.h>=2){hurt(s,v,3,events);log(s,'O impacto contra a pedra causou +3 dano.');}else{v.x=x;v.y=y;events.push({type:'push',id:v.id});}}}}
 status(s);return {ok:true,events};}
export function preview(s,id,mode,target){const copy=clone(s);const u=s.units.find(u=>u.id===id),v=s.units.find(u=>u.id===target?.id);const error=validate(s,id,mode,target);if(error)return {ok:false,error};const result=act(copy,id,mode,target);const after=copy.units.find(u=>u.id===id);const beforeHP=v?.hp;const afterHP=copy.units.find(u=>u.id===v?.id)?.hp;
 return {ok:true,mode,damage:beforeHP!=null?beforeHP-afterHP:0,cost:mode==='move'?reachable(s,u).find(p=>p.x===target.x&&p.y===target.y)?.cost:null,height:after?height(copy,after):null,risk:danger(copy,id),kill:v?.side==='enemy'&&afterHP===0,energy:mode==='skill'?1:0,events:result.events};}
export function enemyTurn(s){if(s.phase!=='player')return [];s.phase='enemy';const events=[];s.totalTurns++;
 for(const e of foes(s)){const plan=intent(s,e);if(!plan)continue;const from={x:e.x,y:e.y};e.x=plan.x;e.y=plan.y;if(from.x!==e.x||from.y!==e.y)events.push({type:'move',id:e.id,from,path:plan.path});const target=s.units.find(u=>u.id===plan.target);if(target&&alive(target)&&canAttack(s,e,target)){const n=damage(s,e,target);hurt(s,target,n,events);log(s,`${e.name} atacou ${target.name}: ${n} dano.`);}else log(s,`${e.name} se aproximou de ${target?.name||'sua equipe'}.`);if(!team(s).length)break;}
 for(const u of team(s)){if(pulseTiles(s).some(t=>t.x===u.x&&t.y===u.y)){hurt(s,u,s.stage===3?3:2,events);log(s,`A fratura atingiu ${u.name}.`);}}
 status(s);if(s.phase!=='defeat'&&s.phase!=='victory'&&s.phase!=='reward'){s.round++;if(s.round>=11){for(const u of team(s))hurt(s,u,5,events);log(s,'Eclipse total: a expedição sofre 5 dano por rodada.');status(s);}if(s.phase==='enemy'){s.phase='player';for(const u of team(s)){u.ap=2;u.shield=0;}log(s,`Rodada ${s.round}. Sua equipe age.`);}}
 return events;
}
export const REWARDS=[
 {id:'calm',name:'Poço de luz',route:'Pela margem tranquila',desc:'Toda a equipe recupera 7 vida. +1 luz.',effect:'Recuperar e preservar',icon:'sun'},
 {id:'edge',name:'Cinzel solar',route:'Pelo desfiladeiro',desc:'+1 dano permanente. Próximo encontro: inimigos +2 vida.',effect:'Poder com risco',icon:'blade'},
 {id:'ward',name:'Manto de maré',route:'Pelas ruínas antigas',desc:'+1 bloqueio ao proteger. +1 luz. Recupera 3 vida.',effect:'Resistir e conter',icon:'shield'}
];
export function chooseReward(s,id){if(s.phase!=='reward'||!REWARDS.find(r=>r.id===id))return false;if(id==='calm'){for(const u of s.units.filter(u=>u.side==='ally')){u.hp=Math.min(u.maxHp,u.hp+7);}s.energy=Math.min(s.energyMax,s.energy+1);}else if(id==='ward'){if(!s.relics.includes(id))s.relics.push(id);for(const u of s.units.filter(u=>u.side==='ally'))u.hp=Math.min(u.maxHp,u.hp+3);s.energy=Math.min(s.energyMax,s.energy+1);}else {s.relics.push(id);}
 s.route=id==='edge'?'risk':'calm';s.stage++;startEncounter(s);return true;
}
export function snapshot(s){return clone(s);}
