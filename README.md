# DevPath

Este é o único projeto ativo do DevPath: site autenticado, diagnóstico e 254 atividades nas etapas 00–23. Inclui as melhorias de ensino do diagnóstico/Etapa 01 e as revisões posteriores das etapas 02 e 03. Os IDs existentes foram preservados para manter a compatibilidade do progresso.

## Usar no Windows

Execute os comandos nesta pasta:

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Requisitos: Node.js 22.13 ou posterior e Python 3 disponível como `python`. O build do currículo usa Python; `DEVPATH_PYTHON` pode indicar outro executável. O projeto usa o lockfile para instalar versões reproduzíveis.

O modo local salva o progresso no navegador. O site autenticado utiliza a API e o banco D1 associados à conta.

## Atualizar conteúdo

Todas as fontes editoriais ficam em `course-src/`. Os arquivos gerados do currículo em `public/` e a lista de IDs da API são regenerados pelo mesmo comando, sem consultar outro checkout ou uma versão anterior do catálogo:

```powershell
npm.cmd run build:curriculum
npm.cmd run check:curriculum
```

Depois de editar receitas ou fontes pedagógicas, execute `npm.cmd run build:curriculum`. O comando atualiza os intermediários locais em `course-src/.generated/` e regenera o currículo público a partir das fontes canônicas.

Consulte [docs/organizacao-projeto.md](docs/organizacao-projeto.md) para conhecer as fontes, saídas e regras de geração.

## Convenções e documentação

Identificadores, módulos e scripts usam inglês; a interface, os textos didáticos e os nomes dos documentos em `docs/` usam português. Módulos JavaScript usam nomes como `stage00-ui.js` e `progress-sync.js`, sem repetir a extensão no prefixo. APIs existentes, IDs das atividades e chaves do progresso mantêm seus nomes para preservar compatibilidade.

O [índice de documentação](docs/README.md) distingue os guias atuais dos registros históricos. Os geradores antigos que copiavam arquivos entre distribuições foram retirados do código ativo. Use `npm.cmd run build:curriculum` para gerar o currículo completo no projeto atual; `build:stage03` permanece como alias desse comando.

## Progresso e sincronização

`lib/progress-contract.json` define os valores iniciais e os limites compartilhados. `npm.cmd run build:progress` gera o módulo correspondente do navegador; o desenvolvimento, os testes completos e o build já executam essa etapa.

A API limita o corpo em bytes antes do parse e valida os campos em módulos de `lib/`. Cada leitura retorna uma revisão que deve acompanhar o próximo PUT no cabeçalho `If-Match`. A atualização condicional preserva gravações de outras abas e dispositivos. Registros ilegíveis retornam erro e não são substituídos por progresso vazio.

Quando uma tentativa não pode ser sincronizada, o navegador conserva uma cópia nesta aba e oferece seu download. Depois de um conflito, recarregue o progresso da conta; a cópia pendente continua disponível antes de retomar. Essas cópias não são enviadas automaticamente sobre o progresso mais recente.

## Interface e arquivos gerados

A camada React mantém autenticação, conta e logout; a interface didática está em `public/`. Os interpretadores continuam específicos por etapa para respeitar a gramática ensinada. Utilitários comuns ficam em `teaching-utils.js`, e os dados introdutórios de fallback em `stage00-activities.js`.

Os arquivos de preparação gerados contêm conteúdo pedagógico. Edite suas fontes em `course-src/`, não os bundles. `dist/client/` é uma saída descartável do build e não constitui outra fonte da aplicação. Os exemplos e componentes de interface do starter que não participavam do site foram retirados do código ativo; uma cópia local recuperável fica em `work/starter-archive/`, fora do build e do Git.
