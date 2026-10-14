# Revisão dos primers 1.A pelo subagente Luna high

Todos os 16 IDs solicitados foram lidos e comparados com os starters/receitas.
Suficientes: 04.02, 04.05, 04.07, 05.04, 06.08, 06.09, 06.10, 12.13, 16.04, 16.06.
Corrigir:
- 05.03: filter mantém retorno truthy; true é somente o caso deste callback.
- 05.06: sort/reverse em array congelado lançam TypeError também fora do strict; freeze é superficial.
- 06.06: explicar Set usado no starter: [...set] e new Set(valores).
- 06.07: contrato exige objeto indexado; Map não é substituto aceito. Delimitar __proto__: setter herdado/literal especial versus chave de dados própria/computada.
- 09.05: callbacks adiados leem mesmo binding var; let cria binding por iteração.
- 15.06: investigar compatibilidade estrutural e origem do private; a comparação interface/type não cobre o starter atual.

Remissões confirmadas: 06.10 -> etapa10; 12.13 -> etapa20 (20.07). Não mover IDs.
