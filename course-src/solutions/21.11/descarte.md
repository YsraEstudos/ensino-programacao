# 21.11 — Composição de erros

Com runtime que implementa Explicit Resource Management, corpo lança A e dispose lança B. SuppressedError.error é B e suppressed é A, pois a falha de cleanup foi suprimida pela falha anterior. Promise.any com todas rejeitadas lança AggregateError com errors [x,y]. finally manual não cria esse wrapper sem código explícito.
