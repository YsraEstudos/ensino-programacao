GET /itens -> 200, Content-Type application/json, body=[{"id":1}]
POST /itens -> 201, Location /itens/2, Content-Type application/json, body={"id":2}
GET /ausente -> 404, Content-Type text/plain, body=not found
GET /vazio -> 204, sem corpo

Para cada troca, separe status, headers e body. Não tente parsear JSON no 204 nem trate fetch como rejeição automática para 404.
