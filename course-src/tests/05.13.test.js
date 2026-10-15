import {consoantes, extrairPares} from './main.js';

describe('pares chave=valor', () => {
  test('extrai todos os pares separados por ponto e vírgula', () => {
    /*@case 05.13.extrai-todos-os-pares-separa-72fbbba7*/expect(extrairPares('nome=Ana; cidade=Recife')).toEqual([{chave: 'nome', valor: 'Ana'}, {chave: 'cidade', valor: 'Recife'}]);
  });
  test('aceita chave em maiúsculas', () => {
    /*@case 05.13.aceita-chave-em-maiusculas-3ba325e6*/expect(extrairPares('Nome=Ana')).toEqual([{chave: 'Nome', valor: 'Ana'}]);
  });
  test('texto sem pares devolve lista vazia', () => {
    /*@case 05.13.texto-sem-pares-devolve-list-14cfb60e*/expect(extrairPares('sem pares')).toEqual([]);
  });
});

describe('consoantes com classe de caracteres', () => {
  test('mantém letras que não são vogais, inclusive acentuadas', () => {
    /*@case 05.13.mantem-letras-que-nao-sao-vo-d744ea9f*/expect(consoantes('Ação')).toEqual(['ç']);
    /*@case 05.13.mantem-letras-que-nao-sao-vo-7163352b*/expect(consoantes('AÇÃO')).toEqual(['Ç']);
  });
});
