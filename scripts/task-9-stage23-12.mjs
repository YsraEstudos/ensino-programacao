// 23.12 é item de avaliação por rubrica sem solução, testes, mutantes ou README de referência:
// o gerador publica apenas a entrada de assessment declarada (ambiente rubric, rubrica e nota de evidência).
// Não grava nada além de course-src/assessments.json e só substitui a entrada 23.12.
import {readFileSync, writeFileSync} from "node:fs";

const manifestPath = "course-src/assessments.json";
const assessments = JSON.parse(readFileSync(manifestPath, "utf8"));
assessments["23.12"] = {
  "environment": "rubric",
  "version": 1,
  "checks": [
    "rubric"
  ],
  "rubric": [
    "Declara o piso em engines, a versão de desenvolvimento em .nvmrc e o gerenciador em packageManager, com justificativa.",
    "Mostra a matriz de CI com o principal e o piso, e o resultado de npm test em cada uma.",
    "Registra a migração de Node 24 para 26 como mudança separada, com comandos, saídas e códigos de saída antes e depois."
  ],
  "evidenceLabel": "rubric-declared",
  "evidenceNote": "A plataforma não executa a CI nem o projeto do aluno. A rubrica revisa a evidência declarada; a troca de principal depende do calendário de M.1."
};
writeFileSync(manifestPath, JSON.stringify(assessments, null, 2) + '\n');
console.log('23.12 rubric assessment entry written (no reference files).');
