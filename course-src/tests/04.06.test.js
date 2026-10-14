import { dobro, somaDobros } from "./main.js";

function contarLogs(corpo) {
  const original = console.log;
  let chamadas = 0;
  console.log = () => { chamadas++; };
  try { corpo(); } finally { console.log = original; }
  return chamadas;
}

describe("dobro", () => {
  test("devolve o dobro", () => {
    /*@case 04.06.devolve-o-dobro-da061520*/expect(dobro(2)).toBe(4);
  });
  test("aceita negativos e zero", () => {
    /*@case 04.06.aceita-negativos-e-zero-6e637a31*/expect(dobro(-1)).toBe(-2);
    /*@case 04.06.aceita-negativos-e-zero-4b16e41f*/expect(dobro(0)).toBe(0);
  });
});

describe("somaDobros", () => {
  test("combina os dois valores (exemplo público)", () => {
    /*@case 04.06.combina-os-dois-valores-exem-e2098d1e*/expect(somaDobros(2, 3)).toBe(10);
  });
  test("zeros e negativos", () => {
    /*@case 04.06.zeros-e-negativos-12fce40a*/expect(somaDobros(0, 0)).toBe(0);
    /*@case 04.06.zeros-e-negativos-3b15aeb6*/expect(somaDobros(-1, 1)).toBe(0);
  });
});

test("o cálculo não imprime: a apresentação fica fora", () => {
  /*@case 04.06.o-calculo-nao-imprime-a-apre-7559766a*/expect(contarLogs(() => { dobro(2); somaDobros(2, 3); })).toBe(0);
});
