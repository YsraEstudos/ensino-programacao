# Incidente reproduzível: r17

A versão r17 deriva IDs de sessão de `s-<username>` e aceita o mesmo ID se o usuário conhece o padrão. Reproduza no terminal da fixture:

```powershell
node --test incident/r17/repro.test.mjs
```

A reprovação esperada é uma asserção (`ERR_ASSERTION`) porque o cookie previsto acessa o recurso sem login. `reference.mjs` mostra a correção: token opaco criado com CSPRNG e verificado na sessão do servidor. O teste é sintético e local; não constitui evidência de incidente real.
