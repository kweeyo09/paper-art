const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {layoutCss} = require('./scripts/layout-css.cjs');
const root = path.join(__dirname, 'dist');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary'};

// The layout editor (open the studio with ?edit) saves through this local-only endpoint.
function saveLayout(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; if (body.length > 10000) req.destroy(); });
  req.on('end', () => {
    try {
      const css = layoutCss(JSON.parse(body).values);
      fs.writeFileSync(path.join(root, 'layout.css'), css);
      res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify({written: ['dist/layout.css']}));
    } catch (error) {
      res.writeHead(400, {'Content-Type': 'application/json'}).end(JSON.stringify({error: error.message}));
    }
  });
}

http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if(req.method==='POST'&&pathname==='/__paper-layout'){saveLayout(req,res);return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173  ·  layout editor: http://127.0.0.1:4173/?edit'));
