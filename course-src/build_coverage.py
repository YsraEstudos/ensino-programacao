"""Trace each supplied audit item to concrete editorial evidence in this edition."""
from __future__ import annotations
import json
from pathlib import Path
from generated_data import GENERATED_DIR

ROOT = Path(__file__).resolve().parent
audits = json.loads((ROOT / "audit_requirements.json").read_text(encoding="utf-8"))
items = json.loads((GENERATED_DIR / "resolved_preview.json").read_text(encoding="utf-8"))
by_audit = {}
for item in items:
    for number in item.get("audit_ids", []):
        by_audit.setdefault(number, []).append(item["id"])

# Cross-cutting requirements are implemented in the site protocol/bridges and
# supported by the listed representative activities. This mapping is editorial,
# not a claim that the corresponding site feature has been coded already.
reference = {
1:"Protocolo: anatomia do registro e publicação; 254 fichas em duas visões",
2:"Nova fonte course-src e PDF gerado integralmente; sem páginas herdadas",
3:"Protocolo: ajuda, feedback e orçamento de luta produtiva",
4:"Grafo formal: 69 conceitos, 254 atividades e validação acíclica",
5:"Ficha: nove eixos de dificuldade; Protocolo: domínio por evidência",
6:"Tipo MODIFY formal; 10.06, 13.14 e 23.11",
7:"Ponte 03A decisões e 03B repetição; ordem 03.04–03.09",
8:"Ponte 05A arrays/strings e 05B regex; 05.10–05.11",
9:"Ponte 11: módulos antes do Kanban; 11.10, 11.08 e 13.14",
10:"Ponte 13; 13.03, 13.07, 13.09 e 13.13",
11:"Protocolo: UI automatizada + revisão assistiva; 11.07 e 13.13",
12:"Ponte 11: textContent; 11.12 e 13.13",
13:"Ponte 11: fases/default/once/passive/signal; 11.01, 11.11, 11.14",
14:"Ponte 02: Math; 02.10–02.12",
15:"Ponte 12: TTL/UTC/Intl; 12.12",
16:"Ponte 12: combinadores e async iteration; 12.07, 12.13–12.14",
17:"Ponte 12 e 14.13: browser versus Node ESM/CJS",
18:"Ponte 13: taxonomia/cause; 13.10 e 16.10",
19:"Ponte 06; 06.10 antes de 10.01–10.08",
20:"Ponte 11 e etapa 14; 14.04, 14.10 e 14.12",
21:"Ponte 15–19; 15.04, 16.04–16.05 e 22.06",
22:"15.05 aposentado -> 16.09; ponte 15–19 e 16.07",
23:"Ponte 13/15–19; 16.10",
24:"17.09 compara enum numérico/string e objeto as const",
25:"19.09 branding avançado e validação de borda",
26:"22.09 e trilha opcional de bibliotecas",
27:"18.10 com seis utility types e relações de API",
28:"Ponte 15–19 e 19.07 orçamento de complexidade",
29:"14.09 microtrilha Git/PR",
30:"Site spec: escopo opcional; 14.12 bundler mínimo",
31:"14.11 dependência, licença, lockfile e risco",
32:"23.06, 23.08–23.09 auditoria final de operação",
33:"23.09 logs, ID, duração, cause e redação de segredo",
34:"Pontes 00–23 ordenadas antes das atividades dependentes",
35:"Pontes conceituais com explicação, exemplos e ajuda retirada",
36:"Projeto Kanban V1 11.08 -> V2 13.14; capstone com change request",
37:"Protocolo: revisão por competência D+7/D+21 e interleaving",
38:"Protocolo: regras operacionais do motor e painel de evidências",
39:"Protocolo: IA submetida ao contrato, versão e escada de ajuda",
40:"Redação nova de enunciados, casos, erros, dicas e solução por item",
41:"D.01–D.05 e mapa inicial sem nota punitiva",
42:"Protocolo: seis estados de competência e evidências distintas",
43:"D.01–D.05 e PREDICT: resposta/confiança antes de Run",
44:"Pontes 09,10,12,15–19 com múltiplos exemplos progressivos",
45:"FADED formal e protocolo de retirada conforme domínio",
46:"COMPARE formal; 02.11, 07.04, 10.01, 12.07, 18.06",
47:"Ponte 03: propósito/dependências de variável; TRACE por relação",
48:"Protocolo: escolher entrada que refute hipótese; 13.05/13.07",
49:"Protocolo: tracing linha a linha -> abstrato",
50:"Ponte 13 e 13.12 escolha de Run/debugger/teste/leitura",
51:"Protocolo: Museu de bugs por concepção observada",
52:"Protocolo: registro opcional do que confundiu",
53:"READ formal: D.04, 14.01, 23.01, 23.10",
54:"23.10 mini-repositório de 10 arquivos e 23.11 issue",
55:"04.10 renomeação sem mudança de comportamento",
56:"13.11 leitura de docs oficiais e aplicação",
57:"Protocolo/site spec: link -> nome da API -> busca autônoma",
58:"Protocolo: reflexão após projeto em três perguntas",
59:"Protocolo: escada de ajuda e orçamento sem espera punitiva",
60:"Contextos de pagamento, logs, agenda, API, formulário e RPG",
61:"Ponte 12 HTTP antes de fetch; 12.10",
62:"12.11 text/json/blob/arrayBuffer/formData",
63:"12.11 bodyUsed e leitura única/clone",
64:"Ponte 11 carregamento; 11.09",
65:"11.14 once/passive/signal e AbortController",
66:"Ponte 02 modelo Number; 02.11",
67:"02.12 tolerância fornecida e dependente da escala",
68:"Ponte 05 Unicode; 05.11",
69:"20.10 TextEncoder/TextDecoder em bytes",
70:"15.09 readonly versus alias/freeze",
71:"15.10 literal fresco versus variável",
72:"15.11 TypeScript compilado e falha runtime",
73:"18.09 import type e verbatimModuleSyntax",
74:"22.10 Project References opt-in em bibliotecas/monorepo",
75:"20.09 ReadableStream e backpressure",
76:"21.10 transferência de ArrayBuffer a worker",
77:"12.14 AggregateError.errors em Promise.any",
78:"21.11 SuppressedError e descarte",
79:"Pontes 11–21: Network/Application/Sources/Performance/Memory",
80:"11.13 migração V1->V2 e 13.14 evolução V2->V3 com regressões",
81:"Site spec: checkpoints sem tutorial em funções, DOM, async e TS",
82:"23.10 lê codebase alheia e 23.11 corrige issue",
83:"Protocolo: tempo como fricção, nunca nota inicial",
84:"Ponte 20–23; 10.07, 14.11 e 20.05 seleção de ferramentas",
85:"Protocolo: projeto avalia resultado, não método arbitrário",
86:"Protocolo: erro sintático, semântico, design/manutenção e ambiente",
87:"Site spec/protocolo: explicação curta nos sete modelos mentais",
88:"Transferência isomórfica em cada ficha e protocolo de novo domínio",
89:"Protocolo: revisão mista por competência; 12.08 e 23.08",
90:"Protocolo: telemetria de tentativa, ajuda, D+7/D+21 e transferência",
}
assert set(reference) == {x["id"] for x in audits}
output=[]
for audit in audits:
    output.append({
        "id":audit["id"], "priority":audit["priority"], "title":audit["title"].split(". ", 1)[0],
        "evidence":reference[audit["id"]],
        "new_activity_ids":sorted(by_audit.get(audit["id"],[])),
        "scope":"editorial specification; site implementation follows per activity",
    })
(GENERATED_DIR/"audit_coverage.json").write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"mapped={len(output)} P0={sum(x['priority']=='P0' for x in output)} new_activities={sum(bool(x['new_activity_ids']) for x in output)}")
