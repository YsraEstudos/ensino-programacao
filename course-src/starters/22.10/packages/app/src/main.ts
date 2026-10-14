// app consome core pela saída compilada (.d.ts), não pelo código-fonte.
import { total, type Item } from "../../core/dist/index.js";

const carrinho: Item[] = [{ sku: "a", preco: 10 }, { sku: "b", preco: 5 }];
console.log(total(carrinho));
