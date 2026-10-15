import {atrasoExponencial, comRetry, limitarConcorrencia} from './main.js';

describe('atraso exponencial limitado', () => {
  test('cresce com a tentativa e para no teto', () => {
    const cheio = () => 1;
    /*@case 12.18.cresce-com-a-tentativa-e-par-4dfb9c8e*/expect(atrasoExponencial(0, 100, 1000, cheio)).toBe(100);
    /*@case 12.18.cresce-com-a-tentativa-e-par-86a821fe*/expect(atrasoExponencial(3, 100, 1000, cheio)).toBe(800);
    /*@case 12.18.cresce-com-a-tentativa-e-par-4eeac83d*/expect(atrasoExponencial(9, 100, 1000, cheio)).toBe(1000);
  });
  test('aplica o jitter sobre o valor já limitado', () => {
    /*@case 12.18.aplica-o-jitter-sobre-o-valo-d393eb50*/expect(atrasoExponencial(3, 100, 1000, () => 0.5)).toBe(400);
  });
});

describe('concorrência limitada', () => {
  test('devolve resultados na ordem original e nunca passa do limite', async () => {
    let emVoo = 0;
    let maximo = 0;
    const tarefa = valor => async () => {
      emVoo += 1;
      maximo = Math.max(maximo, emVoo);
      await new Promise(resolve => setTimeout(resolve, 5 - valor));
      emVoo -= 1;
      return valor * 10;
    };
    const resultado = await limitarConcorrencia([tarefa(0), tarefa(1), tarefa(2), tarefa(3), tarefa(4)], 2);
    /*@case 12.18.devolve-resultados-na-ordem--33f2da5e*/expect(resultado).toEqual([0, 10, 20, 30, 40]);
    /*@case 12.18.devolve-resultados-na-ordem--9b09c33c*/expect(maximo).toBe(2);
  });
});

describe('retry com espera injetada', () => {
  test('repete após falhas e devolve o primeiro sucesso', async () => {
    let chamadas = 0;
    const esperas = [];
    const resultado = await comRetry(async () => {
      chamadas += 1;
      if (chamadas < 3) throw new Error('falha');
      return 'ok';
    }, {tentativas: 3, base: 100, teto: 1000, aleatorio: () => 1, espera: async ms => { esperas.push(ms); }});
    /*@case 12.18.repete-apos-falhas-e-devolve-f0012d41*/expect(resultado).toBe('ok');
    /*@case 12.18.repete-apos-falhas-e-devolve-8b156362*/expect(esperas).toEqual([100, 200]);
  });
  test('rejeita com o último erro quando todas as tentativas falham', async () => {
    let erro;
    try {
      await comRetry(async () => { throw new Error('indisponível'); }, {tentativas: 2, base: 100, teto: 1000, aleatorio: () => 1, espera: async () => {}});
    } catch (falha) {
      erro = falha;
    }
    /*@case 12.18.rejeita-com-o-ultimo-erro-qu-c1997032*/expect(erro.message).toBe('indisponível');
  });
  test('tentativas abaixo de 1 é erro de contrato', async () => {
    let erro;
    try {
      await comRetry(async () => 'ok', {tentativas: 0, base: 100, teto: 1000, aleatorio: () => 1, espera: async () => {}});
    } catch (falha) {
      erro = falha;
    }
    /*@case 12.18.tentativas-abaixo-de-1-e-err-1e2d53b9*/expect(erro instanceof RangeError).toBe(true);
  });
});
