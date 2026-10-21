import {readFile,access,readdir} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
async function walk(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const file=join(directory,entry.name);
    if(entry.isDirectory()){await walk(file);continue;}
    if(!/\.(html|js)$/.test(file))continue;
    const source=await readFile(file,'utf8');
    const patterns=file.endsWith('.html')?[/\b(?:src|href)=["']([^"'#]+)["']/g]:[/\b(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g];
    for(const pattern of patterns)for(const match of source.matchAll(pattern)){
      if(/^(?:https?:|data:|\/)/.test(match[1]))continue;
      await access(resolve(dirname(file),match[1]));
    }
  }
}
await walk(root);
const model=await readFile(join(root,'models/wooden-window.glb'));
assert.equal(model.toString('ascii',0,4),'glTF','Window model must be a GLB');
assert.equal(model.readUInt32LE(8),model.length,'Window model must be complete');
for(const mode of ['sunlight','dawn','snow']){
  const image=await readFile(join(root,`scenery/${mode}.jpg`));
  assert.equal(image.readUInt16BE(0),0xffd8,`${mode} must be a JPEG`);
  assert.equal(image.readUInt16BE(image.length-2),0xffd9,`${mode} JPEG must be complete`);
}
console.log('Static references, window model, and all three garden images are valid.');
