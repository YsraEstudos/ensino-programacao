import type {Flags,User} from '../flags.js'; type F=Flags<User>; const flags:F={id:true,name:false,active:true};
// @ts-expect-error chaves inexistentes
const extra:F={id:true,name:false,active:true,email:true};
// @ts-expect-error valor deve ser boolean
const wrong:F={id:true,name:'no',active:true};
