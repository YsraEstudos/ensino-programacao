import {adiarResposta, buscarComLimite, criarBuscaAtual} from './main.js';

// Respeita o sinal: rejeita com o motivo do sinal quando ele é abortado (timeout ou cancelamento).
function fetchQueNaoResponde(url, {signal}) {
  return new Promise((_, rejeitar) => signal.addEventListener('abort', () => rejeitar(signal.reason)));
}

async function erroDe(promessa) {
  try {
    await promessa;
    return null;
  } catch (erro) {
    return erro;
  }
}

describe('busca com cancelamento, timeout e resposta obsoleta', () => {
  test('devolve o texto quando a resposta chega dentro do limite', async () => {
    const fetchFalso = async () => ({text: async () => 'ok'});
    /*@case 12.21.devolve-o-texto-quando-a-res-015baf63*/expect(await buscarComLimite(fetchFalso, '/a', 1000)).toBe('ok');
  });
  test('cancelamento prévio rejeita com AbortError sem chamar fetch', async () => {
    let chamadas = 0;
    const controle = new AbortController();
    controle.abort();
    const erro = await erroDe(buscarComLimite(() => {
      chamadas += 1;
    }, '/a', 1000, controle.signal));
    /*@case 12.21.cancelamento-previo-rejeita--937f0186*/expect(erro.name).toBe('AbortError');
    /*@case 12.21.cancelamento-previo-rejeita--622ff297*/expect(chamadas).toBe(0);
  });
  test('timeout rejeita com TimeoutError quando o servidor não responde', async () => {
    const erro = await erroDe(buscarComLimite(fetchQueNaoResponde, '/lento', 10));
    /*@case 12.21.timeout-rejeita-com-timeoute-fb8c7861*/expect(erro.name).toBe('TimeoutError');
  });
  test('cancelamento durante a espera rejeita com AbortError', async () => {
    const controle = new AbortController();
    const resultado = erroDe(buscarComLimite(fetchQueNaoResponde, '/lento', 1000, controle.signal));
    controle.abort();
    /*@case 12.21.cancelamento-durante-a-esper-d5ac91bf*/expect((await resultado).name).toBe('AbortError');
  });
  test('só a busca mais recente entrega resultado; a obsoleta devolve undefined', async () => {
    const pendentes = [];
    const fetchQueIgnoraSinal = url => {
      const adiada = adiarResposta();
      pendentes.push(adiada);
      return adiada.promise.then(texto => ({text: async () => texto}));
    };
    const buscar = criarBuscaAtual(fetchQueIgnoraSinal);
    const primeira = buscar('/um');
    const segunda = buscar('/dois');
    pendentes[1].resolve('dois');
    pendentes[0].resolve('um');
    /*@case 12.21.so-a-busca-mais-recente-entr-a534f140*/expect(await segunda).toBe('dois');
    /*@case 12.21.so-a-busca-mais-recente-entr-9810e500*/expect(await primeira).toBe(undefined);
  });
});
