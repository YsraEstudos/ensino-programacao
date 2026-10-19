import {test} from "node:test"; import assert from "node:assert/strict"; import {resumo} from "./pagamento.ts";
test('cada discriminante usa seu campo exclusivo',()=>{/*@case 16.03.cada-discriminante-usa-seu-c-99e512f9*/assert.equal(resumo({metodo:'pix',chave:'a@b'}),'Pix para a@b');/*@case 16.03.cada-discriminante-usa-seu-c-39303e3e*/assert.equal(resumo({metodo:'cartao',ultimos4:'1234'}),'Cartão final 1234');});
test('boleto mantém linha',()=>/*@case 16.03.boleto-mantem-codigo-93279f38*/assert.equal(resumo({metodo:'boleto',linha:'B-1'}),'Boleto B-1'));
test('valores distintos não colapsam',()=>/*@case 16.03.valores-distintos-nao-colaps-5fe7a8c0*/assert.notEqual(resumo({metodo:'pix',chave:'x'}),resumo({metodo:'boleto',linha:'x'})));
