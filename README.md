# DevPath

Este é o único projeto ativo do DevPath: site autenticado, diagnóstico e 254 atividades nas etapas 00–23. Inclui as melhorias de ensino do diagnóstico/Etapa 01 e as revisões posteriores das etapas 02 e 03. Os IDs existentes foram preservados para manter a compatibilidade do progresso.

## Usar no Windows

Execute os comandos nesta pasta:

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

O modo local salva o progresso no navegador. O site autenticado utiliza a API e o banco D1 associados à conta.

## Atualizar conteúdo

Todas as fontes editoriais ficam em `course-src/`. Os arquivos gerados do currículo em `public/` e a lista de IDs da API são regenerados pelo mesmo comando, sem consultar outro checkout ou uma versão anterior do catálogo:

```powershell
npm.cmd run build:curriculum
npm.cmd run check:curriculum
```

Ao editar receitas Python, atualize primeiro o JSON intermediário com `uv run python course-src/compile_content.py` e `uv run python course-src/build_graph.py`; depois gere o currículo. Antes de recompilar a Etapa 00, execute `node course-src/build-stage00-preparation.mjs` para atualizar sua entrada intermediária.

Consulte [docs/project-layout.md](docs/project-layout.md) para conhecer as fontes, saídas e regras de geração.
