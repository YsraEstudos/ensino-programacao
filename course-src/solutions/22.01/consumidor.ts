import{buscarApelido}from'./lib.js';const apelido=await buscarApelido('u1');console.log(apelido?.toUpperCase()??'sem apelido');
