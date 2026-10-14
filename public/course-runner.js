(function (global) {
  "use strict";

  // This function is serialized into the sandbox's worker. Keep it self-contained.
  function workerMain(runtimeSource, nodeRuntimeSource, caseRecords) {
    const emit = self.postMessage.bind(self);
    const lines = [];
    const outputLimit = 9000;
    let outputLength = 0;
    const show = value => {
      if (typeof value === "string") return value;
      try { return JSON.stringify(value) ?? String(value); }
      catch { return String(value); }
    };
    console.log = (...values) => {
      const line = values.map(show).join(" ");
      outputLength += line.length + 1;
      if (outputLength > outputLimit) throw new Error("Limite de saída excedido.");
      lines.push(line);
    };
    const send = (kind, error, tests) => emit({
      kind,
      text: error ? `${error.name || "Erro"}: ${error.message || String(error)}` : [lines.join("\n"), nodeRuntime?.process?.stdoutText || "", nodeRuntime?.process?.stderrText || ""].filter(Boolean).join("\n") || "(sem saída no console)",
      ...(tests ? {tests} : {}),
      ...(nodeRuntime ? {node: {exitCode: nodeRuntime.process.exitCode, stdout: nodeRuntime.process.stdoutText, stderr: nodeRuntime.process.stderrText}} : {})
    });

    const factory = (0, eval)(`(${runtimeSource})`);
    const runtime = factory({target: self, caseRecords});
    runtime.install(self);
    let nodeRuntime;

    self.onmessage = async event => {
      try {
        if (event.data && typeof event.data.module === "string") {
          if (event.data.nodeRuntime && nodeRuntimeSource) {
            const nodeFactory = (0, eval)(`(${nodeRuntimeSource})`);
            nodeRuntime = nodeFactory(event.data.nodeRuntime);
            self.__devpathNodeProcess = nodeRuntime.process;
            self.__devpathNodeModules = nodeRuntime.modules;
          }
          const moduleURL = URL.createObjectURL(new Blob([event.data.module], {type: "text/javascript"}));
          try { await import(moduleURL); } finally { URL.revokeObjectURL(moduleURL); }
        } else await new Function(`return (async () => {\n${event.data}\n})()`)();
        const tests = await runtime.run();
        if (tests.total) lines.push("", `Testes (${tests.total}):`, tests.text || "", `${tests.passed} de ${tests.total} testes passaram.`);
        send("result", undefined, tests.total ? {passed: tests.passed, failed: tests.failed, total: tests.total, ...(tests.firstFailure ? {firstFailure: tests.firstFailure} : {})} : undefined);
      } catch (error) { send("error", error); }
      finally { runtime.restore(); nodeRuntime?.reset?.(); delete self.__devpathNodeProcess; delete self.__devpathNodeModules; }
    };
  }

  // The iframe stays responsive even if the worker enters an infinite loop.
  function frameMain(token, workerSource, code, parentOrigin) {
    const blob = new Blob([workerSource], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const send = (kind, text, tests, node) => parent.postMessage({ token, kind, text, ...(tests ? { tests } : {}), ...(node ? { node } : {}) }, parentOrigin);
    let worker;
    const stop = () => {
      worker?.terminate();
      URL.revokeObjectURL(url);
    };
    addEventListener("message", event => {
      if (event.source === parent && event.origin === parentOrigin && event.data?.token === token && event.data.kind === "stop") stop();
    });
    addEventListener("pagehide", stop, { once: true });
    try {
      worker = new Worker(url);
      worker.onmessage = event => {
        if (!["result", "error"].includes(event.data?.kind)) return;
        stop();
        send(event.data.kind, String(event.data.text).slice(0, 9000), event.data.tests, event.data.node);
      };
      worker.onerror = event => {
        event.preventDefault();
        stop();
        send("error", event.message || "Não foi possível iniciar o executor.");
      };
      worker.postMessage(code);
    } catch (error) {
      stop();
      send("error", error.message);
    }
  }

  function run(code, onFinish, { timeoutMs = 2000, caseRecords = [] } = {}) {
    const token = crypto.randomUUID();
    const frame = document.createElement("iframe");
    frame.title = "Execução isolada do código do exercício";
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.hidden = true;
    const factory = global.DevPathTestRuntime?.createTestRuntime;
    const runtimeSource = factory?.toString();
    if (!runtimeSource) throw new Error("Runtime de testes indisponível.");
    const nodeRuntimeSource = global.DevPathNodeRuntime?.source || "";
    const args = JSON.stringify([token, `(${workerMain.toString()})(${JSON.stringify(runtimeSource)},${JSON.stringify(nodeRuntimeSource)},${JSON.stringify(caseRecords)})`, code, global.location.origin])
      .replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
    frame.srcdoc = `<!doctype html>
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; img-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">
      <script>(${frameMain.toString()})(...${args})</script>`;
    let settled = false;
    const finish = (kind, text, tests, node) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      global.removeEventListener("message", onMessage);
      frame.contentWindow?.postMessage({ token, kind: "stop" }, "*");
      frame.remove();
      onFinish(kind, String(text || "(sem saída)").slice(0, 9000), tests, node);
    };
    const onMessage = event => {
      if (event.source !== frame.contentWindow || event.data?.token !== token) return;
      if (!["result", "error"].includes(event.data.kind)) return;
       finish(event.data.kind, event.data.text, event.data.tests, event.data.node);
    };
    const timeout = setTimeout(() => finish("timeout", "O código foi interrompido. Procure um loop que não termina ou uma operação longa."), timeoutMs);
    global.addEventListener("message", onMessage);
    document.body.append(frame);
    return () => finish("cancelled", "Execução cancelada.");
  }

  global.DevPathCourseRunner = Object.freeze({ run });
})(window);
