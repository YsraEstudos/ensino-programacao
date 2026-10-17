export function createSecurity(){const sessions=new Map();return {login(user){const id=`s-${user}`;sessions.set(id,user);return id;},userFor(id){return sessions.get(id)??null;}};}
