import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('./',import.meta.url));
const seed=()=>[{id:'t1',title:'Preparar revisão acessível',status:'todo',updatedAt:1},{id:'t2',title:'Medir a primeira navegação',status:'doing',updatedAt:1}];
export function createFixtureServer(){
  let tasks=seed(),counter=2;
  return createServer(async(req,res)=>{
    const url=new URL(req.url,'http://127.0.0.1');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
    const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
    try{
      if(url.pathname==='/health'){send(200,{ok:true});return;}
      if(url.pathname.startsWith('/api/')){
        if(req.headers.origin&&req.headers.origin!==`http://127.0.0.1:${req.socket.localPort}`){send(403,{error:'Origin denied'});return;}
        if(req.method==='GET'&&url.pathname==='/api/tasks'){
          const board=url.searchParams.get('board')||'all';
          if(board==='slow')await new Promise(resolve=>setTimeout(resolve,700));
          if(board==='error'){send(503,{error:'Fixture unavailable'});return;}
          send(200,board==='empty'?[]:tasks);return;
        }
        if(['POST','PATCH'].includes(req.method)){
          if(req.headers['content-type']!=='application/json'){send(415,{error:'JSON required'});return;}
          let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>4096){send(413,{error:'Too large'});return;}}
          let body;try{body=JSON.parse(data);}catch{send(400,{error:'Invalid JSON'});return;}
          if(req.method==='POST'&&url.pathname==='/api/tasks'){
            if(!body||typeof body.title!=='string'||!body.title.trim()||body.title.length>120){send(400,{error:'Invalid title'});return;}
            const task={id:'t'+ ++counter,title:body.title.trim(),status:'todo',updatedAt:Date.now()};tasks.push(task);send(201,task);return;
          }
          if(req.method==='PATCH'&&/^\/api\/tasks\/[^/]+$/.test(url.pathname)){
            const task=tasks.find(t=>t.id===decodeURIComponent(url.pathname.split('/').at(-1)));
            if(!task){send(404,{error:'Not found'});return;}
            if(!body||!['todo','doing','done'].includes(body.status)){send(400,{error:'Invalid status'});return;}
            task.status=body.status;task.updatedAt=Date.now();send(200,task);return;
          }
        }
        send(404,{error:'Not found'});return;
      }
      const allowed=new Map([['/','index.html'],['/index.html','index.html'],['/style.css','style.css'],['/dist/app.js','dist/app.js'],['/dist/model.mjs','src/model.mjs'],['/dist/storage.mjs','src/storage.mjs'],['/node_modules/web-vitals/dist/web-vitals.js','node_modules/web-vitals/dist/web-vitals.js']]);
      allowed.set('/sw.js','sw.js');
      const relative=allowed.get(url.pathname);if(!relative){send(404,{error:'Not found'});return;}
      let body=await readFile(path.join(root,relative));
      if(relative==='dist/app.js')body=Buffer.from(body.toString().replace("from 'web-vitals'","from '/node_modules/web-vitals/dist/web-vitals.js'"));
      res.writeHead(200,{'Content-Type':relative.endsWith('.html')?'text/html; charset=utf-8':relative.endsWith('.css')?'text/css':'text/javascript'});res.end(body);
    }catch{if(!res.headersSent)send(500,{error:'Fixture failure'});else res.end();}
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const server=createFixtureServer();server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`KANBAN_READY:http://127.0.0.1:${server.address().port}`));
  const stop=()=>{server.close();server.closeAllConnections();};process.on('SIGINT',stop);process.on('SIGTERM',stop);
}
