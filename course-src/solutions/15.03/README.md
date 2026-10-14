# Referência 15.03

Declare criarUsuario(nome: string, idade: number): Usuario. O nome da constante local pode ser inferido a partir de trim; a função retorna Usuario. Preserve criadoEm: new Date().toISOString() para registrar o instante atual em ISO, normalize espaços do nome e mantenha o limite mínimo de idade.

## Evidência independente
Projete criarPagina(titulo: string, limite: number) para normalizar o título e rejeitar limite abaixo de 1. Acrescente type assertions negativas para título numérico e retorno incompatível, além de um caso runtime próprio.
