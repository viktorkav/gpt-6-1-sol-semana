// Generated artwork is a render layer. Rules and tactical state stay in engine.js.
const TYPES=['sentinel','ranger','healer','walker','spitter','boss'];
let catalog=null;
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=path=>new URL(path,import.meta.url).href;
const image=(href,x,y,width,height,extra='')=>`<image href="${xml(url(href))}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none" pointer-events="none" ${extra}/>`;
export const ready=()=>catalog?.status==='ready';
export const hasUnit=type=>ready()&&Boolean(catalog.sprites[type]);
export const spriteHeight=type=>hasUnit(type)?catalog.sprites[type].display_height:null;
export async function load(){
 const response=await fetch(new URL('./assets/art/manifest.json',import.meta.url));
 if(!response.ok)throw new Error('Manifesto da arte indisponível.');
 const data=await response.json();
 if(data.status!=='ready')return false;
 if(data.schema_version!==1||TYPES.some(t=>!data.sprites?.[t]?.frames?.idle)||data.backgrounds?.length!==4)throw new Error('Arte incompleta.');
 const paths=new Set();
 for(const sprite of Object.values(data.sprites)){for(const frame of Object.values(sprite.frames))paths.add(frame.src);if(sprite.portrait)paths.add(sprite.portrait);}
 for(const tile of Object.values(data.tiles))paths.add(tile.src);
 for(const item of [...Object.values(data.props),...Object.values(data.rewards)])paths.add(item.src);
 data.backgrounds.forEach(path=>paths.add(path));
 await Promise.all([...paths].map(async path=>{if(!path.startsWith('./assets/art/')||!/^\.\/assets\/art\/[\w/.-]+\.(png|webp|jpg)$/.test(path))throw new Error('Caminho da arte inválido.');const img=new Image();img.src=url(path);await img.decode();}));
 catalog=data;document.body.dataset.art='painted';return true;
}
export function sprite(type,pose='idle'){
 if(!hasUnit(type))return null;
 const unit=catalog.sprites[type],frame=unit.frames[pose]||unit.frames.idle,s=unit.scale;
 const artwork=image(frame.src,-frame.anchor[0]*s,-frame.anchor[1]*s,frame.width*s,frame.height*s,`data-art-frame="${xml(type)}" data-art-pose="${xml(pose)}"`);
 return `<ellipse cx="0" cy="3" rx="${type==='boss'?31:22}" ry="9" fill="#0d252c" opacity=".35"/><g class="unit-body">${artwork}</g><rect class="unit-hit" x="${type==='boss'?-40:-29}" y="${-unit.display_height}" width="${type==='boss'?80:58}" height="${unit.display_height+12}" fill="transparent" pointer-events="all"/>`;
}
export function portrait(type){
 if(!hasUnit(type)||!catalog.sprites[type].portrait)return null;
 return `<img class="painted-portrait" src="${xml(url(catalog.sprites[type].portrait))}" alt="" draggable="false">`;
}
export function background(stage){
 if(!ready())return '';
 const plate=image(catalog.backgrounds[stage],0,0,900,660,'class="painted-background" style="pointer-events:none"').replace('preserveAspectRatio="none"',`preserveAspectRatio="${stage===3?'xMaxYMid':'xMidYMid'} slice"`);
 if(stage!==3)return plate;
 // The fourth paid plate was refused. Compose the received stair painting
 // with the received basalt prop and native eclipse light; retain provenance.
 return `${plate}<g class="eclipse-heart-atmosphere" pointer-events="none"><defs><radialGradient id="heart-glow"><stop stop-color="#f0d597" stop-opacity=".44"/><stop offset=".45" stop-color="#ce9067" stop-opacity=".18"/><stop offset="1" stop-color="#172630" stop-opacity="0"/></radialGradient></defs><rect width="900" height="660" fill="#0b1d2b" opacity=".38"/><ellipse cx="594" cy="40" rx="230" ry="165" fill="url(#heart-glow)"/>${prop('arena-3',92,405,115)}${prop('arena-3',817,365,102)}</g>`;
}
export function tile(t,p,stage){
 if(!ready())return '';
 const key=`${stage}-${t.kind}`,asset=catalog.tiles[key]||catalog.tiles[`${stage}-stone`];if(!asset)return '';
 const id=`art-${stage}-${t.x}-${t.y}`,depth=t.h*22+24,k=depth/asset.native_depth,b=25*(1-k),a=b/48;
 const top='M-48 0L0-25L48 0L0 25Z';
 const left=`M-48 0L0 25V${25+depth}L-48 ${depth}Z`,right=`M0 25L48 0V${depth}L0 ${25+depth}Z`;
 const im=image(asset.src,asset.box[0],asset.box[1],asset.box[2],asset.box[3]);
 return `<g class="painted-terrain" transform="translate(${p.x} ${p.y})" pointer-events="none"><defs><clipPath id="${id}-t"><path d="${top}"/></clipPath><clipPath id="${id}-l"><path d="${left}"/></clipPath><clipPath id="${id}-r"><path d="${right}"/></clipPath></defs><g clip-path="url(#${id}-l)"><g transform="matrix(1 ${a} 0 ${k} 0 ${b})">${im}</g></g><g clip-path="url(#${id}-r)"><g transform="matrix(1 ${-a} 0 ${k} 0 ${b})">${im}</g></g><g clip-path="url(#${id}-t)">${im}</g></g>`;
}
export function prop(key,x,y,height=38){
 const asset=ready()&&catalog.props[key];if(!asset)return '';
 const s=height/asset.reference_height;return image(asset.src,x-asset.anchor[0]*s,y-asset.anchor[1]*s,asset.width*s,asset.height*s,'class="painted-prop"');
}
export function reward(key){const item=ready()&&catalog.rewards[key];return item?`<img class="reward-sprite" src="${xml(url(item.src))}" alt="" draggable="false">`:null;}
export function setPose(element,type,pose){
 if(!hasUnit(type)||!element)return;
 const unit=catalog.sprites[type],frame=unit.frames[pose]||unit.frames.idle,s=unit.scale,node=element.querySelector('[data-art-frame]');if(!node)return;
 for(const [k,v] of Object.entries({href:url(frame.src),x:-frame.anchor[0]*s,y:-frame.anchor[1]*s,width:frame.width*s,height:frame.height*s,'data-art-pose':pose}))node.setAttribute(k,String(v));
}
export function info(){return {ready:ready(),revision:catalog?.revision||null,model:catalog?.model_receipt||null};}
