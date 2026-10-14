(function attachLocalCheckpoints(root) {
  // Mirror of output/learning-execution/task-12-checkpoints.json (targets only).
  // scripts/test-project-export.mjs fails if this mirror drifts from that source.
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
      }
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
      }
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
        "required": false,
        "reason": "A prática de interface local precede o primer de Git."
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
