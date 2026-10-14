import {criarNotificador} from './main.js';

test('notificador usa canal intercambiável sem criar subclasses por canal', () => {
  const mensagens = [];
  const email = {enviar(texto) {mensagens.push(`email:${texto}`); return 'email-ok';}};
  const sms = {enviar(texto) {mensagens.push(`sms:${texto}`); return 'sms-ok';}};
  const notificador = criarNotificador(email);
  /*@case 10.07.notificador-usa-canal-interc-18e3454d*/expect(notificador.enviar('Olá')).toBe('email-ok');
  /*@case 10.07.notificador-usa-canal-interc-f9f856f1*/expect(criarNotificador(sms).enviar('Oi')).toBe('sms-ok');
  /*@case 10.07.notificador-usa-canal-interc-e83c5f54*/expect(mensagens).toEqual(['email:Olá', 'sms:Oi']);
});
