Callback retorna valor, Promise ou lança. Compare:
Promise.try(callback)
try { Promise.resolve(callback()) } catch (erro) { Promise.reject(erro) }
Promise.resolve().then(callback)

Registre para cada forma quando o callback roda e como um throw síncrono aparece. Promise.try depende do runtime-alvo; não presuma disponibilidade universal.
