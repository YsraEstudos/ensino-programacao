import {describe,expect,test} from 'vitest';
import fc from 'fast-check';
import {createSecurity} from '../src/security.mjs';
describe('propriedades de autorização',()=>{test('qualquer identidade diferente do dono não lê o recurso',()=>{const auth=createSecurity();const sessionId=auth.login('ana','demo-ana');fc.assert(fc.property(fc.string({minLength:1}).filter(id=>id!=='ana'),foreignId=>{expect(auth.canRead(sessionId,foreignId)).toBe(false);}),{numRuns:150});});});
