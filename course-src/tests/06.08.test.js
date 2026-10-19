import { migrar } from "./main.js";

const padrao = { version: 2, audio: { volume: 50 } };

describe("dados antigos e atuais", () => {
  test("v1 vira v2 (exemplo público)", () => {
    /*@case 06.08.v1-vira-v2-exemplo-publico-cc3dbf14*/expect(migrar('{"version":1,"volume":0}')).toEqual({ version: 2, audio: { volume: 0 } });
  });
  test("valores válidos são preservados, inclusive 0", () => {
    /*@case 06.08.valores-validos-sao-preserva-8ea961af*/expect(migrar('{"version":1,"volume":80}')).toEqual({ version: 2, audio: { volume: 80 } });
    /*@case 06.08.valores-validos-sao-preserva-f074d462*/expect(migrar('{"version":2,"audio":{"volume":0}}')).toEqual({ version: 2, audio: { volume: 0 } });
    /*@case 06.08.valores-validos-sao-preserva-8ff11ab6*/expect(migrar('{"version":2,"audio":{"volume":30}}')).toEqual({ version: 2, audio: { volume: 30 } });
  });
  test("v1 sem volume usa o padrão 50", () => {
    /*@case 06.08.v1-sem-volume-usa-o-padrao-5-ee094f38*/expect(migrar('{"version":1}')).toEqual(padrao);
  });
});

describe("ausência e corrupção", () => {
  test("JSON corrompido restaura o padrão", () => {
    /*@case 06.08.json-corrompido-restaura-o-p-e4d35e03*/expect(migrar("{quebrado")).toEqual(padrao);
  });
  test("texto vazio restaura o padrão", () => {
    /*@case 06.08.texto-vazio-restaura-o-padra-7c80d43b*/expect(migrar("")).toEqual(padrao);
  });
  test("JSON válido sem versão ou que não é objeto restaura o padrão", () => {
    /*@case 06.08.json-valido-sem-versao-ou-qu-05963fe0*/expect(migrar("{}")).toEqual(padrao);
    /*@case 06.08.json-valido-sem-versao-ou-qu-6cb3d24b*/expect(migrar("42")).toEqual(padrao);
    /*@case 06.08.json-valido-sem-versao-ou-qu-9c064376*/expect(migrar("null")).toEqual(padrao);
  });
  test("v2 sem áudio e versão textual restauram o padrão", () => {
    /*@case 06.08.v2-sem-audio-e-versao-textua-1ebc12bb*/expect(migrar('{"version":2}')).toEqual(padrao);
    /*@case 06.08.v2-sem-audio-e-versao-textua-75d51bdc*/expect(migrar('{"version":2,"audio":null}')).toEqual(padrao);
    /*@case 06.08.v2-sem-audio-e-versao-textua-2adfe163*/expect(migrar('{"version":"2"}')).toEqual(padrao);
  });
});

describe("versão futura", () => {
  test("não tenta migrar", () => {
    /*@case 06.08.nao-tenta-migrar-116c6bce*/expect(migrar('{"version":3,"audio":{"volume":9}}')).toEqual({ status: "unsupported", version: 3 });
    /*@case 06.08.nao-tenta-migrar-82050c82*/expect(migrar('{"version":10}')).toEqual({ status: "unsupported", version: 10 });
  });
});
