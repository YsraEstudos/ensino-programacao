import { media, clamp, saudacao } from "./main.js";

// As funções devolvem o valor: nenhuma pode imprimir.
function semImprimir(corpo) {
  const original = console.log;
  let chamadas = 0;
  console.log = () => { chamadas++; };
  try { corpo(); } finally { console.log = original; }
  return chamadas;
}

describe("media", () => {
  test("média de dois números (exemplo público)", () => {
    const values = [2, 4];
    /*@case 04.04.media-de-dois-numeros-exempl-422f69a5*/expect(__devpathCaptureInput("04.04.media-de-dois-numeros-exempl-422f69a5", values, () => media(...values))).toBe(3);
  });
  test("zeros e resultado fracionário", () => {
    /*@case 04.04.zeros-e-resultado-fracionari-5e1a36a6*/expect(media(0, 0)).toBe(0);
    /*@case 04.04.zeros-e-resultado-fracionari-055c37fa*/expect(media(1, 2)).toBe(1.5);
  });
});

describe("clamp", () => {
  test("acima do máximo vira o máximo", () => {
    /*@case 04.04.acima-do-maximo-vira-o-maxim-af19251b*/expect(clamp(10, 0, 5)).toBe(5);
  });
  test("abaixo do mínimo vira o mínimo", () => {
    /*@case 04.04.abaixo-do-minimo-vira-o-mini-4dbe3161*/expect(clamp(-1, 0, 5)).toBe(0);
  });
  test("dentro do intervalo e nos limites não muda", () => {
    /*@case 04.04.dentro-do-intervalo-e-nos-li-8b6a56c1*/expect(clamp(3, 0, 5)).toBe(3);
    /*@case 04.04.dentro-do-intervalo-e-nos-li-3cb09ac0*/expect(clamp(0, 0, 5)).toBe(0);
    /*@case 04.04.dentro-do-intervalo-e-nos-li-e5c2b0d6*/expect(clamp(5, 0, 5)).toBe(5);
  });
});

describe("saudacao", () => {
  test("exemplo público", () => {
    /*@case 04.04.exemplo-publico-6e9bd203*/expect(saudacao("Ana")).toBe("Olá, Ana");
  });
  test("nome vazio mantém a vírgula e o espaço", () => {
    /*@case 04.04.nome-vazio-mantem-a-virgula--5f4572c2*/expect(saudacao("")).toBe("Olá, ");
  });
});

test("as funções devolvem valores e não imprimem", () => {
  /*@case 04.04.as-funcoes-devolvem-valores--cea7023b*/expect(semImprimir(() => { media(1, 2); clamp(9, 0, 5); saudacao("Ana"); })).toBe(0);
});
