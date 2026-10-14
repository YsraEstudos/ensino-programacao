export function lerInscricao(form) { const d = new FormData(form); return { ok: true, nome: d.get('nome'), quantidade: Number(d.get('quantidade')), interesses: d.get('interesse') }; }
