export function lerInscricao(form) { form.quantidade = Number(form.quantidade); return { ok: true, nome: String(form.nome).trim(), quantidade: form.quantidade, interesses: [] }; }
