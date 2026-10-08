import http from 'node:http';
import {gzip} from 'node:zlib';
import {promisify} from 'node:util';
const compress=promisify(gzip);
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname);
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  let file=resolve(root,'.'+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+sep))throw new Error('path');
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  let body=await readFile(file);
  const headers={'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Vary':'Accept-Encoding'};
  if(/\b(HTML|CSS|JS|MJS|JSON|SVG)\b/i.test(extname(file).slice(1)) && /\bgzip\b/.test(req.headers['accept-encoding']||'')){
   body=await compress(body);headers['Content-Encoding']='gzip';
  }
  headers['Content-Length']=body.byteLength;
  res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:body);
 }catch {res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end('<!doctype html><html lang="pt-BR"><title>Página não encontrada</title><h1>Página não encontrada</h1><p>Este endereço não faz parte da peça local.</p><a href="/">Voltar à home</a></html>');}
}).listen(port,'127.0.0.1',()=>console.log(`Home local: http://127.0.0.1:${port}`));
