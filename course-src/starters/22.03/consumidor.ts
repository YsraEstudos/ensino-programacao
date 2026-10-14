// Depois de completar parser.d.ts, isto deve compilar:
import { parse } from "./parser.js";

const r = parse("10");
if (r.ok) {
  console.log(r.value.toFixed(2));
} else {
  console.log(r.error);
}

// E estas linhas devem falhar no typecheck (deixe com @ts-expect-error):
// @ts-expect-error value não existe no ramo de erro
if (!r.ok) console.log(r.value);
// @ts-expect-error parse só aceita string
parse(10);
