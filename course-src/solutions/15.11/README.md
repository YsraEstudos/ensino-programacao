# Referência 15.11

Faça JSON.parse retornar unknown e separe JSON malformado (SyntaxError) de payload inválido (TypeError). Antes de acessar name, valide que o valor é objeto não nulo, contém name e que name é string; normalize para maiúsculas somente depois das guardas.

## Evidência independente
Leia um preço de storage como texto externo. Converta e valide formato/faixa antes de usá-lo; entregue casos para sucesso, texto inválido e valor fora da faixa e diferencie erro de parse de erro de domínio.
