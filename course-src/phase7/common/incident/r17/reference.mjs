import {randomBytes} from 'node:crypto';
export function createSecurity(){const sessions=new Map();return {login(user){const id=randomBytes(32).toString('base64url');sessions.set(id,user);return id;},userFor(id){return sessions.get(id)??null;}};}
