export function* walk(node){if(node==null)return;yield node.value;for(const child of node.children??[])yield* walk(child);}export function* percorrer(tree){yield* walk(tree);}
