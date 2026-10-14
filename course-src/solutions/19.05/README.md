# Referência 19.05

O parâmetro K é uma chave do modelo; o template literal forma o nome do evento e `Model[K]` determina o payload do listener. Outros nomes e callback com tipo incompatível são recusados.

## Transferência
Implemente `on` para Model `{name:string; age:number}` com eventos `nameChanged` e `ageChanged`. Mostre callback string para o primeiro e number para o segundo; borda: rejeite `ageChanged` com callback de string e evento `emailChanged` inexistente.
