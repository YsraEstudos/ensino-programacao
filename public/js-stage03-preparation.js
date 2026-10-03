// Generated from course-src/stage03-preparation.mjs + stage03-contract.mjs; edit the editorial source.
globalThis.DevPathStage03Preparation = {
  "03.04": {
    "teaching": {
      "title": "Escolher um caminho com if e else",
      "paragraphs": [
        "Uma decisão começa com uma condição entre parênteses. Se ela for verdadeira, o bloco logo depois é executado; se for falsa, o programa procura o else ou a próxima condição da cadeia.",
        "Em uma cadeia if/else if, os testes são avaliados de cima para baixo e somente o primeiro ramo verdadeiro é escolhido. Uma guarda trata valores inválidos antes das faixas válidas; depois, cada teste pode usar um limite superior e o else recebe o restante.",
        "Escreva a condição em palavras antes de escolher < ou <=. Teste um valor imediatamente abaixo, o valor no corte e um valor imediatamente acima. Assim você descobre a qual intervalo a igualdade pertence.",
        "As chaves { e } delimitam as instruções do ramo. if (condição) { ação; } pode ter else { alternativa; }; else if acrescenta outro teste. Você já aprendeu comparações e || na Etapa 02: nota < 0 || nota > 100 aceita qualquer uma das duas situações inválidas."
      ],
      "code": "const temperatura = 28;\nlet aviso = \"\";\nif (temperatura < 10) {\n  aviso = \"frio\";\n} else if (temperatura < 25) {\n  aviso = \"ameno\";\n} else {\n  aviso = \"quente\";\n}\nconsole.log(aviso);",
      "walkthrough": [
        "temperatura vale 28, então o teste temperatura < 10 falha.",
        "O teste temperatura < 25 também falha; o programa chega ao else.",
        "aviso recebe \"quente\" e o console imprime essa string. O else não precisa de uma nova condição."
      ],
      "pitfall": "Trocar a ordem das faixas ou usar <= sem reavaliar o corte desloca exatamente os valores de fronteira.",
      "next": "Depois de prever cada corte, complete o classificador e confira 0, 20, 40, 60, 80, 100 e um valor inválido."
    },
    "starter": "const nota = 20;\nlet faixa = \"\";\nif (nota < 0 || nota > 100) {\n  faixa = \"inválida\";\n} else if (nota < 20) {\n  faixa = \"E\";\n} else if (/* complete a próxima faixa */) {\n  faixa = \"D\";\n} else {\n  faixa = \"A\";\n}\nconsole.log(faixa);",
    "hints": [
      "Escreva em palavras os intervalos que ainda faltam entre 20 e 100.",
      "Use limites crescentes: cada teste recebe valores que falharam nos anteriores.",
      "Para 0–100 com cortes de 20, use <40, <60, <80 e deixe o else para A."
    ],
    "reflectionPrompt": "Explique por que a guarda vem antes das faixas e em qual ramo entram 20 e 80.",
    "rubric": [
      "Mantive a guarda para valores menores que 0 ou maiores que 100.",
      "Usei limites crescentes sem lacunas nem sobreposição.",
      "Conferi pelo menos um valor abaixo, no corte e acima de uma fronteira."
    ],
    "secondaryPractice": {
      "title": "Miniprática: escolher um estado com switch",
      "prompt": "Complete o switch: estado \"aberto\" imprime \"aberto\", \"fechado\" imprime \"fechado\", qualquer outro imprime \"desconhecido\". Use case, default e break como no exemplo.",
      "demonstration": {
        "code": "const estado = \"aberto\";\nlet mensagem = \"\";\nswitch (estado) {\n  case \"aberto\":\n    mensagem = \"aberto\";\n    break;\n  case \"fechado\":\n    mensagem = \"fechado\";\n    break;\n  default:\n    mensagem = \"desconhecido\";\n}\nconsole.log(mensagem);",
        "walkthrough": [
          "switch compara o valor de estado com cada case usando comparação estrita.",
          "Quando um case coincide, seu bloco executa; break encerra o switch antes do próximo case.",
          "default trata qualquer valor sem case correspondente."
        ]
      },
      "starter": "const estado = \"aberto\";\nlet mensagem = \"\";\nswitch (estado) {\n  // escreva cases para aberto e fechado e um default\n}\nconsole.log(mensagem);",
      "fixtures": [
        {
          "input": {
            "estado": "aberto"
          },
          "logs": [
            [
              "aberto"
            ]
          ],
          "variables": {}
        },
        {
          "input": {
            "estado": "fechado"
          },
          "logs": [
            [
              "fechado"
            ]
          ],
          "variables": {}
        },
        {
          "input": {
            "estado": "pausado"
          },
          "logs": [
            [
              "desconhecido"
            ]
          ],
          "variables": {}
        }
      ]
    },
    "transfer": {
      "prompt": "Classifique uma idade nas faixas 0–12, 13–17 e 18 ou mais. Teste 12, 13, 17 e 18 antes de executar. Imprima \"criança\", \"adolescente\" ou \"adulto\" em console.log(faixa).",
      "starter": "const idade = 13;\nlet faixa = \"\";\n// escreva a cadeia de decisões\nconsole.log(faixa);",
      "fixtures": [
        {
          "input": {
            "idade": 12
          },
          "logs": [
            [
              "criança"
            ]
          ],
          "variables": {}
        },
        {
          "input": {
            "idade": 13
          },
          "logs": [
            [
              "adolescente"
            ]
          ],
          "variables": {}
        },
        {
          "input": {
            "idade": 17
          },
          "logs": [
            [
              "adolescente"
            ]
          ]
        },
        {
          "input": {
            "idade": 18
          },
          "logs": [
            [
              "adulto"
            ]
          ],
          "variables": {}
        }
      ]
    },
    "table": {
      "caption": "Decisões nas fronteiras: escreva a faixa (E, D, C, B, A ou inválida).",
      "columns": [
        "Faixa prevista"
      ],
      "rows": [
        {
          "label": -1,
          "expected": [
            "inválida"
          ]
        },
        {
          "label": 0,
          "expected": [
            "E"
          ]
        },
        {
          "label": 20,
          "expected": [
            "D"
          ]
        },
        {
          "label": 40,
          "expected": [
            "C"
          ]
        },
        {
          "label": 80,
          "expected": [
            "A"
          ]
        },
        {
          "label": 100,
          "expected": [
            "A"
          ]
        },
        {
          "label": 101,
          "expected": [
            "inválida"
          ]
        }
      ]
    },
    "fixtures": [
      {
        "input": {
          "nota": -1
        },
        "logs": [
          [
            "inválida"
          ]
        ]
      },
      {
        "input": {
          "nota": 0
        },
        "logs": [
          [
            "E"
          ]
        ]
      },
      {
        "input": {
          "nota": 19
        },
        "logs": [
          [
            "E"
          ]
        ]
      },
      {
        "input": {
          "nota": 20
        },
        "logs": [
          [
            "D"
          ]
        ]
      },
      {
        "input": {
          "nota": 39
        },
        "logs": [
          [
            "D"
          ]
        ]
      },
      {
        "input": {
          "nota": 40
        },
        "logs": [
          [
            "C"
          ]
        ]
      },
      {
        "input": {
          "nota": 59
        },
        "logs": [
          [
            "C"
          ]
        ]
      },
      {
        "input": {
          "nota": 60
        },
        "logs": [
          [
            "B"
          ]
        ]
      },
      {
        "input": {
          "nota": 79
        },
        "logs": [
          [
            "B"
          ]
        ]
      },
      {
        "input": {
          "nota": 80
        },
        "logs": [
          [
            "A"
          ]
        ]
      },
      {
        "input": {
          "nota": 100
        },
        "logs": [
          [
            "A"
          ]
        ]
      },
      {
        "input": {
          "nota": 101
        },
        "logs": [
          [
            "inválida"
          ]
        ]
      }
    ],
    "readonly": false
  },
  "03.05": {
    "teaching": {
      "title": "Testar o valor que separa duas regras",
      "paragraphs": [
        "Um teste de fronteira escolhe entradas que distinguem operadores vizinhos. Para uma regra >= L, use L-1, L e L+1: o valor anterior deve falhar, a igualdade deve passar e o seguinte também deve passar.",
        "Para <= L, a igualdade passa e L+1 falha. Para > L, L ainda falha e L+1 passa. O resultado no corte é a evidência que revela se a implementação incluiu a igualdade.",
        "Registre a entrada e o resultado esperado antes de rodar. Um caso distante da fronteira pode passar mesmo quando o operador foi trocado."
      ],
      "code": "const limite = 3;\nconst tentativas = 3;\nconsole.log(tentativas <= limite);\nconsole.log(tentativas === limite);\nconsole.log(tentativas > limite);",
      "walkthrough": [
        "tentativas e limite valem 3, portanto tentativas <= limite é true.",
        "A igualdade também é true, confirmando que o limite está incluído.",
        "A comparação estrita tentativas > limite é false no próprio corte."
      ],
      "pitfall": "Escolher apenas valores aprovados ou apenas valores muito distantes não distingue >= de > nem <= de <.",
      "next": "Monte uma linha abaixo/no/acima para cada regra e escreva o resultado booleano de cada célula."
    },
    "starter": "const total = 100;\nconst idade = 18;\nconst peso = 5;\n// escreva os casos de teste abaixo, no corte e acima\nconsole.log(total, idade, peso);",
    "hints": [
      "Comece pelo número exato escrito no contrato.",
      "Coloque um valor imediatamente menor e outro imediatamente maior.",
      "Na igualdade, explique se o operador inclui ou exclui o corte."
    ],
    "reflectionPrompt": "Explique como um único valor de igualdade denuncia a troca entre >= e >.",
    "rubric": [
      "Registrei abaixo, no corte e acima para as três regras.",
      "Escrevi os resultados esperados antes de executar.",
      "Expliquei o papel da igualdade em pelo menos uma regra."
    ],
    "transfer": {
      "prompt": "Escreva testes para o contrato prazo < 7 usando 6, 7 e 8 e justifique o resultado do valor 7.",
      "starter": "const prazo = 7;\n// registre os três casos de fronteira\nconsole.log(prazo < 7);",
      "fixtures": [
        {
          "input": {
            "prazo": 6
          },
          "logs": [
            [
              true
            ]
          ],
          "variables": {}
        },
        {
          "input": {
            "prazo": 7
          },
          "logs": [
            [
              false
            ]
          ],
          "variables": {}
        },
        {
          "input": {
            "prazo": 8
          },
          "logs": [
            [
              false
            ]
          ],
          "variables": {}
        }
      ]
    },
    "table": {
      "caption": "Abaixo, no corte e acima: escreva true ou false para cada resultado.",
      "columns": [
        "Abaixo",
        "No corte",
        "Acima"
      ],
      "rows": [
        {
          "label": "total >= 100: 99 / 100 / 101",
          "expected": [
            "false",
            "true",
            "true"
          ]
        },
        {
          "label": "idade >= 18: 17 / 18 / 19",
          "expected": [
            "false",
            "true",
            "true"
          ]
        },
        {
          "label": "peso <= 5: 4 / 5 / 6",
          "expected": [
            "true",
            "true",
            "false"
          ]
        },
        {
          "label": "x > 0: -1 / 0 / 1",
          "expected": [
            "false",
            "false",
            "true"
          ]
        }
      ]
    },
    "fixtures": [],
    "readonly": false
  },
  "03.01": {
    "teaching": {
      "title": "Ler as quatro partes de um for",
      "paragraphs": [
        "Um for reúne inicialização, teste, corpo e atualização. A inicialização ocorre uma vez; antes de cada passagem o teste é avaliado; depois do corpo vem a atualização; só então o teste decide se haverá outra passagem.",
        "Um contador responde quantas vezes ou quais valores visitamos. Um acumulador conserva um resultado parcial, como uma soma, e recebe o estado anterior mais a contribuição da passagem atual.",
        "A condição falsa também é um estado importante. Se i chega a 4 e o corpo termina, i++ produz 5; como 5 <= 4 é falso, não existe uma quinta linha de saída.",
        "Aqui os loops usam números e estado simples. for...of será apresentado depois, junto com coleções, para não misturar repetição com a habilidade de percorrer arrays.",
        "No cabeçalho for (let i = 1; i <= 4; i++), os dois pontos e vírgulas separam início, teste e atualização. i++ soma uma unidade; total += i equivale a total = total + i. As chaves contêm o corpo repetido. i existe apenas dentro desse for; total, declarado fora, conserva a soma depois dele."
      ],
      "code": "let soma = 0;\nfor (let i = 2; i <= 4; i++) {\n  soma += i;\n  console.log(i, soma);\n}",
      "walkthrough": [
        "A inicialização cria i=2 e soma=0.",
        "A primeira passagem soma 2 e imprime 2, 2; a segunda soma 3 e imprime 3, 5; a terceira soma 4 e imprime 4, 9.",
        "Depois da terceira passagem i vira 5. O teste 5 <= 4 falha e o corpo não executa de novo."
      ],
      "pitfall": "Ler i++ como se acontecesse antes do primeiro teste ou esquecer que o acumulador recebe o total anterior muda toda a tabela.",
      "next": "Preencha a tabela das quatro passagens do desafio e inclua a verificação final que não entra no corpo."
    },
    "starter": "let total = 0;\nfor (let i = 1; i <= 4; i++) {\n  total += i;\n  console.log(i, total);\n}",
    "hints": [
      "Faça uma linha para cada execução do corpo.",
      "Atualize total antes de registrar a saída daquela passagem.",
      "Depois de i=4, aplique i++ e escreva por que a condição seguinte falha."
    ],
    "reflectionPrompt": "Explique a diferença entre o contador i e o acumulador total e por que não há uma quinta saída.",
    "rubric": [
      "Registrei i e total após cada passagem.",
      "Expliquei a ordem corpo, atualização e novo teste.",
      "Identifiquei o estado que torna a condição falsa."
    ],
    "readonly": true,
    "transfer": {
      "prompt": "Trace manualmente a soma de 2 a 4 e registre o par (i,total) após cada passagem.",
      "starter": "let total = 0;\nfor (let i = 2; i <= 4; i++) {\n  total += i;\n  console.log(i, total);\n}",
      "fixtures": [
        {
          "input": {},
          "logs": [
            [
              2,
              2
            ],
            [
              3,
              5
            ],
            [
              4,
              9
            ]
          ],
          "variables": {}
        }
      ]
    },
    "table": {
      "caption": "Uma linha por passagem; registre total antes e depois da soma.",
      "columns": [
        "Total antes",
        "Total depois"
      ],
      "rows": [
        {
          "label": 1,
          "expected": [
            "0",
            "1"
          ]
        },
        {
          "label": 2,
          "expected": [
            "1",
            "3"
          ]
        },
        {
          "label": 3,
          "expected": [
            "3",
            "6"
          ]
        },
        {
          "label": 4,
          "expected": [
            "6",
            "10"
          ]
        },
        {
          "label": "i = 5: condição falsa, corpo não executado",
          "expected": [
            "10",
            "10"
          ]
        }
      ]
    },
    "fixtures": [
      {
        "input": {},
        "logs": [
          [
            1,
            1
          ],
          [
            2,
            3
          ],
          [
            3,
            6
          ],
          [
            4,
            10
          ]
        ]
      }
    ]
  },
  "03.02": {
    "teaching": {
      "title": "Pular uma passagem com continue",
      "paragraphs": [
        "continue encerra somente a passagem atual. Ele pula o restante do corpo e segue para a atualização prevista pelo for; o teste da próxima passagem ainda será feito.",
        "break tem outro efeito: encerra o laço inteiro. Compare os dois comandos em uma tabela de estado antes de usá-los em código.",
        "Em um while, continue não atualiza nada automaticamente. Se a condição depende de uma variável que não muda antes do continue, o laço pode ficar preso."
      ],
      "code": "let soma = 0;\nfor (let i = 1; i <= 5; i++) {\n  if (i === 3) continue;\n  soma += i;\n}\nconsole.log(soma);",
      "walkthrough": [
        "i=1 e i=2 entram no acumulador; soma chega a 3.",
        "Em i=3, continue pula soma += i. O for ainda atualiza i para 4.",
        "i=4 e i=5 entram; a soma final é 12. Se fosse break em i=3, o laço terminaria com soma 3."
      ],
      "pitfall": "Dizer que continue “para o loop” confunde uma passagem pulada com a saída completa e costuma esconder a atualização do contador.",
      "next": "Marque cada passagem como soma, pula ou encerra e depois compare continue com break."
    },
    "starter": "let soma = 0;\nfor (let i = 1; i <= 5; i++) {\n  if (i % 2 === 0) continue;\n  soma += i;\n}\nconsole.log(soma);",
    "hints": [
      "Liste i=1,2,3,4,5 antes de decidir o resultado.",
      "Nos pares, marque que somente o restante do corpo é pulado.",
      "O for continua atualizando i depois de cada continue."
    ],
    "reflectionPrompt": "Explique o que continue pula, o que ainda acontece no for e como break mudaria o mesmo percurso.",
    "rubric": [
      "Marquei corretamente as passagens puladas.",
      "Expliquei que a atualização do for continua depois de continue.",
      "Comparei continue e break com um efeito observável."
    ],
    "readonly": true,
    "transfer": {
      "prompt": "Percorra 1..6, some somente os múltiplos de 3 usando continue e explique o avanço do contador.",
      "starter": "let soma = 0;\nfor (let i = 1; i <= 6; i++) {\n  // complete a condição que pula os demais valores\n}\nconsole.log(soma);",
      "fixtures": [
        {
          "input": {},
          "logs": [
            [
              9
            ]
          ],
          "variables": {}
        }
      ]
    },
    "table": {
      "caption": "Em cada passagem: soma ou pula? Qual soma fica armazenada?",
      "columns": [
        "soma ou pula",
        "Soma depois"
      ],
      "rows": [
        {
          "label": 1,
          "expected": [
            "soma",
            "1"
          ]
        },
        {
          "label": 2,
          "expected": [
            "pula",
            "1"
          ]
        },
        {
          "label": 3,
          "expected": [
            "soma",
            "4"
          ]
        },
        {
          "label": 4,
          "expected": [
            "pula",
            "4"
          ]
        },
        {
          "label": 5,
          "expected": [
            "soma",
            "9"
          ]
        }
      ]
    },
    "fixtures": [
      {
        "input": {},
        "logs": [
          [
            9
          ]
        ]
      }
    ]
  },
  "03.03": {
    "teaching": {
      "title": "Ordenar regras sobrepostas",
      "paragraphs": [
        "Em if/else if, o primeiro ramo verdadeiro impede que os ramos seguintes sejam avaliados para aquele valor. Por isso a condição mais específica deve vir antes da condição mais ampla.",
        "Uma regra combinada, como ser múltiplo de 3 e de 5, precisa aparecer antes de “múltiplo de 3” e “múltiplo de 5”. Caso contrário, 15 recebe apenas uma etiqueta e nunca chega à combinação.",
        "Depois de ordenar, confira um caso de cada ramo e um caso de sobreposição. O restante precisa continuar explícito no else."
      ],
      "code": "const numero = 15;\nlet rotulo = \"\";\nif (numero % 3 === 0 && numero % 5 === 0) {\n  rotulo = \"ambos\";\n} else if (numero % 3 === 0) {\n  rotulo = \"três\";\n} else if (numero % 5 === 0) {\n  rotulo = \"cinco\";\n} else {\n  rotulo = \"nenhum\";\n}\nconsole.log(rotulo);",
      "walkthrough": [
        "15 é divisível por 3 e por 5, então a primeira condição é verdadeira.",
        "O ramo “ambos” executa e os demais ramos não são tentados para esse número.",
        "Se o ramo de 3 viesse primeiro, 15 seria capturado cedo demais."
      ],
      "pitfall": "Ordenar as condições pela ordem do enunciado, em vez de pela especificidade, esconde os casos combinados.",
      "next": "Reordene os blocos do desafio e escreva quais valores testam a combinação e cada caso individual."
    },
    "starter": "// Os blocos abaixo devem ser ordenados antes da execução.\n// Registre a ordem escolhida no campo de reflexão.",
    "hints": [
      "Comece pela condição que exige duas coisas ao mesmo tempo.",
      "Depois coloque os testes individuais.",
      "Deixe o caso restante por último."
    ],
    "reflectionPrompt": "Explique por que a condição de divisibilidade por 15 precisa vir antes das condições de divisibilidade por 3 ou por 5.",
    "rubric": [
      "Coloquei a combinação antes das condições individuais.",
      "Mantive um caso restante para valores sem regra especial.",
      "Conferi 1, 3, 5 e 15."
    ],
    "parsons": {
      "blocks": [
        {
          "id": "both",
          "condition": "i % 15 === 0",
          "value": "\"FizzBuzz\""
        },
        {
          "id": "three",
          "condition": "i % 3 === 0",
          "value": "\"Fizz\""
        },
        {
          "id": "five",
          "condition": "i % 5 === 0",
          "value": "\"Buzz\""
        },
        {
          "id": "other",
          "condition": null,
          "value": "i"
        }
      ],
      "initialOrder": [
        "three",
        "five",
        "both",
        "other"
      ],
      "expectedOrder": [
        "both",
        "three",
        "five",
        "other"
      ]
    },
    "transfer": {
      "prompt": "Organize regras para Ping e Pong de 1 a 24: múltiplos de 4, de 6 e da combinação.",
      "starter": "for (let i = 1; i <= 24; i++) {\n  let rotulo = i;\n  // complete a cadeia de regras Ping/Pong\n  console.log(i, rotulo);\n}",
      "fixtures": [
        {
          "input": {},
          "logs": [
            [
              1,
              1
            ],
            [
              2,
              2
            ],
            [
              3,
              3
            ],
            [
              4,
              "Ping"
            ],
            [
              5,
              5
            ],
            [
              6,
              "Pong"
            ],
            [
              7,
              7
            ],
            [
              8,
              "Ping"
            ],
            [
              9,
              9
            ],
            [
              10,
              10
            ],
            [
              11,
              11
            ],
            [
              12,
              "PingPong"
            ],
            [
              13,
              13
            ],
            [
              14,
              14
            ],
            [
              15,
              15
            ],
            [
              16,
              "Ping"
            ],
            [
              17,
              17
            ],
            [
              18,
              "Pong"
            ],
            [
              19,
              19
            ],
            [
              20,
              "Ping"
            ],
            [
              21,
              21
            ],
            [
              22,
              22
            ],
            [
              23,
              23
            ],
            [
              24,
              "PingPong"
            ]
          ],
          "variables": {}
        }
      ]
    },
    "fixtures": [
      {
        "input": {},
        "logs": [
          [
            1
          ],
          [
            2
          ],
          [
            "Fizz"
          ],
          [
            4
          ],
          [
            "Buzz"
          ],
          [
            "Fizz"
          ],
          [
            7
          ],
          [
            8
          ],
          [
            "Fizz"
          ],
          [
            "Buzz"
          ],
          [
            11
          ],
          [
            "Fizz"
          ],
          [
            13
          ],
          [
            14
          ],
          [
            "FizzBuzz"
          ],
          [
            16
          ],
          [
            17
          ],
          [
            "Fizz"
          ],
          [
            19
          ],
          [
            "Buzz"
          ],
          [
            "Fizz"
          ],
          [
            22
          ],
          [
            23
          ],
          [
            "Fizz"
          ],
          [
            "Buzz"
          ],
          [
            26
          ],
          [
            "Fizz"
          ],
          [
            28
          ],
          [
            29
          ],
          [
            "FizzBuzz"
          ]
        ]
      }
    ],
    "readonly": false
  },
  "03.06": {
    "teaching": {
      "title": "Garantir progresso em while",
      "paragraphs": [
        "while testa a condição antes de cada passagem e não tem atualização automática. Cada caminho que pode repetir precisa mudar o estado usado pela condição.",
        "Se um continue acontece antes de fila--, a execução volta ao teste com fila igual a 2. A condição fila > 0 continua verdadeira e a mensagem se repete para sempre.",
        "break encerra o while imediatamente quando uma regra de parada antecipada foi encontrada. Ele não substitui a atualização necessária nos caminhos que continuam.",
        "No starter com erro: a primeira passagem muda fila de 3 para 2; a segunda entra no if, imprime \"pausa\" e pula fila--; a terceira começa outra vez em 2. O controle de repetição depende da mudança de estado, não da impressão de mensagens."
      ],
      "code": "let saldo = 3;\nwhile (saldo > 0) {\n  saldo--;\n  if (saldo === 1) break;\n}\nconsole.log(saldo);",
      "walkthrough": [
        "O teste inicial permite a passagem com saldo 3.",
        "saldo-- produz 2; como ainda não é 1, o while testa novamente.",
        "A próxima passagem produz 1 e break termina o laço; o console imprime 1."
      ],
      "pitfall": "Mover a atualização para depois de um continue cria um caminho que repete sem progresso; em while, isso precisa ser prevenido explicitamente.",
      "next": "Trace fila nos caminhos normal e continue, corrija o starter e prove que a fila chega a zero."
    },
    "starter": "let fila = 3;\nwhile (fila > 0) {\n  if (fila === 2) {\n    console.log(\"pausa\");\n    continue;\n  }\n  fila--;\n}\nconsole.log(fila);",
    "hints": [
      "Escreva fila no início de cada passagem.",
      "Pergunte qual linha muda fila quando fila===2.",
      "Faça fila-- ocorrer em todo caminho que continua ou reestruture o ramo."
    ],
    "reflectionPrompt": "Explique qual caminho fica sem progresso e como sua correção garante término.",
    "rubric": [
      "Reproduzi a repetição em fila=2.",
      "Identifiquei a variável que controla a condição.",
      "Corrigi o caminho sem progresso e confirmei a terminação."
    ],
    "secondaryPractice": {
      "title": "Miniprática: break numa busca",
      "prompt": "Percorra valor = 2 - i com i começando em zero. Ao encontrar valor < 0, guarde-o em encontrado e use break antes de i++. Imprima encontrado e i; o resultado esperado é -1 e 3.",
      "starter": "let encontrado = 0;\nlet i = 0;\nwhile (i < 4) {\n  const valor = 2 - i;\n  // registre o primeiro negativo e encerre imediatamente\n  i++;\n}\nconsole.log(encontrado, i);",
      "fixtures": [
        {
          "input": {},
          "logs": [
            [
              -1,
              3
            ]
          ],
          "variables": {}
        }
      ]
    },
    "transfer": {
      "prompt": "Corrija um loop de reembolso em que um ramo pula a redução do saldo; mostre que todo caminho que repete progride.",
      "starter": "let saldo = 3;\nwhile (saldo > 0) {\n  if (saldo === 2) {\n    continue;\n  }\n  saldo--;\n}\nconsole.log(saldo);",
      "fixtures": [
        {
          "input": {
            "saldo": 0
          },
          "logs": [
            [
              0
            ]
          ]
        },
        {
          "input": {
            "saldo": 3
          },
          "logs": [
            [
              0
            ]
          ]
        }
      ]
    },
    "table": {
      "caption": "Starter com erro: observe o estado antes e depois de cada passagem.",
      "columns": [
        "Fila antes",
        "Fila depois"
      ],
      "rows": [
        {
          "label": "Passagem 1",
          "expected": [
            "3",
            "2"
          ]
        },
        {
          "label": "Passagem 2",
          "expected": [
            "2",
            "2"
          ]
        },
        {
          "label": "Passagem 3",
          "expected": [
            "2",
            "2"
          ]
        }
      ]
    },
    "fixtures": [
      {
        "input": {
          "fila": 0
        },
        "variables": {
          "fila": 0
        },
        "logs": [
          [
            0
          ]
        ]
      },
      {
        "input": {
          "fila": 1
        },
        "variables": {
          "fila": 0
        },
        "logs": [
          [
            0
          ]
        ]
      },
      {
        "input": {
          "fila": 3
        },
        "variables": {
          "fila": 0
        },
        "logs": [
          [
            "pausa"
          ],
          [
            0
          ]
        ]
      },
      {
        "input": {
          "fila": 4
        },
        "variables": {
          "fila": 0
        },
        "logs": [
          [
            "pausa"
          ],
          [
            0
          ]
        ]
      }
    ],
    "readonly": false
  },
  "03.07": {
    "teaching": {
      "title": "Combinar condição e acumulador",
      "paragraphs": [
        "O loop visita cada inteiro de 1 até n, inclusive. O contador i representa o candidato atual; contagem representa quantos candidatos já satisfizeram a regra.",
        "A expressão i > limite && i % divisor === 0 exige as duas condições. O operador % produz resto zero quando i é divisível por divisor.",
        "A inicialização contagem=0 é o estado antes de qualquer candidato. Só some uma unidade quando o candidato passar pelos dois testes."
      ],
      "code": "const limite = 20;\nlet contagem = 0;\nfor (let i = 1; i <= 30; i++) {\n  if (i > limite && i % 4 === 0) contagem++;\n}\nconsole.log(contagem);",
      "walkthrough": [
        "i=20 falha em i > limite, mesmo sendo divisível por 4.",
        "i=24 e i=28 passam nos dois testes e aumentam contagem para 1 e depois 2.",
        "i=30 é visitado porque o intervalo é inclusivo, mas não altera contagem."
      ],
      "pitfall": "Usar >= inclui o próprio limite; usar i < n deixa de visitar o último candidato.",
      "next": "Escreva a condição composta e identifique o primeiro e o último valor visitados antes de editar."
    },
    "starter": "const n = 10;\nconst limite = 4;\nconst divisor = 2;\nlet contagem = 0;\nfor (let i = 1; i <= n; i++) {\n  // conte quando i é maior que limite e divisível por divisor\n}\nconsole.log(contagem);",
    "hints": [
      "O loop precisa visitar i=1 e também i=n.",
      "Use && para exigir as duas partes da regra.",
      "Divisibilidade por divisor é expressa por i % divisor === 0."
    ],
    "reflectionPrompt": "Explique por que o limite não entra e por que n entra no intervalo.",
    "rubric": [
      "Visitei o intervalo de 1 até n inclusive.",
      "Exigi simultaneamente i > limite e resto zero.",
      "Mantive contagem como acumulador iniciado em zero."
    ],
    "transfer": {
      "prompt": "Conte IDs maiores que 8 e divisíveis por 5 em uma linha de embalagens de 1 a 15.",
      "starter": "let contagem = 0;\nfor (let id = 1; id <= 15; id++) {\n  // complete a condição\n}\nconsole.log(contagem);",
      "fixtures": [
        {
          "input": {},
          "logs": [
            [
              2
            ]
          ]
        }
      ]
    },
    "table": {
      "caption": "Candidatos-chave: ambas as regras são verdadeiras? Escreva sim ou não.",
      "columns": [
        "Contado?"
      ],
      "rows": [
        {
          "label": 4,
          "expected": [
            "não"
          ]
        },
        {
          "label": 6,
          "expected": [
            "sim"
          ]
        },
        {
          "label": 8,
          "expected": [
            "sim"
          ]
        },
        {
          "label": 10,
          "expected": [
            "sim"
          ]
        }
      ]
    },
    "fixtures": [
      {
        "input": {
          "n": 10,
          "limite": 4,
          "divisor": 2
        },
        "logs": [
          [
            3
          ]
        ]
      },
      {
        "input": {
          "n": 10,
          "limite": 5,
          "divisor": 2
        },
        "logs": [
          [
            3
          ]
        ]
      },
      {
        "input": {
          "n": 10,
          "limite": 6,
          "divisor": 2
        },
        "logs": [
          [
            2
          ]
        ]
      },
      {
        "input": {
          "n": 0,
          "limite": 0,
          "divisor": 2
        },
        "logs": [
          [
            0
          ]
        ]
      },
      {
        "input": {
          "n": 10,
          "limite": 10,
          "divisor": 2
        },
        "logs": [
          [
            0
          ]
        ]
      },
      {
        "input": {
          "n": 15,
          "limite": 8,
          "divisor": 5
        },
        "logs": [
          [
            2
          ]
        ]
      },
      {
        "input": {
          "n": 6,
          "limite": 3,
          "divisor": 3
        },
        "logs": [
          [
            1
          ]
        ]
      }
    ],
    "readonly": false
  },
  "03.08": {
    "teaching": {
      "title": "Atualizar um estado a cada tick",
      "paragraphs": [
        "Uma simulação é uma sequência de transições: o estado atual recebe uma entrada, aplica a regra do tick e produz o próximo estado. fila mede pessoas esperando; atendidos mede serviços efetivos.",
        "A ordem é parte do contrato. Primeiro some as chegadas do tick; depois, se houver atendimento agendado e fila > 0, retire uma pessoa e incremente atendidos.",
        "Use uma tabela para separar tick, chegada, agenda, fila final e total atendido. Isso permite conferir que a fila nunca fica negativa e que atendimento vazio não conta."
      ],
      "code": "let fila = 1;\nlet atendidos = 0;\nconst chegada = 2;\nconst atendimento = true;\nfila += chegada;\nif (atendimento && fila > 0) {\n  fila--;\n  atendidos++;\n}\nconsole.log(fila, atendidos);",
      "walkthrough": [
        "O estado começa com fila 1 e recebe duas chegadas, ficando com fila 3.",
        "Como há atendimento e fila > 0, uma pessoa sai: fila fica 2 e atendidos fica 1.",
        "Um atendimento agendado só é efetivo se, depois de somar as chegadas, fila > 0. Num cenário alternativo com fila=0 e chegada=0, atendidos permanece zero."
      ],
      "pitfall": "Atender antes de somar a chegada muda o resultado do mesmo tick; subtrair sem testar fila > 0 cria um estado impossível.",
      "next": "Trace os quatro ticks do cenário-base e só depois escreva o loop da simulação. Use chegadasPorTick para a quantidade de chegadas: o cenário-base usa 1 e os casos também conferem 0. Imprima fila e atendidos após todos os ticks."
    },
    "starter": "const ticks = 20;\nconst chegadasPorTick = 1;\nlet fila = 0;\nlet atendidos = 0;\nfor (let tick = 1; tick <= ticks; tick++) {\n  // uma chegada por tick; atendimento nos ticks pares\n}\nconsole.log(fila, atendidos);",
    "hints": [
      "Registre chegada antes da decisão de atendimento.",
      "Atendimento efetivo exige tick par e fila > 0.",
      "Atualize fila e atendidos juntos somente quando houver serviço."
    ],
    "reflectionPrompt": "Explique a ordem chegada → atendimento e como você sabe que a fila não fica negativa. Quais são as entradas, o estado, a regra de atualização e a saída? Essa separação será usada ao criar funções na Etapa 04.",
    "rubric": [
      "Somei chegadas antes de tentar atender.",
      "Contei somente serviços com fila positiva.",
      "Conferi fila e atendidos em mais de um tick."
    ],
    "transfer": {
      "prompt": "Simule seis ticks: chegam nos ticks 1, 2, 4 e 6; há atendimento nos ticks 2, 3, 5 e 6. Registre fila e atendidos finais. Comece fila=0 e atendidos=0; some chegadas antes do serviço e atenda somente se fila>0. Imprima console.log(fila, atendidos).",
      "starter": "let fila = 0;\nlet atendidos = 0;\nfor (let tick = 1; tick <= 6; tick++) {\n  // aplique a agenda declarada no enunciado\n}\nconsole.log(fila, atendidos);",
      "fixtures": [
        {
          "input": {},
          "logs": [
            [
              0,
              4
            ]
          ]
        }
      ]
    },
    "table": {
      "caption": "Cenário-base, quatro primeiros ticks: chegada antes de atendimento.",
      "columns": [
        "Fila final",
        "Atendidos"
      ],
      "rows": [
        {
          "label": 1,
          "expected": [
            "1",
            "0"
          ]
        },
        {
          "label": 2,
          "expected": [
            "1",
            "1"
          ]
        },
        {
          "label": 3,
          "expected": [
            "2",
            "1"
          ]
        },
        {
          "label": 4,
          "expected": [
            "2",
            "2"
          ]
        }
      ]
    },
    "fixtures": [
      {
        "input": {
          "ticks": 4
        },
        "logs": [
          [
            2,
            2
          ]
        ]
      },
      {
        "input": {
          "ticks": 20
        },
        "logs": [
          [
            10,
            10
          ]
        ]
      },
      {
        "input": {
          "ticks": 0
        },
        "logs": [
          [
            0,
            0
          ]
        ]
      },
      {
        "input": {
          "ticks": 1
        },
        "logs": [
          [
            1,
            0
          ]
        ]
      },
      {
        "input": {
          "ticks": 4,
          "chegadasPorTick": 0
        },
        "logs": [
          [
            0,
            0
          ]
        ]
      }
    ],
    "readonly": false
  },
  "03.09": {
    "teaching": {
      "title": "Modelar turnos, estados terminais e limite",
      "paragraphs": [
        "Um turno é uma sequência de mudanças de estado. Neste jogo, o herói ataca primeiro; somente se o monstro continuar com HP positivo ele pode responder.",
        "Após subtrair dano, se o HP ficar menor que zero, atribua zero: if (hp < 0) hp = 0. Isso mantém a regra de HP não negativo usando uma condição já aprendida. Reavalie se o monstro está vivo antes de permitir a resposta.",
        "O limite de 20 turnos garante parada mesmo quando dano é zero. Se ambos continuarem vivos ao atingir o limite, o resultado é empate."
      ],
      "code": "let heroi = 5;\nlet monstro = 4;\nlet turnos = 0;\nconst danoHeroi = 2;\nconst danoMonstro = 1;\nwhile (heroi > 0 && monstro > 0 && turnos < 3) {\n  monstro -= danoHeroi;\n  if (monstro < 0) monstro = 0;\n  if (monstro > 0) {\n    heroi -= danoMonstro;\n    if (heroi < 0) heroi = 0;\n  }\n  turnos++;\n}\nconsole.log(heroi, monstro, turnos);",
      "walkthrough": [
        "Estado inicial: herói=5, monstro=4. No turno 1 o ataque deixa monstro=2; ele responde e deixa herói=4. turnos passa a 1.",
        "No turno 2 o ataque deixa monstro=0. O teste monstro > 0 falha, então não há resposta; herói continua 4 e turnos passa a 2.",
        "O próximo teste do while falha porque monstro não está vivo. A saída é 4, 0, 2. Se ninguém causasse dano, o limite ainda encerraria o jogo."
      ],
      "pitfall": "Testar HP apenas no começo do turno permite contra-ataque de um monstro que acabou de ser derrotado; esquecer o limite pode prender dano zero.",
      "next": "Escreva primeiro a ordem das ações e as três condições de parada; depois implemente e teste vitória, derrota e empate."
    },
    "starter": "let heroi = 12;\nlet monstro = 9;\nlet turnos = 0;\nconst maxTurnos = 20;\nconst danoHeroi = 3;\nconst danoMonstro = 2;\n// implemente a batalha e produza heroi, monstro, turnos e resultado\nlet resultado = \"\";\n// escolha \"heroi\", \"monstro\" ou \"empate\" ao encerrar\nconsole.log(heroi, monstro, turnos, resultado);",
    "hints": [
      "Escreva a condição do while com HP positivo e turnos abaixo do limite.",
      "Após o ataque do herói, teste monstro > 0 antes do contra-ataque.",
      "Ao sair, escolha heroi, monstro ou empate conforme HP e limite."
    ],
    "reflectionPrompt": "Explique por que o monstro não contra-ataca no último turno de uma vitória e como dano zero termina. Identifique entradas, estado e saída que poderiam compor uma função na Etapa 04.",
    "rubric": [
      "Apliquei a ordem herói antes de monstro.",
      "Impedi HP abaixo de zero e não deixei derrotado agir.",
      "Garanti parada em no máximo 20 turnos e tratei empate."
    ],
    "transfer": {
      "prompt": "Simule robôs A=8 e B=6 por no máximo 5 rodadas; A começa, causa 3 e B causa 2. Informe estado final, vencedor/empate e rodada. Use heroi para a energia de A e monstro para a de B. Imprima console.log(heroi, monstro, turnos, resultado), com resultado \"heroi\", \"monstro\" ou \"empate\".",
      "starter": "let heroi = 8;\nlet monstro = 6;\nlet turnos = 0;\nconst maxTurnos = 5;\nconst danoHeroi = 3;\nconst danoMonstro = 2;\n// implemente a batalha e produza heroi, monstro, turnos e resultado\nlet resultado = \"\";\n// escolha \"heroi\", \"monstro\" ou \"empate\" ao encerrar\nconsole.log(heroi, monstro, turnos, resultado);",
      "fixtures": [
        {
          "input": {},
          "logs": [
            [
              6,
              0,
              2,
              "heroi"
            ]
          ]
        },
        {
          "input": {
            "danoHeroi": 0,
            "danoMonstro": 0
          },
          "logs": [
            [
              8,
              6,
              5,
              "empate"
            ]
          ]
        }
      ]
    },
    "table": {
      "caption": "Cenário-base: estado após cada turno completo.",
      "columns": [
        "HP herói",
        "HP monstro"
      ],
      "rows": [
        {
          "label": 1,
          "expected": [
            "10",
            "6"
          ]
        },
        {
          "label": 2,
          "expected": [
            "8",
            "3"
          ]
        },
        {
          "label": 3,
          "expected": [
            "8",
            "0"
          ]
        }
      ]
    },
    "fixtures": [
      {
        "input": {},
        "logs": [
          [
            8,
            0,
            3,
            "heroi"
          ]
        ]
      },
      {
        "input": {
          "heroi": 2
        },
        "logs": [
          [
            0,
            6,
            1,
            "monstro"
          ]
        ]
      },
      {
        "input": {
          "danoHeroi": 0,
          "danoMonstro": 0
        },
        "logs": [
          [
            12,
            9,
            20,
            "empate"
          ]
        ]
      },
      {
        "input": {
          "monstro": 1,
          "danoHeroi": 5
        },
        "logs": [
          [
            12,
            0,
            1,
            "heroi"
          ]
        ]
      },
      {
        "input": {
          "heroi": 1,
          "danoMonstro": 5
        },
        "logs": [
          [
            0,
            6,
            1,
            "monstro"
          ]
        ]
      },
      {
        "input": {
          "maxTurnos": 1
        },
        "logs": [
          [
            10,
            6,
            1,
            "empate"
          ]
        ]
      }
    ],
    "readonly": false
  }
};
