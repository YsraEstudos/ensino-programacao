"""Build the AMOLED site blueprint directly from the canonical editorial source."""
from __future__ import annotations

import hashlib
import html
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)
from generated_data import GENERATED_DIR

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
OUT = PROJECT / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)
PDF = OUT / "JavaScript_TypeScript_Roteiro_do_Site_3a_Edicao.pdf"
MANIFEST = OUT / "manifesto_exercicios_site_3a_edicao.json"

records = json.loads((GENERATED_DIR / "resolved_preview.json").read_text(encoding="utf-8"))
coverage = json.loads((GENERATED_DIR / "audit_coverage.json").read_text(encoding="utf-8"))
graph = json.loads((GENERATED_DIR / "concept_graph.json").read_text(encoding="utf-8"))
audit_requirements = json.loads((ROOT / "audit_requirements.json").read_text(encoding="utf-8"))

# Carregar o catálogo publicado do site para incorporar overrides editoriais, primers e revisões ativas
CATALOG_PATH = PROJECT / "public" / "course-catalog.json"
catalog_by_id = {}
if CATALOG_PATH.exists():
    for item in json.loads(CATALOG_PATH.read_text(encoding="utf-8")):
        catalog_by_id[item["id"]] = item

for record in records:
    cat = catalog_by_id.get(record["id"])
    if cat:
        if cat.get("title"):
            record["title"] = cat["title"]
        learner = record.setdefault("learner", {})
        if cat.get("prompt"):
            learner["prompt"] = cat["prompt"]
        if cat.get("objective"):
            learner["objective"] = cat["objective"]
        elif cat.get("firstResponse", {}).get("action"):
            learner["objective"] = cat["firstResponse"]["action"]
        if cat.get("starterFiles"):
            learner["starter_files"] = cat["starterFiles"]
        if cat.get("examples"):
            learner["public_examples"] = cat["examples"]
        if cat.get("checks"):
            learner["public_tests"] = cat["checks"]
        if cat.get("constraints"):
            learner["constraints"] = cat["constraints"]
        if cat.get("edgeCases"):
            learner["edge_contract"] = cat["edgeCases"]
        if cat.get("explanation"):
            learner["explanation"] = cat["explanation"]
        if cat.get("interaction"):
            learner["interaction"] = cat["interaction"]
        if cat.get("rubric"):
            learner["visible_rubric"] = cat["rubric"]
        if cat.get("resources"):
            learner["resources"] = cat["resources"]
        if cat.get("primers"):
            record["primers"] = cat["primers"]
        if cat.get("review"):
            record["review"] = cat["review"]
        if cat.get("autoTested"):
            record["autoTested"] = True

record_ids = [record["id"] for record in records]
assert len(record_ids) == len(set(record_ids))
assert [item["id"] for item in coverage] == [item["id"] for item in audit_requirements]
assert all(r["status"] == "contract_ready" for r in records)
activity_count = len(records)
audit_count = len(coverage)
stage_count = len({record["stage"] for record in records if record["stage"] != "D"})
diagnostic_count = sum(record["stage"] == "D" for record in records)

source_files = ([ROOT / "site_spec.md", ROOT / "implementation_protocol.md", ROOT / "bridges.md",
                 ROOT / "extras.py", ROOT / "compile_content.py", ROOT / "build_graph.py",
                 ROOT / "build_coverage.py"] + ([ROOT / "publication-overrides.json"] if (ROOT / "publication-overrides.json").exists() else []) + sorted((ROOT / "recipes").glob("[0-9D]*.py")))
digest = hashlib.sha256()
for path in source_files:
    digest.update(path.name.encode("utf-8"))
    digest.update(path.read_bytes())
revision = digest.hexdigest()

manifest = {
    "edition": "3.1", "date": "2026-09-28", "editorial_sha256": revision,
    "active_count": len(records), "retired_redirects": graph["retired_redirects"],
    "records": records, "concept_graph": graph,
    "audit_coverage": coverage,
    "publication_note": "contract_ready is an editorial status; site READY requires executable files, tests, runtime review and a second editor",
}
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")

BG = colors.HexColor("#050608")
PANEL = colors.HexColor("#11151D")
FG = colors.HexColor("#F2F5F8")
MUTED = colors.HexColor("#B2BDCC")
CYAN = colors.HexColor("#6EF0DA")
VIOLET = colors.HexColor("#C8B4FF")
AMBER = colors.HexColor("#FFC77F")
BORDER = colors.HexColor("#28313F")

styles = {
 "cover_small": ParagraphStyle("cover_small", fontName="Arial-Bold", fontSize=11, leading=17, textColor=CYAN, spaceAfter=16),
 "cover_title": ParagraphStyle("cover_title", fontName="Arial-Bold", fontSize=34, leading=40, textColor=FG, spaceAfter=16),
 "cover_sub": ParagraphStyle("cover_sub", fontName="Arial", fontSize=13, leading=19, textColor=MUTED, spaceAfter=17),
 "h1": ParagraphStyle("h1", fontName="Arial-Bold", fontSize=19, leading=23, textColor=CYAN, spaceBefore=18, spaceAfter=12, keepWithNext=True),
 "h2": ParagraphStyle("h2", fontName="Arial-Bold", fontSize=13, leading=17, textColor=VIOLET, spaceBefore=13, spaceAfter=7, keepWithNext=True),
 "h3": ParagraphStyle("h3", fontName="Arial-Bold", fontSize=10, leading=14, textColor=AMBER, spaceBefore=8, spaceAfter=4, keepWithNext=True),
 "body": ParagraphStyle("body", fontName="Arial", fontSize=8.7, leading=13.1, textColor=FG, spaceAfter=6, allowWidows=0, allowOrphans=0, splitLongWords=1),
 "muted": ParagraphStyle("muted", fontName="Arial", fontSize=8.3, leading=12.2, textColor=MUTED, spaceAfter=5, splitLongWords=1),
 "bullet": ParagraphStyle("bullet", fontName="Arial", fontSize=8.6, leading=12.7, textColor=FG, leftIndent=13, firstLineIndent=-9, spaceAfter=4, splitLongWords=1),
 "card_title": ParagraphStyle("card_title", fontName="Arial-Bold", fontSize=17, leading=20, textColor=FG, spaceAfter=5, keepWithNext=True),
 "card_meta": ParagraphStyle("card_meta", fontName="Arial", fontSize=8, leading=11, textColor=MUTED, spaceAfter=6),
 "card_label": ParagraphStyle("card_label", fontName="Arial-Bold", fontSize=8.7, leading=12.2, textColor=CYAN, spaceBefore=4, spaceAfter=2, keepWithNext=True),
 "card_body": ParagraphStyle("card_body", fontName="Arial", fontSize=9.0, leading=13.0, textColor=FG, spaceAfter=3, splitLongWords=1),
 "card_small": ParagraphStyle("card_small", fontName="Arial", fontSize=8.4, leading=11.8, textColor=MUTED, spaceAfter=3, splitLongWords=1),
 "matrix": ParagraphStyle("matrix", fontName="Arial", fontSize=8.1, leading=11.5, textColor=FG, spaceAfter=5, splitLongWords=1),
}

def rich(value: str) -> str:
    parts = re.split(r"(`[^`]+`)", str(value))
    out = []
    for part in parts:
        if part.startswith("`") and part.endswith("`"):
            out.append(f'<font color="#C8B4FF">{html.escape(part[1:-1])}</font>')
        else:
            out.append(html.escape(part).replace("\n", "<br/>"))
    return "".join(out)

def P(value: str, style="body") -> Paragraph:
    return Paragraph(rich(value), styles[style])

def label(text: str, color: str = "#6EF0DA") -> Paragraph:
    return Paragraph(f'<font color="{color}"><b>{html.escape(text)}</b></font>', styles["card_label"])

def line(label_text: str, value: str, style="card_body") -> list:
    return [label(label_text), P(value or "—", style)]

class Book(BaseDocTemplate):
    def __init__(self, path: Path, activity_count: int, audit_count: int):
        super().__init__(str(path), pagesize=A4, leftMargin=40, rightMargin=40,
                         topMargin=47, bottomMargin=43, title="JavaScript + TypeScript — Roteiro do Site — 3ª edição",
                         author="Especificação curricular", subject=f"Contratos editoriais de {activity_count} exercícios e {audit_count} observações")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="normal")
        self.addPageTemplates(PageTemplate(id="dark", frames=frame, onPage=self.draw_page))
        self._outline = set()

    def draw_page(self, canvas, doc):
        canvas.saveState()
        w, h = A4
        canvas.setFillColor(BG)
        canvas.rect(0, 0, w, h, fill=1, stroke=0)
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.6)
        canvas.line(40, h - 31, w - 40, h - 31)
        canvas.line(40, 31, w - 40, 31)
        canvas.setFont("Arial-Bold", 7.5)
        canvas.setFillColor(CYAN)
        canvas.drawString(40, h - 23, "JS + TS  /  ROTEIRO DO SITE  /  3ª EDIÇÃO")
        canvas.setFont("Arial", 7)
        canvas.setFillColor(MUTED)
        canvas.drawRightString(w - 40, h - 23, f"REV {revision[:12]}")
        canvas.drawRightString(w - 40, 19, f"{doc.page:03d}")
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if not isinstance(flowable, Paragraph):
            return
        key = getattr(flowable, "bookmark_key", None)
        if key and key not in self._outline:
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(getattr(flowable, "bookmark_title", key), key,
                                      level=getattr(flowable, "bookmark_level", 0), closed=False)
            self._outline.add(key)

def heading(text: str, level: int, key: str | None = None) -> Paragraph:
    para = P(text, f"h{level}")
    if key:
        para.bookmark_key = key
        para.bookmark_title = text
        para.bookmark_level = min(level - 1, 1)
    return para

def parse_markdown(path: Path, omit_sections: set[str] | None = None) -> list:
    lines = path.read_text(encoding="utf-8").splitlines()
    flow = []
    pending = []
    excluded = False
    def flush():
        if pending:
            flow.append(P(" ".join(pending)))
            pending.clear()
    for raw in lines:
        s = raw.strip()
        if s.startswith("## "):
            flush()
            excluded = bool(omit_sections and any(s.startswith(x) for x in omit_sections))
            if not excluded:
                flow.append(heading(s[3:], 2))
        elif excluded:
            continue
        elif s.startswith("# "):
            flush(); flow.append(heading(s[2:], 1))
        elif s.startswith("### "):
            flush(); flow.append(heading(s[4:], 3))
        elif s.startswith("- "):
            flush(); flow.append(P("• " + s[2:], "bullet"))
        elif not s:
            flush()
        else:
            pending.append(s)
    flush()
    return flow

STAGES = {
 "D":"Diagnóstico inicial", "00":"Ambiente e leitura de código", "01":"Valores e tipos",
 "02":"Operadores, Math e Number", "03":"Decisões e repetição", "04":"Funções e decomposição",
 "05":"Strings, arrays, regex e Unicode", "06":"Objetos, referências e JSON",
 "07":"Callbacks, coleções e pipelines", "08":"Algoritmos e complexidade",
 "09":"Escopo e closures", "10":"this, protótipos e classes",
 "11":"DOM, eventos, formulário e Kanban", "12":"HTTP, assincronismo e tempo",
 "13":"Teste, debugger e manutenção do Kanban", "14":"ESM, Node, npm e Git",
 "15":"TypeScript: contratos e runtime", "16":"Unions, narrowing e validação",
 "17":"Generics e APIs reutilizáveis", "18":"Utility types e relações entre tipos",
 "19":"Tipos avançados com propósito", "20":"Iteradores, streams e bytes",
 "21":"Performance, workers e recursos", "22":"Pacotes, declarations e schemas",
 "23":"Arquitetura, manutenção e capstone",
}

def card(item: dict) -> list:
    L, X = item["learner"], item.get("platform", {})
    did = item["id"]
    title = P(f"{did}  {item['title']}", "card_title")
    title.bookmark_key = "item-" + did.replace(".", "-")
    title.bookmark_title = f"{did} {item['title']}"
    title.bookmark_level = 1
    d = item["difficulty"]
    names = {"novelty":"novidade","syntax":"sintaxe","composition":"composição","state":"estado",
             "debugging":"depuração","files":"arquivos","reading":"leitura",
             "independence":"autonomia","tools":"ferramentas"}
    dims = [f"{names[k]} {d[k]}" for k in names]
    flow = [title,
            P(f"{item['kind']}{' · TRILHA OPCIONAL' if item.get('optional') else ''} · {item['estimated_minutes']} min (estimativa, sem nota por velocidade) · "
              f"{item['runtime']} · dificuldade multidimensional {d['display']}/5", "card_meta"),
            P("Competência: " + item["primary_skill"] + "  |  Requer: " + (", ".join(item.get("requires", [])) or "nenhum") +
              "  |  Introduz: " + ", ".join(item.get("introduces", [])), "card_small"),
            P("Eixos: " + " · ".join(dims), "card_small"),
            label("VISÃO DO ALUNO", "#6EF0DA"),
            P(L["prompt"])]

    if L.get("objective"):
        flow.extend(line("Objetivo da atividade", L["objective"]))

    exp = L.get("explanation")
    if isinstance(exp, dict):
        exp_lines = []
        if exp.get("mental_model"):
            exp_lines.append(f"• Modelo mental: {exp['mental_model']}")
        if exp.get("worked_example"):
            exp_lines.append(f"• Exemplo resolvido: {exp['worked_example']}")
        if exp.get("common_trap"):
            exp_lines.append(f"• Armadilha comum: {exp['common_trap']}")
        if exp.get("why_it_matters"):
            exp_lines.append(f"• Por que importa: {exp['why_it_matters']}")
        if exp_lines:
            flow.extend(line("Explicação e modelo mental", "\n".join(exp_lines)))
    elif isinstance(exp, str) and exp.strip():
        flow.extend(line("Explicação e modelo mental", exp))

    starters = L.get("starter_files") or []
    flow.extend(line("Material/arquivo inicial", " | ".join(f["path"] + ": " + f["content"] for f in starters) if starters else "Início limpo (sem arquivo prévio)"))

    examples = L.get("public_examples") or []
    flow.extend(line("Exemplo e resultado público", " | ".join(c.get("given", "") + " → " + c.get("expected", "") for c in examples) if examples else "Especificado no enunciado"))

    edges = L.get("edge_contract") or []
    flow.extend(line("Bordas e erros publicados", " | ".join(edges) if edges else "Comportamento padrão"))

    tests = L.get("public_tests") or []
    scoring = "Verificação de conformidade"
    if tests and isinstance(tests[0], dict) and "scoring" in tests[0]:
        scoring = tests[0]["scoring"]
    elif item.get("autoTested"):
        scoring = "Verificado por testes executáveis automatizados"
    flow.extend(line("Teste público e aprovação visível", scoring))

    constraints = L.get("constraints") or []
    policy = L.get("docs_policy") or ""
    const_text = ("; ".join(constraints) + ". " if constraints else "") + policy
    if const_text.strip():
        flow.extend(line("Restrições e documentação", const_text, "card_small"))

    if item.get("primers"):
        flow.extend(line("Conceitos prévios (Primers)", " | ".join(item["primers"]), "card_small"))

    rev = item.get("review")
    if rev and isinstance(rev, dict) and rev.get("prompt"):
        flow.append(label("REVISÃO ATIVA (QUIZ DE FIXAÇÃO DO SITE)", "#FFC77F"))
        flow.append(P(rev["prompt"], "card_body"))
        choices = rev.get("choices", [])
        ans = rev.get("answer", -1)
        choice_lines = []
        for idx, choice in enumerate(choices):
            prefix = "✓ (Correta) " if idx == ans else "• "
            choice_lines.append(f"{prefix}{choice}")
        flow.append(P("\n".join(choice_lines), "card_body"))
        if rev.get("correctFeedback"):
            flow.extend(line("Por que a resposta está certa", rev["correctFeedback"], "card_small"))
        if rev.get("incorrectFeedback"):
            flow.extend(line("Armadilha da alternativa incorreta", rev["incorrectFeedback"], "card_small"))

    flow.append(label("VISÃO DA PLATAFORMA / REVISOR", "#C8B4FF"))
    hidden = X.get("hidden_cases") or []
    flow.extend(line("Caso reservado dentro do contrato público", " | ".join(c.get("given", "") + " → " + c.get("expected", "") for c in hidden) if hidden else "Sem casos reservados adicionais"))
    flow.extend(line("Concepção errada e falha observável", (X.get("misconception_target") or "—") + "  /  " + (X.get("observable_failure") or "—")))
    flow.extend(line("Pergunta diagnóstica", X.get("diagnostic_question") or "—"))

    hints = X.get("hints") or {}
    hint_str = "1. " + hints.get("conceptual", "—") + "  2. " + hints.get("decomposition", "—") + "  3. " + hints.get("analogous_example", "—")
    flow.extend(line("Pistas graduais", hint_str))

    solution = X.get("worked_solution") or {}
    flow.extend(line("Solução de referência explicada", solution.get("explanation") or "—"))

    transfer = X.get("transfer") or {}
    flow.extend(line("Transferência em outro contexto", transfer.get("prompt") or "—"))

    mastery = X.get("mastery_evidence") or []
    flow.extend(line("Evidência de domínio", " ".join(mastery) if mastery else "—", "card_small"))

    flow.append(P("Compatibilidade: " + (item.get("compatibility") or "—") + "  |  Próxima sugestão: " +
                  (", ".join(X.get("next_ids") or []) or "conclusão da trilha"), "card_small"))
    flow.append(P("Telemetria: " + (", ".join(X.get("telemetry") or []) or "padrão"), "card_small"))
    return flow

flow = []
flow.extend([Spacer(1, 72), P("CADERNO EDITORIAL · 28 SET 2026", "cover_small"),
             P("JavaScript +\nTypeScript", "cover_title"),
             P("Do zero ao avançado · Roteiro completo do site · 3ª edição AMOLED", "cover_sub"),
             P(f"{activity_count} atividades ativas em {stage_count} etapas e {diagnostic_count} itens de diagnóstico; {audit_count} observações de auditoria rastreadas. "
               "Cada atividade explicita o que o aluno vê e o contrato da plataforma. Esta é a fonte para "
               "implementar o site, atividade por atividade.", "cover_sub"),
             Spacer(1, 25),
             P("Revisão editorial SHA-256: " + revision, "muted"),
             P("Estado: contratos editoriais completos. Publicação no site exige arquivos, testes executáveis, "
               "verificação no runtime e segunda revisão.", "muted"),
             PageBreak()])

flow.append(heading("Como usar este caderno", 1, "guide"))
flow.append(P("Comece pelo protocolo de implementação e pelo grafo. Para publicar uma atividade, localize seu ID, "
              "crie o material inicial, transforme os casos descritos em testes executáveis, execute a solução de referência "
              "e revise a transferência. A trilha de aprendizagem usa as pontes conceituais antes das atividades indicadas."))
flow.append(P("A visão do aluno contém todo comportamento que pode ser cobrado. A visão da plataforma guarda "
              "variações reservadas, diagnóstico e ajuda. O teste reservado nunca acrescenta regra não publicada."))
flow.append(heading("Mapa das etapas", 2))
for key, name in STAGES.items():
    flow.append(P(f"{key} · {name}", "bullet"))
flow.append(PageBreak())

flow.extend(parse_markdown(ROOT / "implementation_protocol.md"))
flow.append(PageBreak())
flow.extend(parse_markdown(ROOT / "site_spec.md", omit_sections={"## 10. Contratos modelo"}))
flow.append(PageBreak())
flow.extend(parse_markdown(ROOT / "bridges.md"))
flow.append(PageBreak())

flow.append(heading("Grafo curricular e dificuldade", 1, "graph"))
flow.append(P(f"O grafo contém {len(graph['concepts'])} conceitos, {len(graph['activities'])} atividades e "
              f"{len(graph['edges'])} arestas verificadas sem ciclo. O ID 15.05 redireciona para 16.09. "
              "Conceitos de uma etapa são ensinados na ponte/aula antes dos cartões que os exigem; pré-requisito de etapa futura invalida o build."))
flow.append(P("A dificuldade registrada em cada ficha tem nove eixos: novidade, sintaxe, composição, estado, "
              "depuração, quantidade de arquivos, leitura, independência e ferramentas. A nota visual 1–5 resume o perfil, "
              "mas o motor usa os eixos e a evidência do aluno; minutos são apenas previsão de esforço."))
flow.append(heading("Conceitos por etapa", 2))
for stage in [f"{n:02d}" for n in range(24)]:
    concepts = [c["id"] for c in graph["concepts"] if c["introduced_at"] == stage]
    flow.append(P(stage + "  " + STAGES[stage] + ": " + ", ".join(concepts), "bullet"))
flow.append(PageBreak())

by_stage = defaultdict(list)
for item in records:
    by_stage[item["stage"]].append(item)
for stage in STAGES:
    flow.append(heading(f"{stage}  {STAGES[stage]}", 1, "stage-" + stage))
    items = by_stage[stage]
    flow.append(P(f"{len(items)} atividades · Sequência editorial de implementação e aprendizagem. "
                  "As pontes anteriores apresentam os conceitos e exemplos antes da tentativa independente."))
    if stage == "03":
        flow.append(P("A unidade 03A cobre decisão; a 03B cobre repetição. A ordem dos IDs nesta seção é intencional."))
    if stage == "05":
        flow.append(P("A unidade 05A cobre strings/arrays/Unicode; a 05B trata regex e parsing após a base."))
    if stage == "11":
        flow.append(P("Carregamento e módulos de navegador vêm antes do Kanban; migração e testes voltam na etapa 13."))
    if stage == "12":
        flow.append(P("HTTP e o corpo da Response vêm antes do dashboard com fetch. A API recente exige suporte ou fallback fiel."))
    if stage == "23":
        flow.append(P("Leitura e issue de codebase alheia precedem o change request e o capstone."))
    flow.append(P("Ordem: " + " · ".join(i["id"] for i in items), "muted"))
    for index, item in enumerate(items):
        if index:
            flow.append(PageBreak())
        flow.extend(card(item))
    flow.append(PageBreak())

flow.append(heading(f"Rastreabilidade das {audit_count} observações", 1, "audit"))
flow.append(P("A tabela registra onde cada pedido foi incorporado editorialmente. Ela não confunde o contrato do PDF "
              "com um exercício já implementado no site. Novos IDs correspondentes aparecem quando aplicável."))
for entry in coverage:
    flow.append(P(f"{entry['id']:02d} [{entry['priority']}] {entry['title']}", "h3"))
    flow.append(P(entry["evidence"] + ("  ·  IDs novos: " + ", ".join(entry["new_activity_ids"])
                                         if entry["new_activity_ids"] else ""), "matrix"))

flow.append(PageBreak())
flow.append(heading("Fontes e compatibilidade", 1, "sources"))
flow.append(P("Pesquisa de fonte primária sustenta as distinções técnicas e pedagógicas. O suporte de API "
              "deve ser revisto no runtime alvo antes de publicar cada atividade. Data da consulta: 28/09/2026."))
sources = [
 ("MDN — Number.EPSILON e precisão", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON"),
 ("MDN — Promise.try e ordem síncrona do callback", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try"),
 ("MDN — Fetch e corpos consumíveis", "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"),
 ("MDN — script e carregamento de módulo", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script"),
 ("MDN — Streams e backpressure", "https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts"),
 ("MDN — SuppressedError", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SuppressedError"),
 ("TypeScript — Object Types, readonly e excess property checks", "https://www.typescriptlang.org/docs/handbook/2/objects.html"),
 ("TypeScript — Project References", "https://www.typescriptlang.org/docs/handbook/project-references.html"),
 ("TypeScript — isolatedDeclarations", "https://www.typescriptlang.org/tsconfig/isolatedDeclarations.html"),
 ("Vitest — Mocking e timers", "https://vitest.dev/guide/mocking.html"),
 ("ICER 2023 — variáveis e abstract tracing", "https://zilles.cs.illinois.edu/papers/hassan_understanding_programs_icer_2023.pdf"),
 ("ICER 2024 — debugger versus execução", "https://icer2024.acm.org/details/icer-2024-papers/36/Evaluating-How-Novices-Utilize-Debuggers-and-Code-Execution-to-Understand-Code"),
 ("Nature Reviews Psychology — spacing e retrieval", "https://www.nature.com/articles/s44159-022-00089-1"),
]
for title, url in sources:
    flow.append(Paragraph(f'<link href="{html.escape(url)}" color="#6EF0DA">{html.escape(title)}</link>', styles["body"]))

book = Book(PDF, activity_count, audit_count)
book.build(flow)
print(f"pdf={PDF}")
print(f"manifest={MANIFEST}")
print(f"records={len(records)} stages={len(by_stage)} audit={len(coverage)} sha256={revision}")
