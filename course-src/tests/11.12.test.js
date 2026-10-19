import { mostrarTitulo } from './render.js';

function target() {
  const childNodes = [];
  return {
    childNodes,
    ownerDocument: { createTextNode(value) { return { nodeType: 3, data: value, textContent: value }; }, createComment(value) { return { nodeType: 8, data: value, textContent: value }; } },
    replaceChildren(...nodes) { childNodes.splice(0, childNodes.length, ...nodes); },
    appendChild(node) { childNodes.push(node); },
    querySelector(selector) { return childNodes.find(node => selector === 'img' && node.nodeType === 1) || null; },
    get textContent() { return childNodes.map(node => node.textContent ?? node.data ?? '').join(''); },
  };
}

describe('mostrarTitulo', () => {
  test('mantém tags como texto literal', () => { const node = target(); mostrarTitulo(node, '<b>olá</b>'); /*@case 11.12.mantem-tags-como-texto-liter-1d412d9d*/expect(node.textContent).toBe('<b>olá</b>'); /*@case 11.12.mantem-tags-como-texto-liter-4d36b08b*/expect(node.querySelector('img')).toBe(null); });
  test('preserva newline', () => { const node = target(); mostrarTitulo(node, 'a\nb'); /*@case 11.12.preserva-newline-65b55bbb*/expect(node.textContent).toBe('a\nb'); });
  test('string vazia cria comentário vazio', () => { const node = target(); mostrarTitulo(node, ''); /*@case 11.12.string-vazia-cria-comentario-5527d0ca*/expect(node.childNodes).toHaveLength(1); /*@case 11.12.string-vazia-cria-comentario-322953e9*/expect(node.childNodes[0].nodeType).toBe(8); /*@case 11.12.string-vazia-cria-comentario-35d93af8*/expect(node.childNodes[0].data).toBe(''); });
  test('não cria evento executável para img', () => { const node = target(); mostrarTitulo(node, '<img src=x onerror=alert(1)>'); /*@case 11.12.nao-cria-evento-executavel-p-694096b0*/expect(node.querySelector('img')).toBe(null); });
});
