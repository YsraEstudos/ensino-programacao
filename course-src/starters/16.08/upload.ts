// 16.08 · Máquina de estados do upload de recibos.
// Estados: idle, selecting, uploading(progress 0..100), success(url), error(message).
// Ações: select, start, progress(valor), resolve(url), fail(message), reset.
// Política para ação incompatível com o estado: devolva o mesmo estado (documente no fim do arquivo).

export type Estado =
  | { status: "idle" }
  | { status: "selecting" }
  | { status: "uploading"; progress: number }
  | { status: "success"; url: string }
  | { status: "error"; message: string };

export type Acao =
  | { type: "select" }
  | { type: "start" }
  | { type: "progress"; valor: number }
  | { type: "resolve"; url: string }
  | { type: "fail"; message: string }
  | { type: "reset" };

export function reducer(estado: Estado, acao: Acao): Estado {
  // implemente as transições; progress fora de 0..100 lança RangeError
}

// Tabela de transições (preencha):
// estado      | ação     | próximo estado
// idle        | select   | selecting
// selecting   | start    | uploading 0
// uploading   | progress | ___
// uploading   | resolve  | ___
// ___         | ___      | ___
