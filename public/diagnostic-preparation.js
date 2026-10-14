// Generated from course-src/diagnostic-preparation.mjs; edit the editorial source.
globalThis.DevPathDiagnosticPreparation = {
  "D.01": {
    "introduction": "Descubra se você já consegue acompanhar a ordem de três saídas simples.",
    "orientation": "Leia main.js de cima para baixo, como uma lista de recados. Anote o que cada linha escreve antes de executar. Você pode responder mesmo sem experiência anterior; escolha Ainda não sei quando uma linha não estiver clara.",
    "code": "console.log(\"porta\");\nconsole.log(3 + 2);\nconsole.log(\"aberta\");",
    "fields": [
      {
        "label": "Saída da primeira chamada",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "porta",
            "label": "porta"
          },
          {
            "value": "5",
            "label": "5"
          },
          {
            "value": "aberta",
            "label": "aberta"
          }
        ],
        "expected": "porta",
        "explanation": "A primeira chamada escreve a palavra porta."
      },
      {
        "label": "Saída da segunda chamada",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "5",
            "label": "5"
          },
          {
            "value": "3 + 2",
            "label": "3 + 2"
          },
          {
            "value": "porta",
            "label": "porta"
          },
          {
            "value": "aberta",
            "label": "aberta"
          }
        ],
        "expected": "5",
        "explanation": "A expressão 3 + 2 é calculada antes de console.log escrever 5. Sem aspas, aparece o resultado da soma, não o texto 3 + 2."
      },
      {
        "label": "Saída da terceira chamada",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "aberta",
            "label": "aberta"
          },
          {
            "value": "porta",
            "label": "porta"
          },
          {
            "value": "5",
            "label": "5"
          }
        ],
        "expected": "aberta",
        "explanation": "A terceira chamada vem depois das duas primeiras e escreve aberta."
      }
    ],
    "feedbackSteps": [
      "As chamadas síncronas acontecem na ordem em que aparecem no arquivo.",
      "Cada argumento é calculado antes de sua chamada escrever uma linha.",
      "A sequência resolvida é porta, 5, aberta; compare a primeira divergência com sua previsão."
    ],
    "nextStep": "Na Etapa 00, pratique ler um arquivo e sua saída; na Etapa 01, acompanhe como valores e expressões formam cada linha.",
    "takeaway": "A ordem textual das chamadas síncronas determina a ordem das linhas."
  },
  "D.02": {
    "introduction": "Separe o valor escrito, o tipo conceitual e o rótulo que typeof devolve.",
    "orientation": "Leia cada cartão sem tentar adivinhar pelo tamanho ou pela aparência. Primeiro pense no tipo do valor; depois pense no que typeof responderia. Se ainda não conhece esses nomes, escolha Ainda não sei e veja a explicação.",
    "code": "0, '', false, null, '0', undefined",
    "fields": [
      {
        "label": "Tipo conceitual de 0",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "null",
            "label": "null"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "number",
        "explanation": "0 é um número. Ele representa uma quantidade e não tem aspas ao redor."
      },
      {
        "label": "typeof 0",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "object",
            "label": "object"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "number",
        "explanation": "typeof 0 retorna o rótulo number."
      },
      {
        "label": "Tipo conceitual de string vazia",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "null",
            "label": "null"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "string",
        "explanation": "As aspas tornam o valor uma string; ela está vazia, mas continua sendo string."
      },
      {
        "label": "typeof string vazia",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "object",
            "label": "object"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "string",
        "explanation": "typeof de uma string vazia ainda retorna string."
      },
      {
        "label": "Tipo conceitual de false",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "null",
            "label": "null"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "boolean",
        "explanation": "false é um valor booleano."
      },
      {
        "label": "typeof false",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "object",
            "label": "object"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "boolean",
        "explanation": "typeof false retorna boolean."
      },
      {
        "label": "Tipo conceitual de null",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "null",
            "label": "null"
          },
          {
            "value": "object",
            "label": "object"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "null",
        "explanation": "null é um valor próprio que representa ausência intencional."
      },
      {
        "label": "typeof null",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "object",
            "label": "object"
          },
          {
            "value": "null",
            "label": "null"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "boolean",
            "label": "boolean"
          }
        ],
        "expected": "object",
        "explanation": "typeof null retorna object por uma peculiaridade histórica; isso não muda o valor conceitual null."
      },
      {
        "label": "Tipo conceitual de string \"0\"",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "null",
            "label": "null"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "string",
        "explanation": "As aspas fazem de 0 um texto, mesmo que o texto contenha um algarismo."
      },
      {
        "label": "typeof string \"0\"",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "object",
            "label": "object"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "string",
        "explanation": "typeof do texto \"0\" retorna string."
      },
      {
        "label": "Tipo conceitual de undefined",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "null",
            "label": "null"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "bigint",
            "label": "bigint"
          }
        ],
        "expected": "undefined",
        "explanation": "undefined indica que nenhum valor foi fornecido."
      },
      {
        "label": "typeof undefined",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "undefined",
            "label": "undefined"
          },
          {
            "value": "null",
            "label": "null"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "boolean",
            "label": "boolean"
          },
          {
            "value": "object",
            "label": "object"
          }
        ],
        "expected": "undefined",
        "explanation": "typeof undefined retorna undefined."
      }
    ],
    "feedbackSteps": [
      "Tipo é a categoria do valor. typeof é um operador que devolve o nome dessa categoria como texto.",
      "string significa texto, number significa número e boolean significa verdadeiro ou falso (true ou false). Aspas indicam uma string, mesmo quando ela está vazia ou contém um algarismo.",
      "null representa uma ausência intencional. O resultado object de typeof null é uma exceção histórica, não uma indicação de que null seja um objeto comum.",
      "undefined representa ausência de um valor fornecido. O operador typeof devolve o rótulo undefined para esse valor."
    ],
    "nextStep": "Na Etapa 01, você vai estudar tipos e valores com explicações, exemplos e prática usando const, let e typeof.",
    "takeaway": "Não confunda a aparência do valor, seu tipo conceitual e o rótulo produzido por typeof."
  },
  "D.03": {
    "introduction": "Veja se você acompanha uma condição no limite e escolhe o ramo correto.",
    "orientation": "Leia o operador antes de olhar para as mensagens. Para cada entrada, responda primeiro se a condição é verdadeira; depois escolha a mensagem. Você pode responder mesmo sem conhecer ainda a sintaxe completa de decisões.",
    "code": "if (pontos >= 10) console.log(\"passou\"); else console.log(\"tente\");",
    "fields": [
      {
        "label": "Com pontos = 10, a condição é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "true",
            "label": "true"
          },
          {
            "value": "false",
            "label": "false"
          }
        ],
        "expected": "true",
        "explanation": ">= inclui o próprio limite: 10 é maior ou igual a 10."
      },
      {
        "label": "Com pontos = 10, a saída é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "passou",
            "label": "passou"
          },
          {
            "value": "tente",
            "label": "tente"
          }
        ],
        "expected": "passou",
        "explanation": "Como a condição é verdadeira, o primeiro ramo escreve passou."
      },
      {
        "label": "Com pontos = 9, a condição é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "false",
            "label": "false"
          },
          {
            "value": "true",
            "label": "true"
          }
        ],
        "expected": "false",
        "explanation": "9 é menor que 10, então não satisfaz pontos >= 10."
      },
      {
        "label": "Com pontos = 9, a saída é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "tente",
            "label": "tente"
          },
          {
            "value": "passou",
            "label": "passou"
          }
        ],
        "expected": "tente",
        "explanation": "A condição falsa leva ao ramo else, que escreve tente."
      }
    ],
    "feedbackSteps": [
      "Leia >= como maior ou igual, incluindo o limite.",
      "Com 10, a condição é verdadeira e a saída é passou.",
      "Com 9, a condição é falsa e a saída é tente.",
      "Testar abaixo, no limite e acima ajuda a revelar o comportamento da regra."
    ],
    "nextStep": "Na Etapa 01, observe como valores e comparações podem orientar uma decisão; por enquanto, basta reconhecer o limite incluído.",
    "takeaway": "O limite pertence ao primeiro ramo quando o operador é >=."
  },
  "D.04": {
    "introduction": "Diferencie o valor que uma função devolve da linha que aparece no console.",
    "orientation": "Leia a função e a chamada separadamente. Procure o valor depois de return e observe qual linha contém console.log. Não é preciso editar código; o objetivo é localizar cada papel.",
    "code": "function dobro(n) { return n * 2; }\nconst resultado = dobro(3);\nconsole.log(resultado);",
    "fields": [
      {
        "label": "Entrada recebida por dobro",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "3",
            "label": "3"
          },
          {
            "value": "6",
            "label": "6"
          },
          {
            "value": "resultado",
            "label": "resultado"
          }
        ],
        "expected": "3",
        "explanation": "A chamada dobro(3) passa 3 para o parâmetro n."
      },
      {
        "label": "Valor devolvido por return",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "6",
            "label": "6"
          },
          {
            "value": "3",
            "label": "3"
          },
          {
            "value": "0",
            "label": "0"
          }
        ],
        "expected": "6",
        "explanation": "A função calcula n * 2; com n igual a 3, retorna 6."
      },
      {
        "label": "Efeito de console.log",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "6",
            "label": "6"
          },
          {
            "value": "3",
            "label": "3"
          },
          {
            "value": "nenhuma linha",
            "label": "nenhuma linha"
          }
        ],
        "expected": "6",
        "explanation": "console.log(resultado) escreve o valor guardado em resultado, que é 6."
      }
    ],
    "feedbackSteps": [
      "A entrada é o valor usado na chamada: 3.",
      "return n * 2 devolve 6 para quem chamou a função.",
      "A função não imprime por causa de return.",
      "A linha externa console.log é que produz uma linha com 6."
    ],
    "nextStep": "Mais adiante, ao estudar funções, retome esta distinção entre o valor retornado e o efeito de uma chamada.",
    "takeaway": "return entrega um valor; console.log produz saída. Uma função pode retornar sem imprimir."
  },
  "D.05": {
    "introduction": "Escolha a primeira ferramenta de investigação conforme a dúvida que você precisa resolver.",
    "orientation": "Pense nas ferramentas como instrumentos diferentes: leitura é olhar o mapa, Run é fazer uma simulação rápida, teste é repetir uma pergunta de borda e debugger é pausar para observar o estado. Uma lista vazia é um caso especial útil para testar se o acumulador começa em zero. Escolha a ferramenta e a evidência que espera; se não souber, escolha Ainda não sei.",
    "code": "function total(xs) {\n  let n = 0;\n  for (const x of xs) {\n    if (x > 0) n += x;\n  }\n  return n;\n}",
    "fields": [
      {
        "label": "Hipótese para total([2, -1, 3])",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "expected5",
            "label": "Espero retorno 5"
          },
          {
            "value": "expected4",
            "label": "Espero retorno 4"
          },
          {
            "value": "expected0",
            "label": "Espero retorno 0"
          }
        ],
        "expected": "expected5",
        "explanation": "Uma hipótese simples é esperar que a soma dos positivos produza 5. Uma hipótese é uma previsão que você pode conferir; ainda não é uma observação."
      },
      {
        "label": "Retorno de total([2, -1, 3])",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "5",
            "label": "5"
          },
          {
            "value": "4",
            "label": "4"
          },
          {
            "value": "0",
            "label": "0"
          }
        ],
        "expected": "5",
        "explanation": "A função soma apenas os valores positivos: 2 + 3 = 5."
      },
      {
        "label": "Ferramenta para reproduzir uma borda",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "test",
            "label": "Escrever um teste"
          },
          {
            "value": "read",
            "label": "Ler o código"
          },
          {
            "value": "run",
            "label": "Executar uma vez"
          },
          {
            "value": "debugger",
            "label": "Pausar no debugger"
          }
        ],
        "expected": "test",
        "explanation": "Um teste pequeno registra o caso de borda e permite reproduzi-lo depois. Caso de borda é uma entrada especial, como uma lista vazia."
      },
      {
        "label": "Ferramenta para observar estado divergente",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "debugger",
            "label": "Pausar no debugger"
          },
          {
            "value": "read",
            "label": "Ler o código"
          },
          {
            "value": "run",
            "label": "Executar uma vez"
          },
          {
            "value": "test",
            "label": "Escrever um teste"
          }
        ],
        "expected": "debugger",
        "explanation": "O debugger permite pausar o loop e observar quando o estado deixa de seguir a hipótese. Estado é o conjunto de valores que o programa tem naquele momento."
      },
      {
        "label": "Evidência esperada para a hipótese de retorno 5",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "output5",
            "label": "Retorno observado igual a 5"
          },
          {
            "value": "testcase",
            "label": "O arquivo abriu sem erro"
          },
          {
            "value": "statepoint",
            "label": "O código parece organizado"
          }
        ],
        "expected": "output5",
        "explanation": "Ao executar em outro momento, compare a previsão 5 com o retorno observado: isso confirma ou enfraquece a hipótese. Abrir um arquivo ou olhar sua organização não confere o resultado. Aqui estamos planejando a investigação, não executando o código."
      }
    ],
    "feedbackSteps": [
      "xs é a lista recebida. n guarda o total, começando em 0. O trecho for percorre a lista, chamando cada valor de x.",
      "A condição x > 0 seleciona apenas os positivos. n += x soma esse valor ao total. Os estados de n são 0 → 2 → 2 → 5: -1 não entra na soma. return n devolve o total 5.",
      "Para conferir um retorno simples, você pode ler e prever antes de executar. Para ver uma função no console, é preciso chamá-la e imprimir o retorno; apenas declará-la não produz saída.",
      "Para uma falha de borda reproduzível, escreva um teste pequeno que preserve o caso; com lista vazia, nenhuma soma ocorre e o retorno é 0.",
      "Quando o estado muda de um jeito inesperado, pause no debugger para observar o ponto da divergência. A ferramenta deve produzir a evidência que falta para conferir sua hipótese."
    ],
    "nextStep": "Mais adiante, pratique o ciclo hipótese, ferramenta e evidência ao investigar uma função.",
    "takeaway": "Investigar começa com uma hipótese e uma ferramenta escolhida pela evidência que falta."
  },
  "D.06": {
    "introduction": "Explore o começo da trilha: acompanhar uma expressão e distinguir número de texto.",
    "orientation": "Leia cada previsão antes de responder. O código é uma pergunta de estudo, não uma prova. Se uma ideia ainda for nova, escolha Ainda não sei e siga para a explicação.",
    "code": "console.log(\"A\");\nconsole.log(4 + 1);\nconsole.log(\"B\");\nconst valor = 5;\nconst texto = \"5\";\ntypeof valor; typeof texto;",
    "fields": [
      {
        "label": "As três chamadas escrevem nesta sequência",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "A, 5, B",
            "label": "A, 5, B"
          },
          {
            "value": "5, A, B",
            "label": "5, A, B"
          },
          {
            "value": "B, 5, A",
            "label": "B, 5, A"
          }
        ],
        "expected": "A, 5, B",
        "explanation": "O primeiro console escreve A, a segunda chamada calcula 4 + 1 e escreve 5, e a terceira escreve B."
      },
      {
        "label": "A segunda chamada escreve",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "5",
            "label": "5"
          },
          {
            "value": "4 + 1",
            "label": "4 + 1"
          },
          {
            "value": "\"5\"",
            "label": "\"5\""
          }
        ],
        "expected": "5",
        "explanation": "A expressão 4 + 1 é calculada antes de console.log; sem aspas, a saída é o número 5."
      },
      {
        "label": "As chamadas síncronas aparecem na ordem",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "em que estão no arquivo",
            "label": "em que estão no arquivo"
          },
          {
            "value": "alfabética",
            "label": "alfabética"
          },
          {
            "value": "escolhida pelo console",
            "label": "escolhida pelo console"
          }
        ],
        "expected": "em que estão no arquivo",
        "explanation": "As três chamadas síncronas seguem a ordem textual: A, depois o resultado 5, e por fim B."
      },
      {
        "label": "O tipo conceitual do valor sem aspas 5 é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "boolean",
            "label": "boolean"
          }
        ],
        "expected": "number",
        "explanation": "O número 5 não tem aspas. Ele é um valor number."
      },
      {
        "label": "typeof valor devolve",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "object",
            "label": "object"
          }
        ],
        "expected": "number",
        "explanation": "A variável valor contém o número 5, então typeof devolve o rótulo number."
      },
      {
        "label": "O tipo conceitual de texto é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "string",
            "label": "string"
          },
          {
            "value": "number",
            "label": "number"
          },
          {
            "value": "boolean",
            "label": "boolean"
          }
        ],
        "expected": "string",
        "explanation": "As aspas fazem de \"5\" texto. Um algarismo escrito entre aspas é string."
      }
    ],
    "coverage": {
      "00.01": [
        0,
        1,
        2
      ],
      "01.01": [
        3,
        4,
        5
      ]
    },
    "recommendation": {
      "entry": "01.01",
      "prerequisites": [
        "00.01"
      ]
    },
    "feedbackSteps": [
      "Uma expressão numérica é calculada antes de ser impressa.",
      "Chamadas síncronas seguem a ordem textual do arquivo.",
      "Aspas distinguem o número 5 do texto \"5\".",
      "typeof informa um rótulo de tipo; não transforma o valor."
    ],
    "nextStep": "Se estas ideias já estão familiares, a entrada sugerida é 01.01, que começa valores e typeof. Se não, 00.01 é um começo útil.",
    "takeaway": "Este diagnóstico de estudo observa estas previsões. Ele não certifica a etapa nem é prova independente de domínio."
  },
  "D.07": {
    "introduction": "Observe chamadas de função, mudanças em arrays e a intenção de cada método.",
    "orientation": "Acompanhe o argumento, o valor retornado e o array em momentos separados. Você pode escolher Ainda não sei e aprender com o feedback.",
    "code": "function dobro(n) { return n * 2; }\nconst valores = [2, 4];\nvalores.push(6);\nconst b = valores;\nb.push(8);\nconst c = valores.slice();\nc.push(10);\nvalores.filter(n => n > 2);",
    "fields": [
      {
        "label": "dobro(3) devolve",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "6",
            "label": "6"
          },
          {
            "value": "3",
            "label": "3"
          },
          {
            "value": "uma linha no console",
            "label": "uma linha no console"
          }
        ],
        "expected": "6",
        "explanation": "A função recebe 3, calcula 3 * 2 e devolve 6 por return."
      },
      {
        "label": "Depois de push(6), valores contém",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "2, 4, 6",
            "label": "2, 4, 6"
          },
          {
            "value": "2, 4",
            "label": "2, 4"
          },
          {
            "value": "6",
            "label": "6"
          }
        ],
        "expected": "2, 4, 6",
        "explanation": "push acrescenta o novo elemento ao array existente."
      },
      {
        "label": "Depois de b = valores e b.push(8), valores contém",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "2, 4, 6, 8",
            "label": "2, 4, 6, 8"
          },
          {
            "value": "2, 4, 6",
            "label": "2, 4, 6"
          },
          {
            "value": "8",
            "label": "8"
          }
        ],
        "expected": "2, 4, 6, 8",
        "explanation": "A atribuição b = valores copia a referência, não o array. b e valores apontam para o mesmo array; a mutação por b também aparece em valores."
      },
      {
        "label": "Depois de c = valores.slice() e c.push(10), valores contém",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "2, 4, 6, 8",
            "label": "2, 4, 6, 8"
          },
          {
            "value": "2, 4, 6, 8, 10",
            "label": "2, 4, 6, 8, 10"
          },
          {
            "value": "10",
            "label": "10"
          }
        ],
        "expected": "2, 4, 6, 8",
        "explanation": "slice cria outro array. Acrescentar 10 a c não altera a sequência de valores; as duas variáveis referenciam arrays diferentes."
      },
      {
        "label": "Para criar um novo array só com valores maiores que 2, use",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "filter",
            "label": "filter"
          },
          {
            "value": "map",
            "label": "map"
          },
          {
            "value": "find",
            "label": "find"
          }
        ],
        "expected": "filter",
        "explanation": "filter mantém os elementos que satisfazem uma condição e devolve um novo array."
      },
      {
        "label": "Para transformar cada número em seu dobro e manter todos, use",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "map",
            "label": "map"
          },
          {
            "value": "filter",
            "label": "filter"
          },
          {
            "value": "find",
            "label": "find"
          }
        ],
        "expected": "map",
        "explanation": "map transforma cada elemento e mantém uma posição correspondente no novo array."
      },
      {
        "label": "Para obter o primeiro número maior que 2, use",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "find",
            "label": "find"
          },
          {
            "value": "filter",
            "label": "filter"
          },
          {
            "value": "reduce",
            "label": "reduce"
          }
        ],
        "expected": "find",
        "explanation": "find devolve o primeiro elemento que satisfaz a condição."
      }
    ],
    "coverage": {
      "04.01": [
        0
      ],
      "05.01": [
        1,
        2,
        3
      ],
      "07.01": [
        4,
        5,
        6
      ]
    },
    "recommendation": {
      "entry": "07.01",
      "prerequisites": [
        "04.01",
        "05.01"
      ]
    },
    "feedbackSteps": [
      "return entrega um valor para a chamada; não imprime por si só.",
      "push muda o conteúdo do array ao acrescentar um elemento.",
      "filter seleciona, map transforma e find procura o primeiro correspondente.",
      "Escolha o método conforme o resultado pedido."
    ],
    "nextStep": "Se as distinções estão claras, a entrada sugerida é 07.01, que compara métodos de array e suas intenções.",
    "takeaway": "Este diagnóstico de estudo sugere uma entrada limitada para estes exemplos; não certifica o estágio inteiro nem prova implementação independente."
  },
  "D.08": {
    "introduction": "Separe o que uma função retorna, o que uma referência contém e o que um diagnóstico de tipo diz.",
    "orientation": "Leia os cartões como situações diferentes: valor retornado, acesso a campo, tipo estático e validação de dado recebido. Ainda não sei é uma resposta válida para estudar.",
    "code": "type Pessoa = { nome: string; meta: { ativo: boolean } };\nfunction nome(p: Pessoa) { return p.nome; }\nconst pessoa = { nome: \"Lia\", meta: { ativo: true } };\nconst alias = pessoa;\nalias.nome = \"Noa\";\nconst copia = { ...pessoa };\ncopia.nome = \"Bia\";\ncopia.meta.ativo = false;\nconst entrada: unknown = JSON.parse(texto);",
    "fields": [
      {
        "label": "nome({nome: \"Lia\"}) devolve",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "\"Lia\"",
            "label": "\"Lia\""
          },
          {
            "value": "Pessoa",
            "label": "Pessoa"
          },
          {
            "value": "uma validação em runtime",
            "label": "uma validação em runtime"
          }
        ],
        "expected": "\"Lia\"",
        "explanation": "A função lê p.nome e retorna o valor desse campo."
      },
      {
        "label": "Para ler nome de uma referência pessoa, a forma é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "pessoa.nome",
            "label": "pessoa.nome"
          },
          {
            "value": "Pessoa",
            "label": "o tipo Pessoa"
          },
          {
            "value": "typeof pessoa.nome",
            "label": "typeof pessoa.nome"
          }
        ],
        "expected": "pessoa.nome",
        "explanation": "pessoa.nome acessa um campo do objeto referenciado; Pessoa é um tipo, não o valor do campo."
      },
      {
        "label": "Depois de alias = pessoa e alias.nome = \"Noa\", pessoa.nome é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "\"Noa\"",
            "label": "\"Noa\""
          },
          {
            "value": "\"Lia\"",
            "label": "\"Lia\""
          },
          {
            "value": "\"Bia\"",
            "label": "\"Bia\""
          }
        ],
        "expected": "\"Noa\"",
        "explanation": "Atribuir pessoa a alias copia a referência. A alteração feita por alias muda o mesmo objeto observado por pessoa."
      },
      {
        "label": "Depois do spread copia = {...pessoa} e copia.nome = \"Bia\", pessoa.nome é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "\"Noa\"",
            "label": "\"Noa\""
          },
          {
            "value": "\"Bia\"",
            "label": "\"Bia\""
          },
          {
            "value": "\"Lia\"",
            "label": "\"Lia\""
          }
        ],
        "expected": "\"Noa\"",
        "explanation": "O spread raso cria outro objeto de primeiro nível. Trocar copia.nome não troca pessoa.nome; campos aninhados ainda poderiam compartilhar referências."
      },
      {
        "label": "Depois de copia.meta.ativo = false, pessoa.meta.ativo é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "false",
            "label": "false"
          },
          {
            "value": "true",
            "label": "true"
          },
          {
            "value": "undefined",
            "label": "undefined"
          }
        ],
        "expected": "false",
        "explanation": "O spread copiou o objeto externo, mas `meta` continuou sendo a mesma referência aninhada. A alteração em copia.meta também aparece em pessoa.meta."
      },
      {
        "label": "copia.meta === pessoa.meta é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "true",
            "label": "true"
          },
          {
            "value": "false",
            "label": "false"
          },
          {
            "value": "não pode ser comparado",
            "label": "não pode ser comparado"
          }
        ],
        "expected": "true",
        "explanation": "O objeto meta é compartilhado: uma cópia rasa não duplica automaticamente os objetos internos."
      },
      {
        "label": "Se uma string for atribuída a number, o primeiro lugar para procurar um erro é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "diagnóstico do TypeScript",
            "label": "diagnóstico do TypeScript"
          },
          {
            "value": "um teste de rede",
            "label": "um teste de rede"
          },
          {
            "value": "o layout do DOM",
            "label": "o layout do DOM"
          }
        ],
        "expected": "diagnóstico do TypeScript",
        "explanation": "Uma incompatibilidade conhecida no código pode ser apontada pela checagem estática de tipos."
      },
      {
        "label": "Para aceitar JSON externo como Pessoa, ainda é preciso",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "validar a forma em runtime",
            "label": "validar a forma em runtime"
          },
          {
            "value": "usar any e assumir",
            "label": "usar any e assumir"
          },
          {
            "value": "apenas renomear a variável",
            "label": "apenas renomear a variável"
          }
        ],
        "expected": "validar a forma em runtime",
        "explanation": "unknown preserva a incerteza. A forma do dado externo precisa ser verificada durante a execução."
      },
      {
        "label": "Um cast para any comprova que o dado externo é válido?",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "não",
            "label": "não"
          },
          {
            "value": "sim, sempre",
            "label": "sim, sempre"
          },
          {
            "value": "só no navegador",
            "label": "só no navegador"
          }
        ],
        "expected": "não",
        "explanation": "Um cast muda o que o verificador aceita; ele não verifica os dados que chegam em runtime."
      }
    ],
    "coverage": {
      "04.01": [
        0
      ],
      "06.01": [
        1,
        2,
        3,
        4,
        5
      ],
      "15.01": [
        6,
        7,
        8
      ]
    },
    "recommendation": {
      "entry": "15.01",
      "prerequisites": [
        "04.01",
        "06.01"
      ]
    },
    "feedbackSteps": [
      "O valor retornado por uma chamada é diferente de uma saída no console.",
      "Um tipo nomeado descreve a forma; a referência contém o objeto e seus campos.",
      "O TypeScript pode apontar incompatibilidades estáticas no código.",
      "Dados externos ainda exigem validação em runtime; any não fornece essa evidência."
    ],
    "nextStep": "Se estas distinções estão claras, a entrada sugerida é 15.01, que lê diagnósticos de tipo e separa compilação de validação runtime.",
    "takeaway": "Este é um diagnóstico de estudo com casos fechados. Não certifica TypeScript nem substitui o compilador ou prova independente."
  },
  "D.09": {
    "introduction": "Pense em uma hipótese de desempenho e na observação que poderia testá-la.",
    "orientation": "Cada cenário sugere uma causa possível, mas uma hipótese não é uma medição. Escolha qual evidência ajudaria a distinguir causas; Ainda não sei também permite abrir o feedback.",
    "code": "function processar(itens) {\n  return itens.map(item => transformar(item));\n}\n// Um resultado rápido ou lento precisa de uma medição contextualizada.",
    "fields": [
      {
        "label": "processar(itens) devolve",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "o novo array criado por map",
            "label": "o novo array criado por map"
          },
          {
            "value": "uma medida de CPU",
            "label": "uma medida de CPU"
          },
          {
            "value": "um evento de rede",
            "label": "um evento de rede"
          }
        ],
        "expected": "o novo array criado por map",
        "explanation": "map devolve um array novo com o resultado da transformação de cada item."
      },
      {
        "label": "Uma tela espera muito antes de receber dados do servidor. Primeira hipótese",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "rede ou servidor",
            "label": "rede ou servidor"
          },
          {
            "value": "layout do DOM",
            "label": "layout do DOM"
          },
          {
            "value": "coleta de lixo",
            "label": "coleta de lixo"
          }
        ],
        "expected": "rede ou servidor",
        "explanation": "Uma espera antes dos dados chegarem sugere investigar rede e servidor, mas a hipótese precisa de tempos medidos."
      },
      {
        "label": "A página recebe dados, mas pausas longas coincidem com cálculo local. Meça primeiro",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "tempo de CPU e tarefas longas",
            "label": "tempo de CPU e tarefas longas"
          },
          {
            "value": "latência DNS apenas",
            "label": "latência DNS apenas"
          },
          {
            "value": "tamanho do bundle apenas",
            "label": "tamanho do bundle apenas"
          }
        ],
        "expected": "tempo de CPU e tarefas longas",
        "explanation": "Se a pausa coincide com cálculo local, medir tarefas longas e CPU ajuda a testar a hipótese."
      },
      {
        "label": "Um nó é removido da tela, mas a memória não cai. Uma alternativa é investigar",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "referências ainda retidas",
            "label": "referências ainda retidas"
          },
          {
            "value": "largura da rede",
            "label": "largura da rede"
          },
          {
            "value": "ordem alfabética dos logs",
            "label": "ordem alfabética dos logs"
          }
        ],
        "expected": "referências ainda retidas",
        "explanation": "Uma referência ativa pode manter objetos alcançáveis mesmo depois que um nó sai da tela."
      },
      {
        "label": "Uma renderização custa caro. Outra hipótese que merece medição é",
        "options": [
          {
            "value": "unknown",
            "label": "Ainda não sei"
          },
          {
            "value": "layout e pintura do DOM",
            "label": "layout e pintura do DOM"
          },
          {
            "value": "somente a conexão DNS",
            "label": "somente a conexão DNS"
          },
          {
            "value": "somente o armazenamento local",
            "label": "somente o armazenamento local"
          }
        ],
        "expected": "layout e pintura do DOM",
        "explanation": "Cálculo e layout podem competir como explicações; medir a etapa evita concluir apenas pela aparência."
      }
    ],
    "coverage": {
      "04.01": [
        0
      ],
      "21.01": [
        1,
        2,
        3,
        4
      ]
    },
    "recommendation": {
      "entry": "21.01",
      "prerequisites": [
        "04.01"
      ]
    },
    "feedbackSteps": [
      "Uma função retorna dados; uma medição descreve comportamento observado.",
      "Rede, CPU, DOM, memória e I/O são hipóteses distintas.",
      "Escolha uma métrica que possa refutar a primeira hipótese.",
      "Cenários podem ter mais de uma causa; registre uma alternativa antes de concluir."
    ],
    "nextStep": "Se estas hipóteses e observações fazem sentido, a entrada sugerida é 21.01, que discute gargalos e medições.",
    "takeaway": "Este diagnóstico de estudo não mede um sistema real nem prova profiling. A recomendação é limitada e não certifica o estágio avançado."
  }
};
