import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const hashes = {};
function tree(dir) {
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    if (e.name === '.generated') continue;
    const file = path.join(dir,e.name);
    if (e.isDirectory()) tree(file);
    else hashes[file.replaceAll('\\','/')] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
}
for(const dir of ['course-src','scripts','lib']) tree(dir);
for(const file of fs.readdirSync('public').filter(x=>/\.(js|css|json|html)$/.test(x)).map(x=>'public/'+x).concat(['package.json','package-lock.json','docs/analise-curricular-2026-10-05.md'])) hashes[file]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
fs.writeFileSync('output/fase2/initial-hashes.json',JSON.stringify(hashes,null,2));
fs.copyFileSync('public/course-catalog.json','output/fase2/catalog-before.json');
fs.copyFileSync('course-src/assessments.json','output/fase2/assessments-before.json');
console.log(Object.keys(hashes).length+' files hashed');
