export function* walk(node){if(node==null)return;for(const child of node.children??[])yield* walk(child);yield node.value;}export function* percorrer(tree){yield* walk(tree);}
