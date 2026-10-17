import {test} from 'node:test'; import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {createSecurity}=await import(process.env.PHASE7_R17_MODULE ? pathToFileURL(process.env.PHASE7_R17_MODULE).href : './r17.mjs');
test('r17 reproduces a predictable authenticated session identifier',()=>{const auth=createSecurity(); const issued=auth.login('ana'); assert.notEqual(issued,'s-ana','r17 session IDs must not be derivable from the username'); assert.equal(auth.userFor(issued),'ana');});
