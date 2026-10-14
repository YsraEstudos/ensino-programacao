import {test} from "node:test";
import assert from "node:assert/strict";
import {Emitter,type Events} from "./emitter.ts";

test("listener recebe apenas o payload tipado do evento",()=>{const emitter=new Emitter<Events>();const values:Events["priceChanged"][]=[];emitter.on("priceChanged",value=>values.push(value));emitter.emit("priceChanged",{sku:"sku-1",price:4});assert.deepEqual(values,[{sku:"sku-1",price:4}]);});
test("off remove o callback e pode ser chamado novamente",()=>{const emitter=new Emitter<Events>();let calls=0;const listener=()=>{calls++;};emitter.on("itemRemoved",listener);emitter.off("itemRemoved",listener);emitter.off("itemRemoved",listener);emitter.emit("itemRemoved",{sku:"sku-2"});assert.equal(calls,0);});
test("eventos diferentes mantêm seus listeners isolados",()=>{const emitter=new Emitter<Events>();let added=0;let removed=0;emitter.on("itemAdded",()=>{added++;});emitter.on("itemRemoved",()=>{removed++;});emitter.emit("itemAdded",{sku:"sku-3"});assert.equal(added,1);assert.equal(removed,0);});
