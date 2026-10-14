# Relatório de auditoria — Lote 3 (05.11 a 08.05, 30 atividades)

## Resumo do lote

- Contagem por gravidade: ALTA 4 (06.06, 07.01, 07.06, 08.01); MÉDIA 14; BAIXA 12; OK 0.
- Métricas medidas no lote (script sobre o JSON do lote-3.md):
  - Prompts com menos de 150 caracteres: 8 de 30 (05.11, 06.01, 06.02, 06.03, 07.03, 07.04, 07.05, 07.10).
  - Starters só em `material.md` (prosa, sem código executável): 7 (06.02, 06.03, 07.01, 07.03, 08.01, 08.02, 08.04).
  - Atividades sem assessment: 13 de 30 (05.11, 06.01, 06.02, 06.03, 06.05, 06.06, 06.10, 07.01, 07.03, 07.06, 08.01, 08.02, 08.04).
  - Rubricas com frase genérica do padrão ("Aceite qualquer...", "Rode critérios...", "Avalie somente as decisões retiradas...", "Exija...", "Rubrica de..."): 29 de 30.
  - Prompts com instrução de UI misturada à tarefa ("registre", "clique", "execute"): 9.
- Achados transversais (aparecem em mais de uma atividade):
  - Frase de template "Use o starter descrito no contrato" no prompt e no practiceSteps de 08.01, 08.02, 08.03 e 08.04. O "contrato" não existe no cartão.
  - incorrectFeedback repete literalmente o correctFeedback e acrescenta uma frase: 07.03, 07.04, 07.05.
  - Mesmo texto de interaction ("Editor JavaScript e painel de resultado com seções nomeadas...") copiado em 07.02, 07.05, 07.07, 07.09 e 07.10.
  - Gabarito completo vazado em hint ou examples: 07.01 (12 respostas), 08.01 (8 respostas), 08.04 (examples).
  - Primers que referenciam Map/Set como "etapa 07" dentro da etapa 06: 06.06 e 06.09.
  - Frase em inglês não traduzida chegando ao aluno: 07.09 (5 campos).
  - Rubrica de 06.10 copiada para 08.04, e rubrica de 05.11 copiada para 06.06 (mesmo texto "Aceite escolha justificada..." em 05.11, 06.06 e 07.01).

---

### 05.11 — Unicode visto de perto  [Gravidade: MÉDIA]
- **Escrita:**
  - "grafemas" aparece sem definição antes de uso (explanation.mental_model: "NFC não segmenta grafemas"; review.choices[0]). Correção: incluir na explanation: "Grafema é a unidade que a pessoa lê como um caractere. 'ñ' decomposto tem 2 code points e 1 grafema."
  - examples.expected diz "for...of em emoji percorre um code point", mas o starter usa `[...emoji]`. Correção: "spread [...emoji] percorre um code point; for...of também, com o mesmo resultado."
  - "Registre previsões" em prompt/interaction mistura UI com a tarefa (CONFIRMA padrão do plano).
- **Lógica:**
  - review.answer = 0 ("Segmentar o texto em grafemas") é a resposta certa, mas nenhum passo ensina segmentação: não há `Intl.Segmenter` no starter nem na explanation. Pré-requisito oculto. Correção: acrescentar ao starter a linha `console.log([...new Intl.Segmenter("pt",{granularity:"grapheme"}).segment("é")].length)` (saída 1) e citá-la no worked_example.
  - Sem assessment (SEM ASSESSMENT/TESTE AUTOMATIZADO). Para COMPARE a previsão pode ser conferida por teste: `expect(emoji.length).toBe(2)`, `expect([...emoji].length).toBe(1)`, `expect(a===b).toBe(false)`, `expect(a.normalize("NFC")===b.normalize("NFC")).toBe(true)`.
- **Novo vs planos:** NOVO (grafema sem definição; Intl.Segmenter como pré-requisito oculto da review; for...of vs spread). CONFIRMA: sem assessment; rubrica genérica "Aceite escolha justificada por diferença semântica publicada."

### 05.02 — Regex minima  [Gravidade: BAIXA]
- **Escrita:**
  - checks.scoring e rubric: "Avalie somente as decisões retiradas e execute o arquivo completo." é ambígua: não diz quais decisões. Correção: "Avalie a previsão registrada para cada caso e depois execute `identificadorValido` sobre todos os casos do prompt."
- **Lógica:**
  - Verificado com Node: `/^[A-Za-z_]\w*$/.test("abc_2\n")` retorna false, como o contrato exige. Os testes cobrem "abc_2\n", "abc\nxyz" (pega a flag m) e "ok depois espaço". Sem falhas evidentes.
  - Teste fraco possível: nenhum caso com `\w` acentuado em modo `u`. Não é erro, mas o contrato "ASCII" deveria dizer que `\w` sem flag `u` já é ASCII; sugestão de teste: `expect(identificadorValido("aç")).toBe(false)`.
- **Novo vs planos:** CONFIRMA rubrica genérica. NOVO: rubric ambígua ("decisões retiradas"), sem assessment de previsão.

### 05.05 — RegExp.escape em busca  [Gravidade: MÉDIA]
- **Escrita:**
  - starter: `export function contemLiteral(texto,termo){ const re=new RegExp(/* termo escapado */); ...}`. O comentário está dentro dos parênteses, então o aluno não vê o argumento `termo`. Correção: `const re = new RegExp(RegExp.escape(termo));` como solução, ou no starter `new RegExp(/* ___ */)` com a dica "use `termo`".
  - rubric: "entrada, saída, erro e efeitos declarados" cita "erro", mas nenhum erro é declarado (ex.: termo não string). Correção: declarar o comportamento para termo não-string ou remover "erro".
- **Lógica:**
  - `RegExp.escape` é recente. Verificado aqui: Node 26 tem (`typeof RegExp.escape === "function"`), runtimes anteriores não. O prompt pede "explique como tratou suporte do runtime" e nenhum teste nem fallback é exigido. Correção: declarar o runtime alvo no prompt e exigir fallback `termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` com teste nele.
  - Testes de fronteira estão bons: "[x]", "*", "\\d", "$ 5", termo vazio.
- **Novo vs planos:** NOVO (runtime não declarado; fallback não testado; starter com comentário que oculta o argumento).

### 05.08 — Transferencia - log parser pequeno  [Gravidade: MÉDIA]
- **Escrita:**
  - Título sem acento: "Transferencia" (também em 06.08 e 07.08). Correção: "Transferência".
  - explanation.worked_example: "valide categoria/horário", mas o prompt e o starter não definem formato de horário. Correção no prompt: "data no formato AAAA-MM-DD; nível e mensagem não vazios."
- **Lógica:**
  - Contrato oculto: os testes rejeitam mensagem vazia e data vazia, mas nenhum teste verifica formato de data. Verificado: um parser ingênuo que só exige três partes não vazias aceita `"INFO|xyz|ok"` e nenhum teste contradiz isso. A própria explanation promete validar horário.
  - Correção de teste: `expect(parseLinhas(["INFO|ontem|ok"])).toEqual([[], ["INFO|ontem|ok"]])` e `expect(parseLinhas(["INFO|2026-1-2|ok"])).toEqual([[], ["INFO|2026-1-2|ok"]])`, além de declarar o regex /^\d{4}-\d{2}-\d{2}$/ no prompt.
  - Sem problema de contrato na separação em dois delimitadores: `"INFO|2026-01-02|a|b|c"` é testado.
- **Novo vs planos:** NOVO (validação de horário prometida e não testada; contrato de mensagem vazia implícito).

### 05.09 — Microprojeto - inventário textual  [Gravidade: BAIXA]
- **Escrita:**
  - prompt: "Registre a sequência de comandos, política de repetidos/ausentes e mudança de estado após cada ação." Não há artefato a registrar nem teste para o registro. Correção: "Anote em comentário no código a sequência de comandos e o estado após cada ação."
  - Comando desconhecido (ex.: "vender x") não tem comportamento definido. Correção: adicionar ao starter: "comando desconhecido -> lança Error" ou "-> false", e um teste.
- **Lógica:**
  - Testes cobrem repetidos, ausente, primeira ocorrência, nomes com espaço e estado isolado por chamada. Bons.
  - checks.scoring: "Rode critérios comportamentais e revisão humana para decisões abertas." não diz quais decisões são abertas.
- **Novo vs planos:** CONFIRMA padrão de UI misturada ("Registre"). NOVO: comando desconhecido sem contrato.

### 06.01 — Leitura de referências  [Gravidade: BAIXA]
- **Escrita:**
  - stageBridge usa "Descriptor" sem definição ("Descriptor mostra, por exemplo, se uma propriedade é enumerável ou gravável"). Correção: "Descritor (Object.getOwnPropertyDescriptor) informa se a propriedade é enumerável ou gravável."
  - stageBridge é um parágrafo longo que antecipa structuredClone, JSON, prototype e stack/heap. Correção: encurtar; deixar só a ponte para 06.02 e 06.10.
- **Lógica:**
  - Resposta de previsão correta: a.pontos=2, b.pontos=2, c.pontos=1; a.meta.ativo=false, c.meta.ativo=false. Conferido pelo raciocínio do enunciado (não executado).
  - checks.scoring: "confiança é diagnóstica", mas o prompt não pede nenhuma confiança. Correção: pedir "anote sua confiança (0-100) em cada previsão" no prompt, ou remover a frase.
- **Novo vs planos:** CONFIRMA: SEM ASSESSMENT. NOVO: "confiança" cobrada na rubrica e não pedida no prompt (mesmo padrão aparece em 08.01).

### 06.02 — Aliasing visual  [Gravidade: MÉDIA]
- **Escrita:**
  - Título e review usam "aliasing visual", jargão não definido antes. CONFIRMA (plano cita este título). Correção: "Mesmo objeto, dois caminhos" e definir alias na primeira linha da explanation.
  - interaction: "Grafo de nós/arestas manipulável por teclado e mouse" é especificação de interface dentro de um cartão de previsão. Mistura UI com tarefa (CONFIRMA padrão).
- **Lógica:**
  - Descompasso entre prompt e starter: o prompt manda completar o grafo "após spread, mutação e reatribuição", mas o starter `base={...}; alias=base; copia={...base}; copia.usuario.nome="Bia"; alias.itens.push(2)` não tem reatribuição. A reatribuição só aparece em edgeCases ("copia.usuario={nome:'Cris'}").
  - Correção: acrescentar ao starter `copia.usuario={nome:"Cris"}` e atualizar examples: "base.usuario.nome -> Bia; copia.usuario.nome -> Cris; base.itens -> [1,2]; copia.itens -> [1,2]".
  - Starter é material.md (prosa). Sem assessment. A correção de estado fica só por revisão humana (rubric: "Compare estados e ordem; peça explicação curta").
- **Novo vs planos:** CONFIRMA jargão "aliasing visual" e starter em material.md. NOVO: reatribuição prometida e ausente do starter.

### 06.03 — Parsons de normalização  [Gravidade: MÉDIA]
- **Escrita:**
  - Inconsistência de campos: worked_example diz "Formulário envia codigo, rotulo e token. Modelo da interface usa só codigo e rotulo aparado", mas o starter e o examples usam `id`, `nome`, `senha`. Correção: "Formulário envia id, nome e senha. O modelo usa só id e nome aparado; a senha fica fora do objeto final."
  - common_trap e notes falam em "propriedades extras" sem nomear qual. Correção: nomear `senha` no prompt ("por que a senha não atravessa a fronteira").
- **Lógica:**
  - Ordem correta única: A, B, C; D é distrator. Confere com examples ("usar A,B,C sem D").
  - Sem assessment; correção de ordem seria verificável por teste textual, mas o checks é humano. Sugestão: pedir a sequência como string "A,B,C" e comparar.
  - Edge não testado: nome=undefined gera TypeError em `nome.trim()`. O contrato não diz o que fazer. Declarar no prompt.
- **Novo vs planos:** CONFIRMA: material.md, rubrica genérica. NOVO: codigo/rotulo/token vs id/nome/senha; contrato de nome ausente.

### 06.04 — Complete o merge  [Gravidade: BAIXA]
- **Escrita:**
  - Prompt e explanation estão bem alinhados. Nenhum erro de português relevante.
  - rubric "Avalie somente as decisões retiradas e execute o arquivo completo." é a mesma frase genérica de 05.02.
- **Lógica:**
  - Testes corretos: volume 0 vence, string vazia e false/null substituem, args não mutados (frozen), cópia rasa verificada.
  - Contrato oculto: `patch={volume: undefined}` faz `{...antiga, ...patch}` apagar o valor (fica undefined). O contrato não diz se undefined é "não fornecido". Correção: declarar no prompt e testar: `expect(atualizar({volume:5},{volume:undefined})).toEqual({volume:5})` (se essa for a decisão) ou o contrário.
- **Novo vs planos:** NOVO (undefined no patch não declarado). CONFIRMA rubrica genérica.

### 06.05 — structuredClone comparativo  [Gravidade: BAIXA]
- **Escrita:**
  - rubric: "Rubrica de hipótese, evidência da ferramenta, conclusão e reprodução." descreve um relatório que o prompt não pede. Correção: alinhar o prompt: "Formule uma hipótese para cada estratégia, registre a evidência do Node e conclua."
  - stageBridge não se aplica (nenhum). OK.
- **Lógica:**
  - Afirmações corretas pela semântica da linguagem (não executadas): JSON.stringify com ciclo lança TypeError; structuredClone com função lança DataCloneError; spread compartilha internos.
  - Sem assessment. Sugestão de teste: `expect(structuredClone(f).interno).not.toBe(f.interno)` e `expect(() => structuredClone({f(){}})).toThrow()`.
- **Novo vs planos:** CONFIRMA SEM ASSESSMENT e rubrica genérica. NOVO: rubrica descreve "hipótese e reprodução" não pedidas.

### 06.06 — JSON quebrado e tipos distorcidos  [Gravidade: ALTA]
- **Escrita:**
  - interaction: "Diagnóstico em duas etapas com mensagens distintas de parse e esquema", contradiz o prompt: "Não implemente validação de esquema neste cartão". Correção: "Diagnóstico em uma etapa: falha de parse versus JSON válido, com mensagem textual para cada caso."
  - primers: "`Map` e `Set` são coleções da etapa 07" aparece dentro da etapa 06. Correção: "Map e Set são vistos na etapa 07; aqui basta saber que JSON.stringify não os serializa."
- **Lógica:**
  - Premissa falsa: o prompt manda "Depure lerSave para retornar null em texto JSON sintaticamente inválido". O starter já faz isso: `export function lerSave(texto){ try{return JSON.parse(texto)}catch(e){return null} }`. Os exemplos `'{invalido'` -> null e `'{"vida":0}'` -> objeto já passam. Não há bug para depurar.
  - Correção proposta: trocar o starter por `export function lerSave(texto){ return JSON.parse(texto) }` (sem try/catch). Assim o "depure" tem um erro real: `lerSave("{invalido")` lança SyntaxError, e o aluno acrescenta o catch. Acrescentar testes: `expect(lerSave("{invalido")).toBeNull()` e `expect(lerSave('{"vida":0}')).toEqual({vida:0})`.
  - O valor da segunda parte (tabela de round-trip) está correto: Date vira string ISO; undefined some; NaN e Infinity viram null; Map e Set viram {}.
  - Sem assessment: a correção de "depure" não é verificada por nada.
- **Novo vs planos:** NOVO (starter já correto, sem bug; contradição com "sem validação de esquema"; forward reference de Map/Set). CONFIRMA SEM ASSESSMENT e rubrica genérica "Aceite escolha justificada...".

### 06.07 — Indexador por id  [Gravidade: MÉDIA]
- **Escrita:**
  - prompt: "escolha uma estrutura que cumpra os três casos", mas o enunciado não diz que o retorno deve ser um objeto com acesso por ponto.
  - rubric genérica "Aceite qualquer implementação que cumpra..." (mesma frase em 05.05, 05.08, 07.02, 07.05, 07.08, 07.10).
- **Lógica:**
  - Contrato oculto: os testes exigem acesso por ponto (`indice.a.v`, `indice.b.v`). Um `Map` (que a primer recomenda: "use `Map` ou `Object.create(null)`") falha em todos eles. A escolha "Map" é válida pelo enunciado, mas reprovada pelo teste.
  - Correção: ou o prompt diz "retorne um objeto com chaves próprias (não Map)", ou os testes aceitam Map e objeto nulo-prototipado via `indice instanceof Map ? indice.get("a") : indice.a`.
  - Testes de `__proto__` e de imutabilidade estão bons; um `indice[id]=registro` com `{}` falha no teste de `__proto__`. Verificado pelo raciocínio do teste (`Object.hasOwn` falha).
- **Novo vs planos:** NOVO (contrato oculto de objeto x Map).

### 06.08 — Transferencia - config versionada  [Gravidade: MÉDIA]
- **Escrita:**
  - worked_example: "Preferência v1 guarda escala na raiz; v2 agrupa em exibição." O starter usa `volume` e `audio`. Correção: "Preferência v1 guarda volume na raiz; v2 agrupa em audio."
  - edgeCases: "texto original preservado" não está definido no contrato nem testado. Correção: remover ou definir ("o texto recebido não é reescrito pela função").
- **Lógica:**
  - review.prompt: "Qual é o objetivo central de uma migração de formato persistido?" mas a resposta correta (choices[0]) fala só de versão futura ("Recusar com status de versão não suportada e não regravar o save"). Pergunta e resposta não batem. Correção da pergunta: "Ao receber um save de versão futura, qual conduta é segura?"
  - Lacunas de teste: v2 sem `audio` (`{"version":2}`), volume não numérico (`{"version":1,"volume":"alto"}`) e versão 0 (`{"version":0}`) não são testados, embora o starter diga "sem versão conhecida -> defaults".
- **Novo vs planos:** NOVO (pergunta do review não corresponde à resposta; lacunas de teste; "escala/exibição" vs "volume/audio"). Nota: "Transferencia" sem acento.

### 06.09 — Microprojeto - save de jogo robusto  [Gravidade: MÉDIA]
- **Escrita:**
  - primers: "`Map` e `Set` (etapa 07) não viram JSON diretamente" — referência para uma etapa futura dentro da etapa 06, e o prompt pede que se explique como Map e Set seriam representados. Correção: manter a explicação, mas trocar por "(vistos na etapa 07)" e acrescentar um exemplo mínimo com arrays explícitos.
  - interaction: "rascunho persistente" aparece sem definição. Correção: remover ou definir.
- **Lógica:**
  - Testes cobrem round-trip, V1 sem itens, campo extra, vida 0, vida negativa, texto inválido e defaults independentes. Bons.
  - Lacunas: tipos dos campos não são testados (`nome` numérico, `vida: "5"`, `itens` não-array). O starter declara os tipos; a restauração aceita qualquer coisa.
  - Versão futura em restaurar (ex.: version 3) não tem contrato neste cartão; 06.08 trata isso. Declarar aqui também, ou remover do escopo.
  - docs: "Number.isInteger" aparece na lista de docs, mas o contrato não exige inteiro para vida. Correção: remover o doc ou declarar que vida é inteiro.
  - A nota separada (comparação JSON x structuredClone) só tem revisão humana. Tratar como entrega à parte.
- **Novo vs planos:** NOVO (Map/Set forward reference; tipos não validados; Number.isInteger sem contrato; versão futura sem contrato).

### 06.10 — Propriedade própria ou herdada  [Gravidade: BAIXA]
- **Escrita:**
  - worked_example: "Sessão herda idioma do protótipo e define apelido próprio", mas o starter usa `cor` (herdada) e `nome` (própria). Correção: "Sessão herda cor do protótipo e define nome próprio: in encontra os dois, hasOwn só nome, Object.keys só nome."
  - prompt: "Preencha a matriz prevista antes de rodar" — o cartão não traz matriz nem modelo de tabela. Correção: incluir a matriz vazia (propriedade | in | hasOwn | keys | enumerável) no prompt.
  - scoring/rubric: "Rubrica de localização, fluxo de dados e intenção" é texto de leitura de código; para READ de propriedades, dizer "Compare a matriz prevista com a saída de cada linha".
- **Lógica:**
  - Afirmações conferidas: `"toString" in obj` é true; `Object.keys(obj)` é ["nome"]; `Object.getOwnPropertyDescriptor(obj,"nome").enumerable` é true.
  - Sem assessment: aceitável para READ, mas a previsão não é verificada.
- **Novo vs planos:** CONFIRMA SEM ASSESSMENT. NOVO (exemplo idioma/apelido não bate com o starter; matriz não fornecida).

### 07.01 — Escolha o método  [Gravidade: ALTA]
- **Escrita:**
  - Categorias divergentes entre objective e prompt. objective: "coleção, item, booleano ou acumulado". prompt: "coleção nova, subconjunto, primeiro item, sim/não ou acumulado". "subconjunto" não aparece no objective e "item" não aparece no prompt. Correção: usar as mesmas 5 categorias nos dois campos, ou as 4 do prompt.
  - interaction menciona "Tab percorre células" — UI, sem problema, mas a instrução de tarefa fica misturada.
- **Lógica:**
  - Gabarito vazado: hints[1] diz "Esperado: map,filter,find,some,every,reduce,map,filter,find,some,every,reduce" e examples[0] tem o mesmo. São as 12 respostas do material. Correção: no hint, comparar só com os 5 exemplos públicos ("transformar todos, manter pares, achar primeiro, existência/universalidade, somar") e deixar as outras 7 sem resposta. Ex.: "Compare com os exemplos públicos: 'transformar todos' e 'manter pares' já mostram a forma de saída. Classifique as outras sete."
  - Gabarito das duas perguntas novas ("primeiro maior que 10" = find; "quantos maiores" = filter().length ou reduce) está só em edgeCases. Manter, mas não como resposta na hint.
  - Sem teste: a classificação só é conferida por revisão humana.
- **Novo vs planos:** NOVO (gabarito completo em hint e examples; categorias divergentes). CONFIRMA: material.md (sem código) e SEM ASSESSMENT.

### 07.02 — GroupBy moderno  [Gravidade: MÉDIA]
- **Escrita:**
  - prompt: "sem supor suporte fora do runtime declarado", mas nenhum runtime é declarado no cartão (nem no starter, nem na explanation). Correção: "Runtime alvo: Node 22+. Map.groupBy existe; o laço de fallback é exigido para runtimes sem o método."
  - interaction: texto copiado de outras atividades (ver achados transversais).
- **Lógica:**
  - Fallback nunca é testado. O starter pede "um laço de fallback para runtimes sem os métodos novos", mas os testes só chamam `agrupar`. Correção: exportar `agruparComLaco(pedidos)` e testar as duas funções com os mesmos casos.
  - Testes públicos e de borda estão bons: Map, ids por grupo, ordem de primeira aparição, lista vazia, entrada congelada.
  - Verificado: se `agrupar` usasse `Object.groupBy`, `toBeInstanceOf(Map)` falharia, como deve.
- **Novo vs planos:** NOVO (runtime não declarado; fallback não testado).

### 07.03 — Parsons de ranking  [Gravidade: MÉDIA]
- **Escrita:**
  - Bloco D: "D=exibir ids", mas o exemplo de saída é "Ana,Bia,Cai" (nomes). Correção: "D=exibir nomes" ou saída "1,2,3" (ids), conforme a intenção.
  - review.incorrectFeedback repete o correctFeedback inteiro e acrescenta uma frase (padrão em 07.04 e 07.05). Correção: incorrectFeedback = "Os pontos precisam existir antes da comparação. Confira a ordem: pontuar, ordenar por pontos, desempatar por nome."
  - worked_example usa "durações [14, 6]", sem relação com ranking; a frase "cada duração continua aparecendo uma vez" não tem sentido aqui. Correção: usar dois jogadores com pontos e desempate.
- **Lógica:**
  - Bloco A "filtrar partidas válidas" não tem entrada correspondente: o exemplo é "Ana 10, Bia 10, Cai 8" (pontos já somados). Não há partida, nem regra de validade. O exemplo "partida inválida não gera pontos" não pode ser demonstrado. Correção: declarar a entrada: `partidas: [{jogador, pontos, valida}]` e um exemplo com uma partida inválida.
  - Fixture passa com `.sort()` ingênuo (CONFIRMA do plano). Verificado: `["Zeca","ana","Bia"].sort()` dá `["Bia","Zeca","ana"]`, ou seja, a ordem por nome em caixa mista quebra. O fixture só tem nomes capitalizados em ordem alfabética, então um sort de string sem localeCompare passa. Correção de fixture: incluir "ana 10", "Zeca 10", "Bia 10" e esperar "Bia,ana,Zeca" ou a ordem por localeCompare decidida.
  - Sem assessment.
- **Novo vs planos:** CONFIRMA: fixture passa com sort ingênuo. NOVO: bloco A sem entrada; ids x nomes; incorrectFeedback repetido.

### 07.04 — Complete callbacks  [Gravidade: BAIXA]
- **Escrita:**
  - review.incorrectFeedback repete o correctFeedback (ver achados transversais). Correção: "Compare o tipo recebido e o devolvido por cada etapa: map devolve uma lista de totais; some devolve booleano."
  - rubric "Avalie somente as decisões retiradas e execute o arquivo completo." é genérica.
- **Lógica:**
  - Testes corretos e bons: limite igual não conta (20 vs 20 -> false; 19 -> true), pedido inativo caro não conta, total 0 continua na lista.
  - Por raciocínio (não executado): `>=` falharia no teste de limite igual, pois 20 >= 20 daria true.
- **Novo vs planos:** NOVO (feedback repetido). CONFIRMA rubrica genérica.

### 07.05 — Set operations  [Gravidade: BAIXA]
- **Escrita:**
  - review.incorrectFeedback repete o correctFeedback (achado transversal).
  - starter comentário: "diferenca -> a − b (membros de a que NÃO estão em b; a ordem importa)". Sets não têm ordem garantida para o teste, e nenhum teste checa a ordem. Correção: "a ordem dos membros não é garantida; compare como conjunto".
  - interaction copiada de outras atividades.
- **Lógica:**
  - Testes cobrem disjuntos, a vazio, b vazio, direção de a − b e entrada preservada. Bons.
  - Teste "não altera a nem b" tem asserção com `||` pouco legível; a checagem está correta, mas uma asserção explícita `expect(r.intersecao).not.toBe(a)` seria mais clara.
- **Novo vs planos:** NOVO (ordem em Set; interaction copiada). CONFIRMA rubrica genérica.

### 07.06 — Reduce ilegível  [Gravidade: ALTA]
- **Escrita:**
  - worked_example: "Em outra refatoração, uma cadeia de ternários..." faz referência a uma refatoração que não existe no cartão. Correção: remover a frase ou trazer o exemplo para o próprio cartão.
  - starter é uma expressão solta, sem `export function` e sem `itens` declarado: `const resumo=itens.reduce(...)`. O formato de `itens` (`{categoria, preco}`) não está declarado em lugar nenhum. Correção: `export function resumir(itens){ return itens.reduce(...) }` e no prompt "itens: [{categoria: string, preco: number}]".
  - Ternário dentro do starter (`acc[x.categoria]===undefined?0:acc[x.categoria]`) sem explicação antes: CONFIRMA do plano (ternário em 07.06, explicado só em 19.01).
- **Lógica:**
  - Bug verificado no starter, e o prompt manda preservar o comportamento. Rodando o reduce atual:
    - `itens = [{categoria:"toString",preco:3}]` gera `toString: 'function toString() { [native code] }3'`. Chave "constructor" gera `'function Object() { [native code] }4'`.
    - Categoria `"__proto__"` some sem erro.
  - O common_trap fala de "chaves especiais", mas nenhum teste ou edgeCase cobre isso. Como o objetivo é "sem alterar o comportamento", a refatoração correta vai reproduzir o bug.
  - Correção: decidir. Opção A: a refatoração usa `Map` (ou `Object.create(null)`) e o cartão diz que o comportamento muda para chaves especiais. Opção B: manter objeto, mas com `Object.hasOwn` no lugar de `=== undefined`. Em ambas, acrescentar testes: `[{categoria:"toString",preco:3}]` e `[{categoria:"__proto__",preco:5}]`.
  - Sem assessment: a comparação "Compare alguns estados" é só humana.
- **Novo vs planos:** NOVO (bug de chaves especiais no starter; referencia a `itens` indefinido; formato de item não declarado). CONFIRMA: ternário exigido sem explicação prévia; SEM ASSESSMENT.

### 07.07 — Contagem e agrupamento  [Gravidade: BAIXA]
- **Escrita:**
  - interaction copiada (achado transversal).
  - prompt: "Apresente os retornos lado a lado". Não há formato de saída definido. Correção: "Mostre, num comentário, o retorno de cada função para a mesma entrada."
- **Lógica:**
  - Teste "não altera a entrada" em porCategoria verifica só `entrada.length`. Como a entrada é congelada, mutação já lançaria erro, então o teste pega mutação, mas um mutante que não faz nada também passaria. Correção: `expect(entrada).toEqual(registrosOriginais)`.
  - Testes de ordem de primeira aparição, Map vazio, palavra ausente e tipo diferente (número x array) estão bons.
- **Novo vs planos:** NOVO (asserção fraca de entrada não alterada; formato de saída do "lado a lado" não definido).

### 07.08 — Transferencia - relatorio de vendas  [Gravidade: BAIXA]
- **Escrita:**
  - prompt: "registre a previsão e confira que a entrada ficou intacta" — instrução de UI misturada (padrão CONFIRMA). Correção: "Anote no comentário a previsão de totais e doadores antes de implementar."
  - Título sem acento: "Transferencia".
- **Lógica:**
  - Afirmações conferidas: totais Map {A=>12, B=>0}; doadores Set {ana,bia}; empate favorece a primeira vista; valor 0 continua válido; lista vazia dá maiorCampanha null.
  - Não definido: valores negativos (estorno) e maiorCampanha quando todas as campanhas têm total 0 (fica a primeira, por regra implícita). Correção: declarar.
  - Teste "entrada não é mutada" com asserção só de `length` (mesmo problema de 07.07).
- **Novo vs planos:** NOVO (valores negativos não declarados; asserção fraca).

### 07.09 — Microprojeto - analisador de sessão  [Gravidade: MÉDIA]
- **Escrita:**
  - Inglês não traduzido, visível ao aluno, em 5 campos:
    - common_trap: "Assuming timestamps are sorted can produce a negative or incomplete duration; ties in frequency need a declared rule." Correção: "Supor que os tempos já estão ordenados pode gerar duração negativa ou incompleta; empates de frequência precisam de regra declarada."
    - notes[1] e why_it_matters: "Telemetry and audit summaries should remain correct when events arrive out of order." Correção: "Resumos de telemetria e auditoria devem continuar corretos quando os eventos chegam fora de ordem."
    - conceptSteps[2]: mesma frase acima.
    - hints[2]: "Cuidado com a armadilha desta atividade: Assuming timestamps are sorted..." Correção: usar a versão em português acima.
- **Lógica:**
  - Afirmações conferidas: duração 15, únicas 2, top "ataque", taxa 2/3; empate: duração 3, top "abrir" (primeiro na entrada), taxa 1/2 (2 de 4 sucessos).
  - Testes de entrada congelada e de ordem de chegada cobrem a armadilha (um `Math.max(...) - eventos[0].tempo` falharia em `[30,10,20]`).
- **Novo vs planos:** NOVO (texto em inglês ao aluno; 07.09 não está nos planos).

### 08.01 — Classifique a complexidade  [Gravidade: ALTA]
- **Escrita:**
  - prompt: "Use o starter descrito no contrato (snippets: ...)" e "Antes de executar, escreva a saída/ordem": template leak (achado transversal). Correção: "Para cada trecho abaixo, escreva a complexidade antes de medir."
  - stageBridge é sobre busca em largura (grafos, fila FIFO), mas o cartão é de complexidade. A própria bridge diz "A ponte antecede 08.07". Correção: mover esse stageBridge para 08.07 e colocar aqui uma ponte sobre medir crescimento (ex.: dobrar n e observar o tempo).
  - interaction exige "Tab/Shift+Tab" e "cabeçalhos anunciados": UI misturada (CONFIRMA padrão), menor.
- **Lógica:**
  - Starter não é executável: material.md só lista nomes dos trechos ("acesso a[0]; varredura n; dois loops aninhados n; ..."). Não há código para executar, mas o prompt e o objetivo falam em "executar" e "comparar com a execução". Correção: incluir os 8 trechos como funções em `main.js`, com um `medir(f, n)` que mostra o crescimento ao dobrar n.
  - Gabarito vazado: hint[1] e examples repetem "O(1),O(n),O(n²),O(log n),O(n log n),O(log n),O(1) médio,O(n)". Correção: remover o "Esperado" do hint e deixar só "Compare com o exemplo público: 'acesso a[0]' é O(1)".
  - Conferido: os 8 trechos e suas ordens batem entre si (sort = O(n log n); busca binária = O(log n); cópia = O(n)).
  - review: resposta 1 (O(n log n)) correta.
  - checks.scoring: "confiança é diagnóstica", sem pedido de confiança no prompt (mesmo padrão de 06.01).
- **Novo vs planos:** NOVO (starter sem código e prompt pedindo execução; gabarito vazado; stageBridge de outro cartão). CONFIRMA: material.md; SEM ASSESSMENT; template com "contrato".

### 08.02 — Parsons recursivo  [Gravidade: MÉDIA]
- **Escrita:**
  - prompt: "Use o starter descrito no contrato (blocos: ...)" (achado transversal).
  - objective: "Preveja resultado para árvore vazia e folha antes de ordenar blocos." O prompt não pede previsão; pede ordenar e explicar uma dependência. Correção: incluir no prompt "Antes de ordenar, preveja o resultado de árvore vazia e de folha."
  - examples: "árvore raiz 1, filhos 2 e 3" — a palavra "filhos" não diz quais campos. Ver lógica.
- **Lógica:**
  - Estrutura da árvore não declarada: os blocos usam `no.esq`, `no.dir`, `no.valor` e `no===null` como folha, e o nome da função (`somar`) não tem assinatura. Correção: material com `No = {valor, esq, dir}` (use `null` para ausência) e `function somar(no)`.
  - Sequência correta: A, depois B e C em qualquer ordem, depois D. Confere com a regra de independência da checks. Ok.
  - Sem assessment; a conferência é humana. Sugestão de teste: `somar(null)===0`, `somar({valor:-2,esq:null,dir:null})===-2`, árvore 1-2-3 = 6.
- **Novo vs planos:** NOVO (formato da árvore e assinatura não declarados). CONFIRMA: material.md e SEM ASSESSMENT.

### 08.03 — Complete busca binária  [Gravidade: MÉDIA]
- **Escrita:**
  - prompt: "Use o starter descrito no contrato (main.js: ... if(xs[mid]===alvo)return mid;…)" — template leak e snippet truncado com "…". Correção: colar a função inteira, igual ao starter, sem reticências.
  - objective: "Registre lo/hi iniciais e o primeiro mid antes de executar." O prompt não tem esse passo; só aparece em firstResponse. Correção: incluir no prompt.
- **Lógica:**
  - Mutante plausível trava a suíte em vez de falhar. Verificado: trocar `lo = mid+1` por `lo = mid` faz `busca([1,3,5,7], 7)` entrar em loop infinito (lo=2, hi=3, mid=2 repete). O teste "primeiro e último elementos" fica parado, não reprovado. Correção: limitar iterações no teste (ex.: contar leituras e falhar acima de 2*log2(n)+2) ou rodar a função num worker com timeout.
  - Teste da Proxy (leituras < 100) é bom para "realmente é binária", mas só falha depois que a função termina.
  - Correção do starter confere: `lo=mid+1` e `hi=mid-1`. Os testes passam com essa solução.
- **Novo vs planos:** NOVO (mutante lo=mid trava a suíte; template leak; snippet truncado).

### 08.04 — Invariantes  [Gravidade: MÉDIA]
- **Escrita:**
  - prompt: "Use o starter descrito no contrato (trechos: ...)" — template leak (achado transversal).
  - prompt pede "fonte/ferramenta quando aplicável", mas nenhuma fonte é fornecida; o material é só uma lista de três nomes. Correção: anexar um trecho de código real (ex.: a busca binária) ou tirar "fonte".
  - objective: "Escreva uma propriedade verdadeira no prefixo vazio." O prompt não fala em prefixo vazio. Correção: alinhar.
  - explanation.mental_model: "Invariante descreve o prefixo já processado". Para busca binária a invariante é sobre o intervalo [lo,hi], não sobre um prefixo, e examples diz "está em [lo,hi]". Correção: "Invariante descreve o que é verdade a cada passo; na soma é um prefixo, na busca é um intervalo."
- **Lógica:**
  - examples.expected traz as invariantes prontas: "se alvo existe, está em [lo,hi]; soma -> total é soma de elementos já processados; ponteiros -> pares descartados não podem satisfazer alvo". É o gabarito do cartão. Correção: deixar só o exemplo público de "soma" como modelo e pedir as outras.
  - rubric e checks.scoring "Rubrica de localização, fluxo de dados e intenção; nenhuma edição de código é exigida." é a mesma frase de 06.10. Não se aplica a invariantes. Correção: "Verifique se a invariante é verdadeira no início, se é preservada a cada passo e se a conclusão decorre dela."
  - review.answer = 2 correta.
- **Novo vs planos:** NOVO (rubrica copiada de 06.10; gabarito em examples; objective com prefixo vazio sem correspondência no prompt).

### 08.05 — Bug off-by-one  [Gravidade: BAIXA]
- **Escrita:**
  - rubric/checks.scoring: "Exija reprodução, causa, correção e regressão." é instrução ao avaliador, e fica visível ao aluno. Correção: "Reproduza o erro, explique a causa, corrija e confirme que os casos anteriores continuam passando."
  - vocabulary repete a primeira frase de conceptSteps. Correção: definir "length" diferente: "`length` — quantidade de elementos; o último índice válido é `length - 1`."
- **Lógica:**
  - Correção conferida: `i < xs.length` e `j < xs.length`. Os testes cobrem [], [A], [A,B,C], e o caso de valor undefined legítimo. Bons, e o Proxy pega a leitura além do fim.
  - Os dois erros do starter são detectados pelos testes (visitarTodos perde o último; lerTodos lê índice 3 em [A,B,C]).
- **Novo vs planos:** NOVO (rubrica como instrução ao avaliador visível ao aluno). Sem achado de lógica.

---

## Top 5 do lote

1. **07.01 — Gabarito vazado.** O hint "Esperado: map,filter,find,some,every,reduce,..." e o examples dão as 12 respostas. Correção: no hint comparar só com os 5 exemplos públicos; deixar as outras 7 sem resposta. Também unificar as categorias de objective e prompt.
2. **06.06 — Nada para depurar.** O starter `lerSave` já faz try/catch e já passa nos casos do prompt. Correção: trocar o starter por `return JSON.parse(texto)` sem try, com testes `lerSave("{invalido")` -> null e `lerSave('{"vida":0}')` -> objeto. Remover "validação em duas etapas" da interaction, que contradiz o prompt.
3. **07.06 — Starter corrompe chaves especiais.** Verificado: o reduce atual gera `toString: 'function toString() { [native code] }3'` para a categoria "toString", e "__proto__" some. O starter também usa `itens` sem declará-lo (ReferenceError ao rodar). Correção: declarar o formato de item, escolher Map ou Object.hasOwn explicitamente e testar `toString`, `constructor` e `__proto__`.
4. **08.01 — Sem código, gabarito e ponte errada.** O starter é só uma lista de nomes em material.md, mas o prompt pede "executar"; o hint traz as 8 respostas; e o stageBridge é sobre BFS, que pertence a 08.07. Correção: 8 funções reais em main.js, hint sem gabarito e mover a bridge.
5. **07.03 — Contrato indefinido e fixture fraco.** O bloco A "filtrar partidas válidas" não tem entrada correspondente (o exemplo são pontos já somados), o bloco D diz "exibir ids" mas a saída é de nomes, e o fixture passa com `.sort()` ingênuo (verificado: `["Zeca","ana","Bia"].sort()` quebra a ordem). Correção: declarar `partidas: [{jogador, pontos, valida}]` e acrescentar nomes em caixa mista ao fixture.

Itens de prioridade logo abaixo do Top 5 (para o próximo ciclo): 08.03 (mutante lo=mid trava a suíte); 07.09 (texto em inglês ao aluno); 05.08 (formato de data prometido e não testado); 06.08 (pergunta do review não corresponde à resposta); 05.05 (runtime de RegExp.escape não declarado).
