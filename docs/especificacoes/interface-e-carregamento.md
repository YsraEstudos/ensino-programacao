# Interface e carregamento — decisão de engenharia

Verificação local em 05/10/2026. A aplicação conserva a casca autenticada de `app/page.tsx` e a interface didática em `public/devpath.html`.

## Medições e limites

O inventário de scripts contém 33 arquivos iniciais: 547165 bytes sem compressão, 143325 bytes quando cada arquivo é comprimido com gzip local. Não inclui CSS, fontes, catálogo JSON ou JavaScript do framework. Gzip local não confirma a transferência efetiva do servidor.

No navegador local, um exercício genérico ficou utilizável em aproximadamente 350 ms; `domInteractive` foi 58 ms. Estes valores são uma amostra de ambiente local, não uma meta de produção. Não foi isolado o custo de parse por arquivo nem medida latência do site publicado.

O compilador tem 191124 bytes de JavaScript e 13978850 bytes de WebAssembly. É carregado sob demanda, apenas para executar módulos. Um exercício comum executou sem solicitar esses assets. A prova de módulos com compilador frio terminou em aproximadamente 577 ms no servidor local; isso não representa rede móvel.

## Navegação e acessibilidade

Foi reproduzida e corrigida uma falha do skip link: `#main` substituía a rota e renderizava o início. O link agora mantém a rota e move o foco para o conteúdo. Há teste de regressão e verificação em navegador. Navegação durante execução cancela o Worker e não atualiza outra atividade. Os testes das etapas preservam foco em editores e controles Parsons.

O iframe externo tem título e mantém autenticação/logout na casca. Não há evidência atual que justifique removê-lo. Leitor de tela, experiência completa de histórico entre os dois documentos e métricas do framework em produção permanecem sem validação específica. Portanto, não declarar acessibilidade integral a partir de jsdom ou dessas amostras.

## Decisão

Manter IIFEs e adaptadores nesta entrega. As responsabilidades de roteamento, catálogo, revisão, notificações e exercícios foram extraídas de `app.js`, com dependências explícitas e registro comum de etapas. Não converter toda a interface para ESM nem reescrever em React sem medir benefício adicional.

Para eventual evolução: usar entrada única e build reproduzível, migrar um módulo por vez e comparar transferência/interação com o estado atual. Alterar a casca apenas diante de problema concreto, preservando autenticação, logout e API privada.
