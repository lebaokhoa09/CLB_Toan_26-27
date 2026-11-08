import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const realRoot=fs.realpathSync(root);
const voyagePrefix='/assets/voyage-v9/';
const voyageMediaRoot=process.env.VOYAGE_MEDIA_ROOT?path.resolve(process.env.VOYAGE_MEDIA_ROOT):null;
if(voyageMediaRoot&&!fs.statSync(voyageMediaRoot).isDirectory())throw new Error('VOYAGE_MEDIA_ROOT must name a media directory.');
const realVoyageRoot=voyageMediaRoot?fs.realpathSync(voyageMediaRoot):null;
const within=(base,file)=>{const relative=path.relative(base,file);return relative!=='..'&&!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative);};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.geojson':'application/geo+json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.m4a':'audio/mp4','.wav':'audio/wav','.ogg':'audio/ogg','.svg':'image/svg+xml','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 let file,base,realBase;
 try{
  const url=new URL(req.url,'http://localhost'),override=voyageMediaRoot&&url.pathname.startsWith(voyagePrefix);
  const relative=override?decodeURIComponent(url.pathname.slice(voyagePrefix.length)):'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname));
  if(relative.includes('\0'))throw new Error('Invalid path.');
  base=override?voyageMediaRoot:root;realBase=override?realVoyageRoot:realRoot;file=path.resolve(base,relative);
 }catch{res.writeHead(400);res.end();return;}
 if(!within(base,file)){res.writeHead(403);res.end();return;}
 fs.realpath(file,(realError,realFile)=>{
 if(realError){res.writeHead(404);res.end('Not found');return;}
 if(!within(realBase,realFile)){res.writeHead(403);res.end();return;}
 fs.stat(realFile,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
  const headers={'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  let start=0,end=stat.size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match||(!match[1]&&!match[2])){res.writeHead(416,{...headers,'Content-Range':`bytes */${stat.size}`});res.end();return;}
   if(!match[1])start=Math.max(0,stat.size-Number(match[2]));
   else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
   if(start>=stat.size||start>end||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)){res.writeHead(416,{...headers,'Content-Range':`bytes */${stat.size}`});res.end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
  if(req.method==='HEAD'||stat.size===0){res.end();return;}
  const stream=fs.createReadStream(realFile,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 });
 });
});
server.on('error',error=>{
 if(error.code==='EADDRINUSE'){
  console.log('Cong mac dinh dang duoc su dung; chuyen sang cong trong.');
  server.listen(0,'127.0.0.1');
 }else{console.error('Khong mo duoc may chu local:',error.message);process.exitCode=1;}
});
server.on('listening',()=>{
 const edition=process.argv.find(arg=>/^--film=(v9|v11|v12|v13|v14|v21)$/.test(arg))?.slice(7);
 const url=`http://127.0.0.1:${server.address().port}/${edition?`?film=${edition}`:''}`;console.log(`Local: ${url}`);
 if(voyageMediaRoot)console.log(`Voyage media override (local review only): ${voyageMediaRoot}`);
 if(process.argv.includes('--open')&&!process.argv.includes('--no-open')&&process.platform==='win32')spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'}).unref();
});
server.listen(Number(process.argv[2]||54823),'127.0.0.1');
