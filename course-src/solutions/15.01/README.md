# Referência 15.01

Matriz 15.01: (1) reservas[0] pode ser undefined com noUncheckedIndexedAccess; conferir existência antes de .nome. (2) EntradaFormulario.noites é string e não pode ser number; converter e validar. (3) JSON.parse em unknown exige guarda de objeto/campo antes de .checkIn. (4) Reserva.id é readonly; retornar uma cópia ou definir operação de renomeação. (5) literal fresco tem campo cafe ausente no contrato; corrigir a forma ou declarar extensão deliberada. (6) preco não retorna em todos os caminhos; tratar noites inválidas ou retornar um valor para cada ramo. Essas correções estáticas não validam o corpo de JSON recebido.

## Evidência independente
Em um handler de reserva, diagnostique uma leitura possivelmente ausente de lista e uma propriedade numérica vinda de JSON. Registre arquivo/linha, tipo conhecido, prova ausente e uma correção sem cast; mostre um payload inválido que ainda precisa de validação runtime.
