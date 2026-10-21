import {mkdir, copyFile, readFile, writeFile} from 'node:fs/promises';
await mkdir(new URL('../dist/vendor/', import.meta.url), {recursive:true});
for (const name of ['three.module.js','three.core.js']) await copyFile(new URL(`../node_modules/three/build/${name}`, import.meta.url),new URL(`../dist/vendor/${name}`, import.meta.url));
await copyFile(new URL('../node_modules/three/LICENSE', import.meta.url),new URL('../dist/vendor/THREE-LICENSE.txt', import.meta.url));
for (const file of ['loaders/GLTFLoader.js','utils/BufferGeometryUtils.js']) {
  const destination=new URL(`../dist/vendor/${file}`,import.meta.url);
  await mkdir(new URL('./',destination),{recursive:true});
  const source=await readFile(new URL(`../node_modules/three/examples/jsm/${file}`,import.meta.url),'utf8');
  await writeFile(destination,source.replaceAll("from 'three'","from '../three.module.js'"));
}
