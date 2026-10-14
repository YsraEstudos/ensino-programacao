import{mkdir,copyFile}from'node:fs/promises';await mkdir('dist',{recursive:true});await Promise.all([copyFile('src/index.js','dist/index.js'),copyFile('src/index.d.ts','dist/index.d.ts')]);
