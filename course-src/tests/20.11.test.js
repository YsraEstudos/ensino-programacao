import {deBase64, paraBase64, paraHex} from './main.js';

const bytesDeAcao = Uint8Array.from([0x61, 0xc3, 0xa7, 0xc3, 0xa3, 0x6f]);

describe('Base64 e hexadecimal sobre bytes', () => {
  test('codifica os bytes de "ação" em Base64', () => {
    /*@case 20.11.codifica-os-bytes-de-acao-em-a1a0fd59*/expect(paraBase64(bytesDeAcao)).toBe('YcOnw6Nv');
  });
  test('codifica bytes em hexadecimal minúsculo com zero à esquerda', () => {
    /*@case 20.11.codifica-bytes-em-hexadecima-58a524a8*/expect(paraHex(Uint8Array.of(0, 255, 16))).toBe('00ff10');
    /*@case 20.11.codifica-bytes-em-hexadecima-f2c342cc*/expect(paraHex(bytesDeAcao)).toBe('61c3a7c3a36f');
  });
  test('ida e volta em Base64 devolve os mesmos bytes', () => {
    /*@case 20.11.ida-e-volta-em-base64-devolv-453c9241*/expect(Array.from(deBase64(paraBase64(bytesDeAcao)))).toEqual(Array.from(bytesDeAcao));
  });
  test('o caminho sem toBase64 e toHex dá o mesmo resultado', () => {
    const bytes = Uint8Array.from([0x61, 0xc3, 0xa7, 0xc3, 0xa3, 0x6f]);
    bytes.toBase64 = undefined;
    bytes.toHex = undefined;
    /*@case 20.11.o-caminho-sem-tobase64-e-toh-22552418*/expect(paraBase64(bytes)).toBe('YcOnw6Nv');
    /*@case 20.11.o-caminho-sem-tobase64-e-toh-afb5fabb*/expect(paraHex(bytes)).toBe('61c3a7c3a36f');
  });
});
