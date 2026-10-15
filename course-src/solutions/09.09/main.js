const ESCAPES = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
const escapar = valor => String(valor).replace(/[&<>"']/g, c => ESCAPES[c]);

export function html(strings, ...valores) {
  let saida = '';
  strings.forEach((parte, i) => {
    saida += parte;
    if (i < valores.length) saida += escapar(valores[i]);
  });
  return saida;
}
