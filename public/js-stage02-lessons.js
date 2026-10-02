(function(global){
  'use strict';
  const sample=(label,fixtures,expected)=>({label,fixtures,expected});
  const block=(title,starter,cases,options={})=>({title,starter,cases,...options});
  const lessons={
    '02.01':[
      block('A · Aritmética e precedência','// Escreva um console.log para cada expressão:\n// 2 + 3 * 4\n// (2 + 3) * 4\n// 9 - 4\n// 6 % 4\n// 8 / 2\n// 2 ** 3',[sample('Seis expressões, na ordem',{},[14,20,5,2,4,8])],{rows:['2 + 3 * 4','(2 + 3) * 4','9 - 4','6 % 4','8 / 2','2 ** 3'],example:'Em 5 + 2 * 3, primeiro calcule 2 * 3; a soma resulta em 11. Com parênteses, (5 + 2) * 3 resulta em 21.'}),
      block('B · Comparação, lógica e texto','// Escreva console.log para as expressões, na ordem:\n// 0 === false\n// 5 > 3\n// 5 >= 5\n// !0\n// true && false\n// false || "x"\n// "2" + 3',[sample('Sete expressões, na ordem',{},[false,true,true,true,false,'x','23'])],{rows:['0 === false','5 > 3','5 >= 5','!0','true && false','false || "x"','"2" + 3'],example:'7 >= 4 devolve true. true && "ok" devolve "ok", uma string. + concatena se houver string: "4" + 1 resulta em "41".'}),
      block('C · Compare == e ===','// Exiba as duas comparações, na ordem:\n// 0 === "0"\n// 0 == "0"',[sample('Igualdade estrita e com coerção',{},[false,true])],{rows:['0 === "0"','0 == "0"'],example:'1 === "1" é false porque os tipos diferem. 1 == "1" é true após coerção. Na trilha, prefira ===; == exige intenção explícita.'}),
    ],
    '02.02':[
      block('Matriz · Falsy e nullish','const x = false;\n// Exiba x || "padrão" e x ?? "padrão", nesta ordem.',[false,0,'',null,undefined,NaN].map(x=>sample(`x = ${global.DevPathStage02Runner.format(x)}`,{x},[x||'padrão',x??'padrão'])),{rows:['false || "padrão"','false ?? "padrão"','0 || "padrão"','0 ?? "padrão"','"" || "padrão"','"" ?? "padrão"','null || "padrão"','null ?? "padrão"','undefined || "padrão"','undefined ?? "padrão"','NaN || "padrão"','NaN ?? "padrão"'],example:'0 || 50 resulta em 50, mas 0 ?? 50 preserva 0. Os seis falsy desta tabela não são a lista completa de JavaScript; nullish inclui apenas null e undefined.'}),
    ],
    '02.03':[
      block('Parsons · Exigir as duas condições','const saldo = 10;\nconst valor = 8;\nconst ativa = true;\n// Monte os blocos abaixo e escreva o código aqui.',[
        sample('Saldo e conta suficientes',{saldo:10,valor:8,ativa:true},[true]),sample('Saldo insuficiente',{saldo:8,valor:10,ativa:true},[false]),sample('Conta inativa',{saldo:10,valor:8,ativa:false},[false]),
      ],{parsons:true,example:'Primeiro descubra se há saldo e se a conta está ativa. Com &&, a autorização só é true se os dois requisitos forem true; || aceita apenas um.'}),
    ],
    '02.04':[block('Converter e detectar finitude','const texto = "12";\nconst vazio = false;\nconst numero = /* complete */;\nconst invalido = /* complete */;\nconsole.log(invalido);',[
      sample('Texto numérico',{texto:'12',vazio:false},[false]),sample('Zero válido',{texto:'0',vazio:false},[false]),sample('Vazio',{texto:'',vazio:true},[true]),sample('Só espaços',{texto:'   ',vazio:true},[true]),sample('Texto inválido',{texto:'abc',vazio:false},[true]),sample('NaN textual',{texto:'NaN',vazio:false},[true]),sample('Infinito',{texto:'Infinity',vazio:false},[true]),sample('Infinito negativo',{texto:'-Infinity',vazio:false},[true]),sample('Fora da faixa finita',{texto:'1e309',vazio:false},[true]),
    ],{example:'Number("42.5") produz 42.5; Number("abc") produz NaN. Number.isFinite rejeita NaN e ambos os infinitos. Number("") é 0, por isso a flag de vazio continua necessária.'})],
    '02.05':[block('Conversão explícita e validade','const quantidade = "3";\nconst preco = "10";\nconst quantidadeVazia = false;\nconst precoVazio = false;\nconst total = quantidade * preco;\nconst etiqueta = total + " reais";\n// Declare quantidadeNumero, precoNumero e entradaValida.\n// Refatore total/etiqueta e exiba entradaValida, total, etiqueta.',[
      sample('Compra válida',{quantidade:'3',preco:'10',quantidadeVazia:false,precoVazio:false},[true,30,'30 reais']),sample('Quantidade zero',{quantidade:'0',preco:'10',quantidadeVazia:false,precoVazio:false},[true,0,'0 reais']),sample('Quantidade vazia',{quantidade:'',preco:'10',quantidadeVazia:true,precoVazio:false},[false,0,'0 reais']),sample('Quantidade só espaços',{quantidade:'   ',preco:'10',quantidadeVazia:true,precoVazio:false},[false,0,'0 reais']),sample('Preço inválido',{quantidade:'3',preco:'x',quantidadeVazia:false,precoVazio:false},[false,NaN,'NaN reais']),sample('Preço infinito',{quantidade:'3',preco:'Infinity',quantidadeVazia:false,precoVazio:false},[false,Infinity,'Infinity reais']),sample('Preço NaN',{quantidade:'3',preco:'NaN',quantidadeVazia:false,precoVazio:false},[false,NaN,'NaN reais']),
    ],{explicitConversion:true,example:'Converta "4" e "2.5" com Number; detecte validade pelas flags e pela finitude. Calcule 10 e só depois use String para exibir "10 reais". Se houver entrada inválida, entradaValida é false e o resultado permanece diagnóstico; rejeição com if vem depois.'})],
    '02.06':[block('Depure o fallback','const volumeEntrada = 0;\nconst volume = volumeEntrada || 50;\nconsole.log(volume);',[
      sample('Zero explícito',{volumeEntrada:0},[0]),sample('Ausência null',{volumeEntrada:null},[50]),sample('Ausência undefined',{volumeEntrada:undefined},[50]),sample('False presente',{volumeEntrada:false},[false]),
    ],{example:'Para um limite opcional, limiteEntrada ?? 3 devolve 3 quando a entrada é undefined; com entrada 0 mantém 0. Ausência e validade de tipo são decisões distintas.',debug:true})],
    '02.07':[block('Escreva a regra de desconto','const preco = 100;\nconst taxa = 0.2;\n// Declare total e exiba-o.',[
      sample('Desconto de 20%',{preco:100,taxa:0.2},[80]),sample('Sem desconto',{preco:50,taxa:0},[50]),sample('Preço zero',{preco:0,taxa:0.5},[0]),sample('Desconto integral',{preco:100,taxa:1},[0]),
    ],{example:'Preço 84, taxa 0.25: permanece a fração 0.75, então o total é 63. Aqui o preço é finito não negativo e a taxa está em [0,1]; nenhuma validação escondida existe no starter.'})],
    '02.08':[block('Transfira para preferências','const volumeEntrada = 0;\nconst temaEntrada = "";\nconst notificacoesEntrada = false;\nconst volume = volumeEntrada || 50;\nconst tema = temaEntrada || "claro";\nconst notificacoes = notificacoesEntrada || true;\nconsole.log(volume, tema, notificacoes);',[
      sample('Escolhas falsy válidas',{volumeEntrada:0,temaEntrada:'',notificacoesEntrada:false},[0,'',false]),sample('Três ausências',{volumeEntrada:null,temaEntrada:undefined,notificacoesEntrada:null},[50,'claro',true]),
    ],{example:'Uma configuração tentativas=0 é uma escolha explícita. ?? preserva o zero; defaults agem só para ausência. Nesta atividade, "" também é um tema aceito.'})],
    '02.09':[block('Checkpoint · Normalize e some','const aEntrada = 0;\nconst bEntrada = 5;\n// Declare a e b com padrão 0 para ausência.\n// Declare total e exiba a, b, total.',[
      sample('Zero e cinco',{aEntrada:0,bEntrada:5},[0,5,5]),sample('Ambos ausentes',{aEntrada:undefined,bEntrada:undefined},[0,0,0]),sample('Null e zero',{aEntrada:null,bEntrada:0},[0,0,0]),sample('Três e ausência',{aEntrada:3,bEntrada:undefined},[3,0,3]),
    ],{example:'Uma equipe tem 13 pontos e a outra está ausente. Normalize cada ausência para 0 e só depois some: 13. As entradas aqui são números finitos não negativos, null ou undefined; não há parsing de texto.'})],
    '02.10':[
      block('A · Quatro regras de arredondamento','const segundos = 89;\nconst segundosNegativos = -89;\nconsole.log(Math.floor(segundos / 60));\n// Complete ceil, round, trunc para segundos;\n// depois floor, ceil, round, trunc para segundosNegativos.',[
        sample('89 e -89 segundos',{segundos:89,segundosNegativos:-89},[1,2,1,1,-2,-1,-1,-1]),sample('Meio minuto positivo e negativo',{segundos:30,segundosNegativos:-30},[0,1,1,0,-1,-0,-0,-0]),
      ],{ignoreSignedZero:true,example:'149/60: floor=2, ceil=3, round=2, trunc=2. Em -149/60, floor=-3 e trunc=-2: piso e truncamento diferem abaixo de zero. Curiosidade: Math.round(-0.5) é -0, mas a distinção não é exigida neste bloco.'}),
      block('B · Extremos e magnitude','const x = 3;\nconst y = 5;\nconst deslocamento = -3;\n// Exiba min(x,y), max(x,y), abs(deslocamento).',[
        sample('Três e cinco',{x:3,y:5,deslocamento:-3},[3,5,3]),sample('Sinais diferentes',{x:-2,y:7,deslocamento:4},[-2,7,4]),
      ],{example:'Math.min(2,8) é 2; Math.max(2,8) é 8; Math.abs(-4) é 4. O valor absoluto mede magnitude sem sinal.'}),
      block('C · Um dado de 1 a 6','const sorteio = Math.random();\n// Declare face usando sorteio, Math.floor e o intervalo de seis faces.\n// Exiba sorteio e face.',[
        sample('Extremo inferior',{sorteio:0},[0,1]),sample('Um quarto',{sorteio:0.25},[0.25,2]),sample('Metade',{sorteio:0.5},[0.5,4]),sample('Próximo do extremo superior',{sorteio:0.9999999999999999},[0.9999999999999999,6]),
      ],{random:true,example:'Math.random() gera um valor em [0,1). Para quatro faces, Math.floor(sorteio * 4) + 1 gera 1..4. O extremo 0 vira 1 e um valor próximo de 1 vira 4. Math.random não serve a senhas, tokens ou outros segredos.'}),
    ],
    '02.11':[
      block('A · Decimais e valores especiais','// Escreva console.log para cada expressão, na ordem:\n// 0.5 + 0.25 === 0.75\n// 0.1 + 0.2\n// 0.1 + 0.2 === 0.3\n// Number.isNaN(NaN)\n// Number.isFinite(Infinity)',[sample('Decimais e finitude',{},[true,0.30000000000000004,false,true,false])],{rows:['0.5 + 0.25 === 0.75','0.1 + 0.2','0.1 + 0.2 === 0.3','Number.isNaN(NaN)','Number.isFinite(Infinity)'],example:'0.5 e 0.25 têm representação binária exata. 0.2 + 0.7 é 0.8999999999999999, então a igualdade com 0.9 é false. Não se trata de aleatoriedade. NaN representa resultado inválido; Infinity não é finito.'}),
      block('B · Inteiros seguros e BigInt','// Escreva console.log para cada expressão, na ordem:\n// Number.isSafeInteger(2 ** 53 - 1)\n// Number.isSafeInteger(2 ** 53)\n// typeof 1n',[sample('Limite seguro e tipo',{},[true,false,'bigint'])],{rows:['Number.isSafeInteger(2 ** 53 - 1)','Number.isSafeInteger(2 ** 53)','typeof 1n'],example:'Inteiros seguros de Number vão de -(2**53-1) a 2**53-1. BigInt é apropriado para inteiros além dessa precisão; não representa frações e não se mistura implicitamente com Number.'}),
    ],
    '02.12':[block('Declare a tolerância do sensor','const a = 2000.3;\nconst b = 2000.304;\nconst resolucao = 0.01;\n// Política: diferença de até metade da resolução, inclusive.\n// Declare tolerancia e exiba tolerancia, comparação aproximada.',[
      sample('Sensor perto de 2000',{a:2000.3,b:2000.304,resolucao:0.01},[0.005,true]),sample('Fora da tolerância',{a:1,b:1.1,resolucao:0.02},[0.01,false]),sample('Soma perto de 1',{a:0.1+0.2,b:0.3,resolucao:2e-15},[1e-15,true]),sample('Soma perto de 2000',{a:1000.1+1000.2,b:2000.3,resolucao:2e-12},[1e-12,true]),sample('Exatamente no limite',{a:0,b:0.125,resolucao:0.25},[0.125,true]),sample('Acima do limite',{a:0,b:0.25,resolucao:0.25},[0.125,false]),sample('Leituras iguais',{a:4,b:4,resolucao:0.01},[0.005,true]),
    ],{tolerance:true,example:'Outro sensor informa resolução 0.2 e a mesma política de metade: o limiar é 0.1. Diferença 0.08 é aceita e 0.2 é rejeitada. Esta política pertence ao exercício; resolução sozinha não define uma tolerância universal. Number.EPSILON não substitui os requisitos.'})],
  };
  const hints={
    '02.01':[
      ['Calcule a multiplicação antes da soma; depois compare com a expressão entre parênteses.','Use uma chamada console.log por linha do quadro e mantenha a ordem pedida.','Confira também o resto com %, a divisão com / e a potência com **.'],
      ['Avalie cada linha como expressão independente; ! atua sobre truthiness.','&& e || podem devolver um dos operandos, inclusive uma string.','Para "2" + 3, observe se há uma string antes de prever o tipo do resultado.'],
      ['Escreva primeiro a comparação estrita e depois a comparação com coerção.','Os valores têm o mesmo conteúdo visual, mas tipos diferentes.','A segunda expressão aceita a conversão implícita; a primeira exige mesmo tipo e valor.'],
    ],
    '02.02':[
      ['Separe null e undefined dos outros quatro valores da matriz.','|| troca qualquer valor falsy; ?? só troca ausência nullish.','Imprima as duas expressões para cada x, na ordem, preservando a string vazia como resultado quando ela for mantida.'],
    ],
    '02.03':[
      ['Crie uma variável para saldo suficiente e outra para conta ativa.','A autorização precisa depender das duas variáveis.','Escolha && para exigir ambas; o bloco com || é o distrator.'],
    ],
    '02.04':[
      ['Converta texto para número antes de verificar se ele é finito.','A flag vazio identifica ausência; Number("") sozinho produziria zero.','Combine a flag com Number.isFinite(numero) para marcar entradas vazias ou não finitas como inválidas.'],
    ],
    '02.05':[
      ['Converta quantidade e preço separadamente com Number().','Entrada válida exige as duas flags falsas e os dois números finitos.','Calcule total com os números convertidos; para a etiqueta, converta o total com String().'],
    ],
    '02.06':[
      ['O valor zero está presente, embora seja falsy.','Compare o comportamento de || com ?? para zero e null.','Troque o operador do fallback para que zero e false sejam preservados e null/undefined recebam 50.'],
    ],
    '02.07':[
      ['A taxa é a parte descontada; descubra qual fração do preço permanece.','Subtraia do preço a parcela preco * taxa.','Teste a expressão com taxa 0 e taxa 1 para conferir os dois limites.'],
    ],
    '02.08':[
      ['As três configurações iniciais são valores falsy, mas algumas são escolhas explícitas.','Use um fallback apenas para null ou undefined.','Aplique ?? a cada entrada; assim zero, string vazia e false continuam sendo preferências válidas.'],
    ],
    '02.09':[
      ['Normalize a e b separadamente antes de somá-los.','Os casos incluem zero explícito, null e undefined; só os dois últimos significam ausência.','Use ?? 0 para cada entrada, depois exiba a normalizada, b normalizada e a soma nessa ordem.'],
    ],
    '02.10':[
      ['Divida os segundos por 60 antes de arredondar.','floor vai para baixo e ceil para cima; em negativos eles se afastam em direções diferentes.','Complete as oito chamadas na ordem do starter: quatro para positivos e depois quatro para negativos.'],
      ['min escolhe o menor valor e max o maior.','O sinal não muda qual valor abs retorna: ele mede a magnitude.','Use os argumentos x e y em min/max e deslocamento em abs.'],
      ['sorteio já está no intervalo de zero até antes de um.','Multiplique por seis para dividir esse intervalo em seis faixas iguais.','Use floor(sorteio * 6) + 1; isso mapeia zero para 1 e o extremo superior para 6.'],
    ],
    '02.11':[
      ['Compare primeiro a soma dos valores binários exatos 0.5 e 0.25.','Depois observe o valor exibido por 0.1 + 0.2 antes de testar igualdade com 0.3.','Use Number.isNaN para NaN e Number.isFinite para distinguir Infinity.'],
      ['O limite seguro termina em 2 ** 53 - 1.','2 ** 53 já está fora do conjunto seguro de inteiros.','isSafeInteger responde booleanos; typeof 1n devolve o texto "bigint".'],
    ],
    '02.12':[
      ['A política define tolerância como metade da resolução.','Use <= porque o limite é inclusivo; compare a distância entre a e b.','Exiba primeiro resolucao / 2 e depois Math.abs(a - b) <= tolerancia.'],
    ],
  };
  function check(id,index,source){
    const config=lessons[id]?.[index];if(!config)return {ok:false,message:'Bloco desconhecido.',results:[]};
    const runner=global.DevPathStage02Runner;
    const results=config.cases.map(item=>{
      const result=runner.run(source,item.fixtures);
      const same=(a,b)=>config.ignoreSignedZero && a===0 && b===0 || Object.is(a,b);
      const passed=result.ok && result.values.length===item.expected.length && result.values.every((value,index)=>same(value,item.expected[index]));
      return {...item,actual:result.values,error:result.error,passed};
    });
    let message='';
    if(source.trim()===config.starter.trim())message='Escreva ou altere o código antes de conferir.';
    if(config.explicitConversion) {
      const result=runner.run(source,config.cases[0].fixtures);
      if(!result.ok || result.calls.filter(name=>name==='Number').length<2 || !result.calls.includes('String'))message='Além das saídas, esta atividade pede conversões explícitas com Number() nas duas entradas e String() na apresentação.';
    }
    if(config.tolerance) {
      const result=runner.run(source,config.cases[0].fixtures);
      if(!Object.is(result.variables?.tolerancia,0.005))message='Declare tolerancia a partir da política antes da comparação.';
    }
    if(config.random) {
      const result=runner.run(source);
      if(!result.ok || !result.calls.includes('Math.random') || result.values.length!==2 || !(result.values[0]>=0 && result.values[0]<1) || !Number.isInteger(result.values[1]) || result.values[1]<1 || result.values[1]>6) message='Mantenha Math.random() no starter e exiba sorteio em [0,1) e uma face inteira de 1 a 6.';
    }
    const ok=!message && results.every(result=>result.passed);
    return {ok,results,message:message || (ok?'Todos os casos passaram. Explique o que aprendeu antes de concluir.':'Há casos para corrigir. Compare esperado e obtido; a primeira divergência ajuda a localizar o erro.')};
  }
  global.DevPathStage02Lessons={lessons,check,hints};
})(globalThis);
