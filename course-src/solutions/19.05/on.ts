type Model={name:string;age:number}; declare function on<K extends string & keyof Model>(event:`${K}Changed`,listener:(value:Model[K])=>void):void;
