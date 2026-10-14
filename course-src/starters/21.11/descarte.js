// 21.11 · Erro no corpo e erro no descarte.
// Preveja antes de executar: qual erro sai do bloco? Quais propriedades ele tem?

function recurso() {
  return {
    [Symbol.dispose]() {
      throw new Error("B: falha ao fechar");
    },
  };
}

function corpoEDescarteFalham() {
  using r = recurso();
  throw new Error("A: falha no corpo");
}

try {
  corpoEDescarteFalham();
} catch (erro) {
  console.log(erro.name, "| error:", erro.error?.message, "| suppressed:", erro.suppressed?.message);
}

// Compare com Promise.any quando todas rejeitam:
try {
  await Promise.any([Promise.reject(new Error("x")), Promise.reject(new Error("y"))]);
} catch (erro) {
  console.log(erro.name, "| errors:", erro.errors.map((e) => e.message));
}

// Previsões: nome do primeiro erro ___; error = ___; suppressed = ___.
// Um fallback com try/finally cria SuppressedError automaticamente? ___
