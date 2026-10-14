(function attachLocalCheckpoints(root) {
  // Generated from course-src/local-checkpoints.json; targets only.
  const targets = Object.freeze([
  {
    "id": "00.09",
    "stage": "00",
    "activityIds": [
      "00.09"
    ],
    "environment": "node-simulated",
    "title": "Rastreie uma sequência de atendimento",
    "instructions": [
      "Antes de executar, anote a saída prevista das quatro chamadas.",
      "Rode com três itens; altere somente a quantidade para zero e rode novamente.",
      "Compare a ordem das linhas e explique por que o console não prova que um atendimento real foi registrado.",
      "Resolva as duas transferências independentes."
    ],
    "commands": [
      [
        "node",
        "main.js"
      ]
    ],
    "powershellCommands": [
      [
        "node",
        ".\\main.js"
      ]
    ],
    "expected": [
      "Atendimento",
      "Pessoa: Ana",
      "Itens: 3",
      "Fim",
      "Na variante de zero, somente a linha de itens muda para 0."
    ],
    "troubleshooting": [
      "Uma linha ausente indica chamada ausente ou arquivo de entrada incompleto.",
      "Ordem diferente indica chamadas reorganizadas.",
      "0 é um valor presente e não deve ser omitido por uma checagem de truthiness."
    ],
    "evidence": [
      "previsão escrita antes da execução",
      "stdout das duas versões",
      "diff curto",
      "respostas das duas transferências e limite do console"
    ],
    "gitStep": {
      "required": false,
      "reason": "A primeira prática de observação, execução e alteração pequena acontece antes do primer de Git."
    },
    "evidenceLabel": "learner-declared"
  },
  {
    "id": "01.09",
    "stage": "01",
    "activityIds": [
      "01.09"
    ],
    "environment": "node-simulated",
    "title": "Acompanhe uma variável e seus snapshots",
    "instructions": [
      "Use o runner e os checks próprios do Stage 01.",
      "Preveja os três snapshots de vida 10, 6 e 0 antes de executar.",
      "Explique quando cada texto foi calculado e por que zero e false continuam sendo valores presentes.",
      "Complete as transferências de agenda e duração."
    ],
    "commands": [
      [
        "DevPathStage01Runner",
        "01.09"
      ]
    ],
    "powershellCommands": [
      [
        "DevPathStage01Runner",
        "01.09"
      ]
    ],
    "expected": [
      "Iris | nível 1 | vida 10 | ativa",
      "Iris | nível 1 | vida 6 | ativa",
      "Iris | nível 1 | vida 0 | ativa"
    ],
    "troubleshooting": [
      "Um snapshot antigo indica texto calculado antes da reatribuição.",
      "Uma atribuição a const é inválida; a variável de vida que muda precisa ser let.",
      "Não substitua o checker dedicado por expressão regular ou por presença de texto."
    ],
    "evidence": [
      "previsão",
      "três snapshots do runner",
      "explicação sobre cálculo no momento",
      "duas transferências independentes"
    ],
    "gitStep": {
      "required": false,
      "reason": "Continua o ensino de variáveis e execução antes do primer de Git."
    },
    "evidenceLabel": "learner-declared"
  },
  {
    "id": "04.09",
    "stage": "04",
    "activityIds": [
      "04.09"
    ],
    "environment": "local",
    "title": "Componha um resumo de ficha",
    "instructions": [
      "Execute o módulo ESM no Node.js 24.",
      "Confira ataque, defesa e resumo com os casos fornecidos.",
      "Inclua nível ímpar, armadura e nome vazio; o resumo deve compor os auxiliares sem repetir fórmulas."
    ],
    "commands": [
      [
        "node",
        "main.js"
      ],
      [
        "node",
        "--test",
        "test/main.test.js"
      ]
    ],
    "powershellCommands": [
      [
        "node",
        ".\\main.js"
      ],
      [
        "node",
        "--test",
        ".\\test\\main.test.js"
      ]
    ],
    "expected": [
      "Os valores retornados correspondem aos casos do projeto.",
      "O resumo usa os resultados dos dois auxiliares."
    ],
    "troubleshooting": [
      "Confirme que package.json declara type=module quando os imports usam ESM.",
      "Use Math.floor no cálculo do nível quando a regra pedir arredondamento para baixo.",
      "Nome vazio é uma entrada válida se os demais campos forem válidos."
    ],
    "evidence": [
      "stdout",
      "resultado de testes",
      "caso de borda explicado",
      "diff da composição"
    ],
    "gitStep": {
      "required": false,
      "reason": "O aluno ainda está praticando arquivos e execução; Git só entra após o primer local."
    },
    "package": {
      "name": "devpath-04-09",
      "version": "1.0.0",
      "private": true,
      "type": "module",
      "engines": {
        "node": ">=24.0.0"
      },
      "scripts": {
        "start": "node main.js",
        "test": "node --test test/main.test.js"
      }
    },
    "packageLock": {
      "name": "devpath-04-09",
      "version": "1.0.0",
      "lockfileVersion": 3,
      "packages": {
        "": {
          "name": "devpath-04-09",
          "version": "1.0.0"
        }
      }
    },
    "evidenceLabel": "learner-declared"
  },
  {
    "id": "07.11",
    "stage": "07",
    "activityIds": [
      "07.11"
    ],
    "environment": "local",
    "title": "Primeiro repositório e dois commits",
    "instructions": [
      "saída de npm test",
      "git status limpo",
      "git log com os dois commits",
      "git diff revisado"
    ],
    "commands": [
      [
        "npm",
        "test"
      ]
    ],
    "expected": [
      "saída de npm test",
      "git status limpo",
      "git log com os dois commits",
      "git diff revisado"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "saída de npm test",
      "git status limpo",
      "git log com os dois commits",
      "git diff revisado"
    ],
    "evidenceLabel": "learner-declared",
    "gitStep": {
      "required": true,
      "afterPrimer": false,
      "steps": [
        "Confirme que está na cópia exportada, não no repositório do curso.",
        "git init",
        "git status --short",
        "git add README.md package.json src test",
        "git commit -m \"checkpoint: inventario inicial\"",
        "Altere uma frase do README.md.",
        "git diff --check",
        "git diff",
        "git add README.md",
        "git commit -m \"docs: explica o historico local\"",
        "git log -2 --oneline",
        "git status --short"
      ]
    }
  },
  {
    "id": "07.12",
    "stage": "07",
    "activityIds": [
      "07.12"
    ],
    "environment": "local",
    "title": "Revisão de PR e resposta a comentários",
    "instructions": [
      "3–5 comentários priorizados com evidência e sugestão",
      "decisão e justificativa para cada comentário recebido",
      "saída do teste estrutural",
      "diff autoral revisado"
    ],
    "commands": [
      [
        "npm",
        "test"
      ]
    ],
    "expected": [
      "3–5 comentários priorizados com evidência e sugestão",
      "decisão e justificativa para cada comentário recebido",
      "saída do teste estrutural",
      "diff autoral revisado"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "3–5 comentários priorizados com evidência e sugestão",
      "decisão e justificativa para cada comentário recebido",
      "saída do teste estrutural",
      "diff autoral revisado"
    ],
    "evidenceLabel": "learner-declared",
    "gitStep": {
      "required": true,
      "afterPrimer": true,
      "steps": [
        "git status --short",
        "git switch -c review/inventario",
        "git diff --check",
        "git add README.md review test",
        "git commit -m \"docs: registra revisao do PR\"",
        "git show --stat --oneline HEAD",
        "Compartilhe o diff com um colega para receber comentários, se houver uma pessoa disponível."
      ]
    },
    "reviewStep": {
      "required": true,
      "steps": [
        "Revise o PR simulado e registre 3–5 comentários com prioridade, localização, impacto, evidência e sugestão.",
        "Responda às duas sugestões recebidas: aceite ou rejeite cada uma e justifique pelo contrato.",
        "Diferencie revisão humana de validação automática: os testes conferem apenas contagem e estrutura."
      ]
    }
  },
  {
    "id": "11.08",
    "stage": "11",
    "activityIds": [
      "11.08"
    ],
    "environment": "dom",
    "realbrowser": true,
    "title": "Verifique um quadro no navegador",
    "instructions": [
      "Abra o projeto no navegador e adicione um item válido.",
      "Tente enviar vazio, mover um item e recarregar a versão de armazenamento V1.",
      "Confira JSON inválido, status desconhecido e texto literal parecido com HTML.",
      "Use Tab e Enter; confira foco, aria-live e comportamento depois de recarregar."
    ],
    "commands": [
      [
        "browser",
        "index.html"
      ]
    ],
    "powershellCommands": [
      [
        "Start-Process",
        ".\\index.html"
      ]
    ],
    "expected": [
      "Entrada válida aparece no DOM.",
      "Entrada vazia é rejeitada sem perder o estado anterior.",
      "Texto <img> aparece literalmente e não cria elemento HTML.",
      "Foco, Tab, Enter, anúncio e persistência são verificados no navegador real."
    ],
    "troubleshooting": [
      "Separe validação, estado, renderização e persistência para localizar a falha.",
      "jsdom cobre apenas estrutura DOM e não comprova foco, Tab ou Enter reais.",
      "Não substitua textContent por innerHTML para exibir texto do aluno."
    ],
    "evidence": [
      "passos reproduzíveis",
      "DOM e storage antes/depois",
      "resultado de teclado e foco no navegador real",
      "revisão de aria-live"
    ],
    "gitStep": {
      "required": true,
      "afterPrimer": true,
      "steps": [
        "Confirme a pasta da cópia exportada e anote a branch atual.",
        "git status --short",
        "git switch -c feature/kanban-filtro",
        "Faça uma mudança pequena e rode os testes.",
        "git diff --check",
        "git diff",
        "git add README.md src test",
        "git commit -m \"feat: adiciona filtro\"",
        "Volte à branch inicial e integre com git merge --no-ff feature/kanban-filtro.",
        "Na cópia temporária, crie uma branch paralela e altere a mesma linha do README para provocar conflito; resolva, rode testes e revise diff.",
        "git add README.md",
        "git commit -m \"docs: resolve conflito do README\"",
        "git log --graph --oneline --all",
        "Abra Pull Request no host remoto configurado somente se tiver um remoto próprio; sem remoto, descreva os passos e não publique o repositório do curso."
      ]
    },
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Revise um diff de colega com 3–5 comentários priorizados e evidência reproduzível.",
        "Receba comentários, responda aceitando ou rejeitando cada sugestão com justificativa.",
        "Use o template de PR para resumir objetivo, testes e risco da mudança."
      ]
    }
  },
  {
    "id": "12.15",
    "stage": "12",
    "activityIds": [
      "12.15"
    ],
    "environment": "local",
    "title": "Configuração local de Vitest",
    "instructions": [
      "resultado de npm test depois da instalação de Vitest",
      "watch mode reagindo a uma mudança e encerrado no terminal",
      "scripts e devDependency declarados",
      "evidência de execução local declarada pelo aluno"
    ],
    "commands": [
      [
        "npm",
        "init",
        "-y"
      ],
      [
        "npm",
        "install",
        "-D",
        "vitest"
      ],
      [
        "npm",
        "test"
      ],
      [
        "npm",
        "run",
        "test:watch"
      ]
    ],
    "expected": [
      "resultado de npm test depois da instalação de Vitest",
      "watch mode reagindo a uma mudança e encerrado no terminal",
      "scripts e devDependency declarados",
      "evidência de execução local declarada pelo aluno"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "resultado de npm test depois da instalação de Vitest",
      "watch mode reagindo a uma mudança e encerrado no terminal",
      "scripts e devDependency declarados",
      "evidência de execução local declarada pelo aluno"
    ],
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Leia o teste incluído e explique o caso coberto.",
        "Registre a saída real da suíte e uma alteração observada no watch mode.",
        "Declare que a checagem automática verifica configuração, não executa a instalação Vitest."
      ]
    }
  },
  {
    "id": "12.16",
    "stage": "12",
    "activityIds": [
      "12.16"
    ],
    "environment": "local",
    "title": "Inspecione Network, timing e CORS",
    "instructions": [
      "npm test",
      "Network status e timing de 200/404",
      "erro CORS observado e explicado",
      "captura do navegador declarada pelo aluno"
    ],
    "commands": [
      [
        "npm",
        "test"
      ],
      [
        "node",
        "src/server.mjs"
      ]
    ],
    "expected": [
      "npm test",
      "Network status e timing de 200/404",
      "erro CORS observado e explicado",
      "captura do navegador declarada pelo aluno"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "npm test",
      "Network status e timing de 200/404",
      "erro CORS observado e explicado",
      "captura do navegador declarada pelo aluno"
    ],
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Inspecione a resposta 200 e a 404 separadamente.",
        "Compare timing sem inferir lentidão apenas pelo status.",
        "Explique o erro cross-origin com a origem e os cabeçalhos observados."
      ]
    }
  },
  {
    "id": "14.08",
    "stage": "14",
    "activityIds": [
      "14.08"
    ],
    "environment": "local",
    "title": "Proteja os dados de uma CLI",
    "instructions": [
      "Separe argv, regra de domínio e adapter de filesystem.",
      "Injete o repositório e mantenha os arquivos de teste em diretório temporário.",
      "Teste adicionar, listar e remover; depois simule arquivo ausente e JSON corrompido.",
      "Depois do primer de Git, inicie o histórico no projeto exportado e revise status e diff."
    ],
    "commands": [
      [
        "npm",
        "test"
      ]
    ],
    "powershellCommands": [
      [
        "npm",
        "test"
      ]
    ],
    "expected": [
      "Comandos e argumentos chamam as regras corretas.",
      "Arquivo ausente/corrompido retorna erro contextual e causa.",
      "Falha não sobrescreve dados nem escreve fora do temp de teste."
    ],
    "troubleshooting": [
      "Verifique se filesystem só é acessado no adapter.",
      "Use uma instância de repositório isolada por teste.",
      "Preserve o conteúdo original quando parse ou gravação falhar."
    ],
    "evidence": [
      "resultado de testes",
      "typecheck quando declarado",
      "casos de erro contextual",
      "diff e status da cópia de prática"
    ],
    "gitStep": {
      "required": true,
      "afterPrimer": true,
      "steps": [
        "git init",
        "git status --short",
        "git add README.md package.json src test",
        "git commit -m \"checkpoint: baseline\"",
        "faça uma alteração pequena no README.md",
        "git diff --check",
        "git diff",
        "git add README.md",
        "git commit -m \"checkpoint: ajuste pequeno\"",
        "git status --short",
        "git log -2 --oneline"
      ]
    },
    "package": {
      "name": "devpath-14-08",
      "version": "1.0.0",
      "private": true,
      "type": "module",
      "engines": {
        "node": ">=24.0.0"
      },
      "scripts": {
        "test": "node --test test/*.test.js"
      }
    },
    "packageLock": {
      "name": "devpath-14-08",
      "version": "1.0.0",
      "lockfileVersion": 3,
      "packages": {
        "": {
          "name": "devpath-14-08",
          "version": "1.0.0"
        }
      }
    },
    "referenceActivityIds": [
      "14.05"
    ],
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Revise o diff autoral e registre de 3 a 5 comentários priorizados quando houver uma segunda pessoa disponível.",
        "Responda a cada comentário recebido com decisão e justificativa ligada ao contrato.",
        "Se não houver revisor humano, declare a limitação e faça uma auto-revisão identificada como tal."
      ]
    }
  },
  {
    "id": "14.14",
    "stage": "14",
    "activityIds": [
      "14.14"
    ],
    "environment": "local",
    "title": "TypeScript local: execução e typecheck",
    "instructions": [
      "npm test",
      "npm run typecheck",
      "saída de node src/index.ts",
      "comparação explicada entre Node, tsc, tsx e bundler"
    ],
    "commands": [
      [
        "npm",
        "ci"
      ],
      [
        "npm",
        "test"
      ],
      [
        "npm",
        "run",
        "typecheck"
      ],
      [
        "node",
        "src/index.ts"
      ]
    ],
    "expected": [
      "npm test",
      "npm run typecheck",
      "saída de node src/index.ts",
      "comparação explicada entre Node, tsc, tsx e bundler"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "npm test",
      "npm run typecheck",
      "saída de node src/index.ts",
      "comparação explicada entre Node, tsc, tsx e bundler"
    ],
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Confirme que erasableSyntaxOnly está habilitado.",
        "Registre separadamente saída de Node e diagnóstico de tsc.",
        "Justifique quando tsx ou bundler seria necessário."
      ]
    }
  },
  {
    "id": "14.15",
    "stage": "14",
    "activityIds": [
      "14.15"
    ],
    "environment": "local",
    "title": "Lint e formatação locais",
    "instructions": [
      "regra de lint escolhida e causa corrigida",
      "npm run lint",
      "npm run format:check",
      "diferença entre lint e formatação explicada"
    ],
    "commands": [
      [
        "npm",
        "install",
        "-D",
        "eslint@^9",
        "prettier"
      ],
      [
        "npm",
        "run",
        "lint"
      ],
      [
        "npm",
        "run",
        "format:check"
      ]
    ],
    "expected": [
      "regra de lint escolhida e causa corrigida",
      "npm run lint",
      "npm run format:check",
      "diferença entre lint e formatação explicada"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "regra de lint escolhida e causa corrigida",
      "npm run lint",
      "npm run format:check",
      "diferença entre lint e formatação explicada"
    ],
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Leia a regra do ESLint que sinaliza a violação.",
        "Corrija a causa e execute lint.",
        "Rode Prettier separadamente e explique o limite da formatação."
      ]
    }
  },
  {
    "id": "14.16",
    "stage": "14",
    "activityIds": [
      "14.16"
    ],
    "environment": "local",
    "title": "Vite do primeiro servidor ao build",
    "instructions": [
      "npm run dev e URL local",
      "página abriu no navegador",
      "npm run build e arquivos em dist/",
      "diferença entre servidor e artefato explicada"
    ],
    "commands": [
      [
        "npm",
        "install",
        "-D",
        "vite"
      ],
      [
        "npm",
        "run",
        "dev"
      ],
      [
        "npm",
        "run",
        "build"
      ]
    ],
    "expected": [
      "npm run dev e URL local",
      "página abriu no navegador",
      "npm run build e arquivos em dist/",
      "diferença entre servidor e artefato explicada"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "npm run dev e URL local",
      "página abriu no navegador",
      "npm run build e arquivos em dist/",
      "diferença entre servidor e artefato explicada"
    ],
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Rode o servidor dev e identifique o módulo servido.",
        "Gere dist e examine HTML e assets emitidos.",
        "Explique por que o servidor não substitui a inspeção do build."
      ]
    }
  },
  {
    "id": "14.17",
    "stage": "14",
    "activityIds": [
      "14.17"
    ],
    "environment": "local",
    "title": "CI mínima antes do PR",
    "instructions": [
      "saída dos três gates locais",
      "workflow com node 24 e npm ci",
      "CI verde após push/PR quando executada no GitHub",
      "limite da evidência registrado"
    ],
    "commands": [
      [
        "npm",
        "ci"
      ],
      [
        "npm",
        "run",
        "lint"
      ],
      [
        "npm",
        "run",
        "typecheck"
      ],
      [
        "npm",
        "test"
      ]
    ],
    "expected": [
      "saída dos três gates locais",
      "workflow com node 24 e npm ci",
      "CI verde após push/PR quando executada no GitHub",
      "limite da evidência registrado"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "saída dos três gates locais",
      "workflow com node 24 e npm ci",
      "CI verde após push/PR quando executada no GitHub",
      "limite da evidência registrado"
    ],
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Rode localmente os mesmos scripts do workflow.",
        "Confira ordem, versão do Node e instalação reproduzível.",
        "Registre separadamente o que foi verificado localmente e o que só roda no GitHub."
      ]
    }
  },
  {
    "id": "14.18",
    "stage": "14",
    "activityIds": [
      "14.18"
    ],
    "environment": "local",
    "title": "Semver, lockfile e cadeia de suprimentos",
    "instructions": [
      "comparação escrita de ^, ~ e major",
      "npm ci e npm audit observados",
      "lockfile revisado",
      "postinstall analisado como dado sem executá-lo"
    ],
    "commands": [
      [
        "npm",
        "ci"
      ],
      [
        "npm",
        "audit"
      ]
    ],
    "expected": [
      "comparação escrita de ^, ~ e major",
      "npm ci e npm audit observados",
      "lockfile revisado",
      "postinstall analisado como dado sem executá-lo"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "comparação escrita de ^, ~ e major",
      "npm ci e npm audit observados",
      "lockfile revisado",
      "postinstall analisado como dado sem executá-lo"
    ],
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Compare uma faixa ^, uma faixa ~ e uma versão exata.",
        "Rode npm ci e npm audit e registre o que cada comando informa.",
        "Inspecione o exemplo postinstall como texto; não o instale."
      ]
    }
  },
  {
    "id": "15.08",
    "stage": "15",
    "activityIds": [
      "15.08"
    ],
    "environment": "typescript",
    "title": "Migre a paginação com segurança de tipos",
    "instructions": [
      "Mantenha o comportamento e os exports públicos enquanto migra o JavaScript para TypeScript.",
      "Execute testes runtime e typecheck strict.",
      "Explique a diferença entre erro de tipo e falha em runtime; crie uma variante independente de paginação.",
      "Depois do primer, repita status e diff; faça uma alteração pequena e reveja o patch."
    ],
    "commands": [
      [
        "npm",
        "test"
      ],
      [
        "npm",
        "run",
        "typecheck"
      ]
    ],
    "powershellCommands": [
      [
        "npm",
        "test"
      ],
      [
        "npm",
        "run",
        "typecheck"
      ]
    ],
    "expected": [
      "Testes runtime passam antes e depois da migração.",
      "TypeScript strict termina sem erros.",
      "A transferência cobre limites próprios sem casts injustificados."
    ],
    "troubleshooting": [
      "O checker instalado é TypeScript 6.0.3 e funciona como proxy limitado para o TypeScript 7.0 do curso.",
      "Type erasure não valida valores externos em runtime.",
      "Preserve exports, erros e testes antigos."
    ],
    "evidence": [
      "resultado de npm test",
      "versão do tsc e resultado do typecheck",
      "diff pequeno",
      "transferência independente sem ajuda"
    ],
    "gitStep": {
      "required": true,
      "afterPrimer": true,
      "steps": [
        "git status --short",
        "git diff --check",
        "git diff",
        "git switch -c change-requirement",
        "faça uma alteração pequena no teste ou README",
        "git diff --check",
        "git diff",
        "git add README.md test",
        "git commit -m \"checkpoint: ajuste tipado\"",
        "git show --stat --oneline HEAD",
        "revise o diff e explique o impacto sobre o comportamento"
      ]
    },
    "courseTypescript": "7.0",
    "package": {
      "name": "devpath-15-08",
      "version": "1.0.0",
      "private": true,
      "type": "module",
      "engines": {
        "node": ">=24.0.0"
      },
      "scripts": {
        "test": "node --test paginacao.test.js",
        "typecheck": "tsc --noEmit -p tsconfig.json"
      },
      "devDependencies": {
        "@types/node": "24.19.1",
        "typescript": "6.0.3"
      }
    },
    "packageLock": {
      "name": "devpath-15-08",
      "version": "1.0.0",
      "lockfileVersion": 3,
      "packages": {
        "": {
          "name": "devpath-15-08",
          "version": "1.0.0",
          "devDependencies": {
            "@types/node": "24.19.1",
            "typescript": "6.0.3"
          }
        },
        "node_modules/@types/node": {
          "version": "24.19.1",
          "resolved": "https://registry.npmjs.org/@types/node/-/node-24.19.1.tgz",
          "integrity": "sha512-aS3/DG0oM05K0RIXXP+hKjinGG5IgSSVGzswZxW3O0sS3pH4/fycXundUC9XsszgKCk4gHXylTEK6hyFxVxnoQ==",
          "dev": true,
          "license": "MIT",
          "dependencies": {
            "undici-types": ">=7.24.0 <7.24.7"
          }
        },
        "node_modules/typescript": {
          "version": "6.0.3",
          "resolved": "https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz",
          "integrity": "sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==",
          "dev": true,
          "license": "Apache-2.0",
          "bin": {
            "tsc": "bin/tsc",
            "tsserver": "bin/tsserver"
          },
          "engines": {
            "node": ">=14.17"
          }
        },
        "node_modules/undici-types": {
          "version": "7.24.6",
          "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.24.6.tgz",
          "integrity": "sha512-WRNW+sJgj5OBN4/0JpHFqtqzhpbnV0GuB+OozA9gCL7a993SmU+1JBZCzLNxYsbMfIeDL+lTsphD5jN5N+n0zg==",
          "dev": true,
          "license": "MIT"
        }
      }
    },
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Revise o diff autoral e registre de 3 a 5 comentários priorizados quando houver uma segunda pessoa disponível.",
        "Responda a cada comentário recebido com decisão e justificativa ligada ao contrato.",
        "Se não houver revisor humano, declare a limitação e faça uma auto-revisão identificada como tal."
      ]
    }
  },
  {
    "id": "21.12",
    "stage": "21",
    "activityIds": [
      "21.12"
    ],
    "environment": "local",
    "title": "DevTools Performance: grave e formule hipótese",
    "instructions": [
      "npm test",
      "gravação Performance com cenário repetível",
      "marks e trabalho de layout interpretados",
      "hipótese e limites da medida declarados"
    ],
    "commands": [
      [
        "npm",
        "test"
      ],
      [
        "node",
        "src/server.mjs"
      ]
    ],
    "expected": [
      "npm test",
      "gravação Performance com cenário repetível",
      "marks e trabalho de layout interpretados",
      "hipótese e limites da medida declarados"
    ],
    "troubleshooting": [
      "Use uma cópia exportada fora do repositório do curso.",
      "Confira o diretório atual antes de executar comandos.",
      "A checagem automatizada roda apenas os comandos declarados na referência limpa."
    ],
    "evidence": [
      "npm test",
      "gravação Performance com cenário repetível",
      "marks e trabalho de layout interpretados",
      "hipótese e limites da medida declarados"
    ],
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Grave a mesma interação no mesmo ambiente.",
        "Localize as User Timing marks e categorias de trabalho na gravação.",
        "Registre hipótese, evidência e limite; repita após uma mudança pequena."
      ]
    }
  },
  {
    "id": "23.08",
    "stage": "23",
    "activityIds": [
      "23.08"
    ],
    "environment": "local",
    "title": "Teste um adapter de armazenamento",
    "instructions": [
      "Execute os testes de contrato com o adapter em memória.",
      "Valide entrada unknown antes de mutar o domínio; confira restart e migração.",
      "Explique as decisões de fronteira e a causa do erro de storage.",
      "Depois do primer, pratique branch, diff, merge, conflito deliberado e revisão apenas na cópia temporária.",
      "O starter atual não contém UI; não existe requisito de acessibilidade de tela nesta atividade."
    ],
    "commands": [
      [
        "npm",
        "test"
      ],
      [
        "npm",
        "run",
        "typecheck"
      ]
    ],
    "powershellCommands": [
      [
        "npm",
        "test"
      ],
      [
        "npm",
        "run",
        "typecheck"
      ]
    ],
    "expected": [
      "Teste de contrato passa com memória.",
      "Domínio não depende de DOM ou fetch.",
      "Entrada inválida e falha de storage não deixam estado parcial.",
      "Transferência troca adapter sem mudar domínio."
    ],
    "troubleshooting": [
      "Valide unknown em runtime antes da mutação.",
      "Preserve a causa original no erro de storage.",
      "Não invente cobertura de browser ou acessibilidade sem UI."
    ],
    "evidence": [
      "testes de contrato",
      "versão do tsc e typecheck",
      "duas decisões arquiteturais",
      "diff e revisão da variante independente"
    ],
    "gitStep": {
      "required": true,
      "afterPrimer": true,
      "steps": [
        "confirme que está na cópia temporária e anote o resultado de git branch --show-current",
        "git status --short",
        "git diff --check",
        "git switch -c change-requirement",
        "faça uma alteração pequena e registre-a",
        "git diff --check",
        "git diff",
        "git add README.md src test",
        "git commit -m \"checkpoint: requisito novo\"",
        "volte para a branch inicial anotada",
        "git merge --no-ff change-requirement",
        "crie um conflito deliberado em README.md na cópia temporária, resolva-o e revise o diff",
        "git add README.md",
        "git commit -m \"checkpoint: conflito resolvido\"",
        "git status --short",
        "git show --stat --oneline HEAD",
        "revise commits e explique a resolução"
      ]
    },
    "courseTypescript": "7.0",
    "package": {
      "name": "devpath-23-08",
      "version": "1.0.0",
      "private": true,
      "type": "module",
      "engines": {
        "node": ">=24.0.0"
      },
      "scripts": {
        "test": "node --test \"test/**/*.test.ts\"",
        "typecheck": "tsc --noEmit -p tsconfig.json"
      },
      "devDependencies": {
        "@types/node": "24.19.1",
        "typescript": "6.0.3"
      }
    },
    "packageLock": {
      "name": "devpath-23-08",
      "version": "1.0.0",
      "lockfileVersion": 3,
      "packages": {
        "": {
          "name": "devpath-23-08",
          "version": "1.0.0",
          "devDependencies": {
            "@types/node": "24.19.1",
            "typescript": "6.0.3"
          }
        },
        "node_modules/@types/node": {
          "version": "24.19.1",
          "resolved": "https://registry.npmjs.org/@types/node/-/node-24.19.1.tgz",
          "integrity": "sha512-aS3/DG0oM05K0RIXXP+hKjinGG5IgSSVGzswZxW3O0sS3pH4/fycXundUC9XsszgKCk4gHXylTEK6hyFxVxnoQ==",
          "dev": true,
          "license": "MIT",
          "dependencies": {
            "undici-types": ">=7.24.0 <7.24.7"
          }
        },
        "node_modules/typescript": {
          "version": "6.0.3",
          "resolved": "https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz",
          "integrity": "sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==",
          "dev": true,
          "license": "Apache-2.0",
          "bin": {
            "tsc": "bin/tsc",
            "tsserver": "bin/tsserver"
          },
          "engines": {
            "node": ">=14.17"
          }
        },
        "node_modules/undici-types": {
          "version": "7.24.6",
          "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.24.6.tgz",
          "integrity": "sha512-WRNW+sJgj5OBN4/0JpHFqtqzhpbnV0GuB+OozA9gCL7a993SmU+1JBZCzLNxYsbMfIeDL+lTsphD5jN5N+n0zg==",
          "dev": true,
          "license": "MIT"
        }
      }
    },
    "evidenceLabel": "learner-declared",
    "reviewStep": {
      "required": true,
      "steps": [
        "Revise o diff autoral e registre de 3 a 5 comentários priorizados quando houver uma segunda pessoa disponível.",
        "Responda a cada comentário recebido com decisão e justificativa ligada ao contrato.",
        "Se não houver revisor humano, declare a limitação e faça uma auto-revisão identificada como tal."
      ]
    }
  }
]);
  const byId = new Map(targets.map(target => [target.id, target]));
  const api = Object.freeze({
    targets,
    byId(id) { return byId.get(String(id)); },
    gitStepFor(id) { return byId.get(String(id))?.gitStep; }
  });
  if (root) root.DevPathLocalCheckpoints = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : this);
