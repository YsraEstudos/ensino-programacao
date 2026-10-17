# Contrato L-41 · duas releases locais

Esta evolução usa a API real do exercício22.09, sem editar aquele exercício. O pacote independente @curso/slug-kit contém os mesmos nomes públicos: VERSAO, criarSlug, padroes, limitar e type Opcoes {separador:string;maximo:number}. Opcoes permanece exportado embora separador não configure criarSlug. Não transforme uma propriedade histórica em comportamento novo sem versão/contrato.

`criarSlug(texto)` remove espaços nas pontas, converte para minúsculas, normaliza NFD, remove marcas Unicode e substitui cada espaço literal por '-'. Espaços internos repetidos resultam em hífens repetidos; não invente collapse ou slugificação de pontuação. `padroes` continua {separador:'-',maximo:60}. `limitar` usa slice(0,maximo) quando texto.length>maximo; string menor permanece inteira e maximo0 gera ''. Entradas do exercício: strings e limites inteiros não negativos.

1.1.0 é compatível: `limitar(texto)`, `limitar(texto,5)` e `limitar(texto,{maximo:5})` retornam a mesma semântica histórica, default60. Não retire exports antigos. 2.0.0 remove somente o overload numérico: mantém default e objeto; chamada JS numérica rejeita TypeError e consumidor TS antigo acusa TS2345. Não altere criarSlug/default/Opcoes/padroes como efeito colateral. Ambas releases têm VERSAO coerente.

Build TSstrict/NodeNext gera declarações com isolatedDeclarations e anotações públicas explícitas. Pack real contém somente package.json, README, LICENSE e dist/index.js/index.d.ts/interno.js/interno.d.ts. A raiz exportada é o único ponto de entrada. Cada consumidor externo instala o .tgz correspondente em diretório temporário independente, sem caminhos/aliases/src imports e sem dependências da raiz do curso.

Pré-requisito22.06 trata de guard manual versus Zod/Valibot na fronteira de validação (validation.schema_boundary). Aqui reutilizamos a distinção entre tipo estático e validação runtime para rejeitar a chamada JS numérica em2.0; não exige adicionar biblioteca de schema nem atribui a22.06 ensino de módulos.22.08 fornece empacotamento/consumidor real e22.09 fornece API/declarations.

Catálogo usa criarSlug e preserva IDs/ordem nas duas versões. Relatório histórico usa limitar(texto,5): compila e executa em1.1.0; quebra demonstravelmente em2.0.0, tanto TS como JS. Migração usa {maximo:5}, preserva resumos, ordem, IDs, referência de cada origem e entrada sem mutações; executa em ambas versões. A tentativa main.ts está semanticamente errada e deve ser corrigida. legacy.ts documenta a versão anterior e não deve ser migrado.

`npm test` verifica integração de artefatos, contrato de exports/tipos e regressão dos consumidores. Falha de compiler/pack/install/spawn/import/timeout é erro de ferramenta/artefato; não vale como bug pedagógico ou mutante morto. A incompatibilidade TS2345 deliberada do consumidor histórico2.0 é verificada separadamente e não conta como vermelho do starter ou da mutação.
