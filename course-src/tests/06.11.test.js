import { resumirPerfil } from "./main.js";

describe("resumirPerfil: acesso opcional e padrão nullish", () => {
  test("aplica padrões para usuário ou perfil ausentes", () => {
    const padrao = { nome: "Visitante", pontos: 100, ativo: true, mensagem: "Sem mensagem" };
    /*@case 06.11.aplica-padroes-para-usuario--cf3641c1*/expect(resumirPerfil(undefined)).toEqual(padrao);
    /*@case 06.11.aplica-padroes-para-usuario--eb041a69*/expect(resumirPerfil(null)).toEqual(padrao);
    /*@case 06.11.aplica-padroes-para-usuario--24db0611*/expect(resumirPerfil({})).toEqual(padrao);
    /*@case 06.11.aplica-padroes-para-usuario--c1adc05d*/expect(resumirPerfil({ perfil: null })).toEqual(padrao);
  });

  test("preserva zero, false e string vazia", () => {
    /*@case 06.11.preserva-zero-false-e-string-75e5782c*/expect(resumirPerfil({ perfil: { nome: "Ana", pontos: 0, ativo: false, mensagem: "" } }))
      .toEqual({ nome: "Ana", pontos: 0, ativo: false, mensagem: "" });
  });

  test("usa o padrão quando uma propriedade é explicitamente null ou undefined", () => {
    /*@case 06.11.usa-o-padrao-quando-uma-prop-99c6ba3e*/expect(resumirPerfil({ perfil: { nome: undefined, pontos: null, ativo: undefined, mensagem: null } }))
      .toEqual({ nome: "Visitante", pontos: 100, ativo: true, mensagem: "Sem mensagem" });
  });

  test("?. não valida o tipo do contêiner: uma guard clause rejeita texto e array", () => {
    /*@case 06.11.nao-valida-o-tipo-do-contein-8c69e4f7*/expect(resumirPerfil({ perfil: "inválido" })).toBeNull();
    /*@case 06.11.nao-valida-o-tipo-do-contein-ca703bd3*/expect(resumirPerfil({ perfil: [] })).toBeNull();
  });
});
