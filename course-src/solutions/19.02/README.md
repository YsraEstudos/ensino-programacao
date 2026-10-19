# Referência 19.02

O ramo verdadeiro captura o elemento de arrays mutáveis ou readonly e o ramo falso preserva `T`: arrays e tuplas produzem o tipo de elemento, e `number` permanece `number`. Como `T` está nu à esquerda de `extends`, uma união distribui; `ElementOrSelf<string[] | number>` resulta em `string | number`. Um ramo `unknown` perderia o escalar.
