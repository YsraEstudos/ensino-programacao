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
  }
};
