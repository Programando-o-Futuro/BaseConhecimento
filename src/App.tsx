import { Fragment, type ReactNode } from "react";
import bookletSource from "./imports/apostila_programando_o_futuro.md?raw";

type CalloutKind = "learn" | "tip" | "practice" | "challenge" | "warning" | "mission";

type Page = {
  kind: "cover" | "legend" | "divider" | "content";
  title: string;
  eyebrow?: string;
  part: string;
  module?: string;
  lines?: string[];
  modules?: string[];
};

const callouts: Record<CalloutKind, { label: string; icon: IconName }> = {
  learn: { label: "Aprenda", icon: "book" },
  tip: { label: "Dica", icon: "bulb" },
  practice: { label: "Pratique", icon: "tools" },
  challenge: { label: "Desafio", icon: "rocket" },
  warning: { label: "Atenção", icon: "warning" },
  mission: { label: "Missão", icon: "star" },
};

type IconName =
  | "book"
  | "bulb"
  | "tools"
  | "rocket"
  | "warning"
  | "star"
  | "code"
  | "print";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" /></>,
    bulb: <><path d="M9 18h6M10 22h4" /><path d="M8.1 14.8A7 7 0 1 1 16 15c-.7.6-1 1.1-1 2H9c0-.9-.3-1.5-.9-2.2Z" /></>,
    tools: <><path d="m14.7 6.3 3-3a4 4 0 0 1-5 5L5 16l-2 5 5-2 7.7-7.7a4 4 0 0 1 5-5l-3 3Z" /><path d="m9 7-4-4-2 2 4 4" /></>,
    rocket: <><path d="M14 5c3.5-3.5 7-2 7-2s1.5 3.5-2 7l-6 6-5-5z" /><path d="m14 5 5 5M8 11l-4 1-2 3 6 1M13 16l-1 4-3 2-1-6" /><circle cx="16" cy="7" r="1.5" /></>,
    warning: <><path d="M12 3 2.5 20h19z" /><path d="M12 9v5M12 17.5v.5" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
    code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" /></>,
    print: <><path d="M7 9V3h10v6M7 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-3" /><path d="M7 14h10v7H7z" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}

function stripMarkdown(value: string) {
  return value
    .replace(/[📖💡🛠️🚀⚠️⭐🟢🔵🟠🔴✅❌🟨]/gu, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .trim();
}

function kindFromText(text: string): CalloutKind | null {
  const normalized = stripMarkdown(text).toUpperCase();
  if (text.includes("📖") || normalized.startsWith("APRENDA")) return "learn";
  if (text.includes("💡") || normalized.startsWith("DICA")) return "tip";
  if (text.includes("🛠") || /^(PRATIQUE|ATIVIDADE|EXERCÍCIO|TESTE|MINIATIVIDADE)/.test(normalized)) return "practice";
  if (text.includes("🚀") || normalized.startsWith("DESAFIO") || normalized.startsWith("REFLEXÃO") || normalized.startsWith("PERGUNTA PARA")) return "challenge";
  if (text.includes("⚠") || normalized.startsWith("ATENÇÃO")) return "warning";
  if (text.includes("⭐") || normalized.includes("MISSÃO")) return "mission";
  return null;
}

function buildPages(source: string): Page[] {
  const lines = source.split(/\r?\n/);
  const pages: Page[] = [
    { kind: "cover", title: "Programando o Futuro", part: "Capa" },
  ];

  const legendStart = lines.findIndex((line) => line.startsWith("## LEGENDA"));
  const firstPart = lines.findIndex((line) => line.startsWith("# PARTE "));
  pages.push({
    kind: "legend",
    title: "Como usar esta apostila",
    part: "Apresentação",
    lines: lines.slice(legendStart + 1, firstPart),
  });

  let part = "";
  let module = "";
  let i = firstPart;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("# ")) {
      part = stripMarkdown(line.slice(2));
      module = "";
      const nextPart = lines.findIndex((item, index) => index > i && item.startsWith("# "));
      const end = nextPart === -1 ? lines.length : nextPart;
      const modules = lines
        .slice(i + 1, end)
        .filter((item) => item.startsWith("## "))
        .map((item) => stripMarkdown(item.slice(3)));
      pages.push({ kind: "divider", title: part, part, modules });
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      module = stripMarkdown(line.slice(3));
      const start = i + 1;
      let end = start;
      while (end < lines.length && !/^#{1,3} /.test(lines[end])) end += 1;
      const body = lines.slice(start, end).filter((item) => item.trim() && item.trim() !== "---");
      if (body.length) {
        pages.push({ kind: "content", title: module, part, module, lines: lines.slice(start, end) });
      }
      i = end;
      continue;
    }
    if (line.startsWith("### ")) {
      const title = stripMarkdown(line.slice(4));
      const start = i + 1;
      let end = start;
      while (end < lines.length && !/^#{1,3} /.test(lines[end])) end += 1;
      pages.push({
        kind: "content",
        title,
        eyebrow: module || part,
        part,
        module,
        lines: lines.slice(start, end),
      });
      i = end;
      continue;
    }
    i += 1;
  }
  return pages;
}

function inlineMarkup(text: string) {
  const clean = text
    .replace(/[📖💡🛠️🚀⚠️⭐🟢🔵🟠🔴🟨]/gu, "")
    .replace(/✅/gu, "Sim")
    .replace(/❌/gu, "Não")
    .trim();
  const escaped = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\\_/g, "_");
  return { __html: html };
}

function RichText({ children }: { children: string }) {
  return <span dangerouslySetInnerHTML={inlineMarkup(children)} />;
}

function Callout({
  kind,
  title,
  children,
}: {
  kind: CalloutKind;
  title?: string;
  children?: ReactNode;
}) {
  const data = callouts[kind];
  return (
    <aside className={`callout callout-${kind}`}>
      <div className="callout-icon"><Icon name={data.icon} size={19} /></div>
      <div className="callout-copy">
        <div className="callout-label">{title || data.label}</div>
        {children && <div className="callout-body">{children}</div>}
      </div>
    </aside>
  );
}

function isTableRow(line: string) {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function cells(line: string) {
  return line.trim().slice(1, -1).split("|").map((cell) => cell.trim());
}

function ContentBlocks({ lines = [] }: { lines?: string[] }) {
  const output: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line || line === "---") {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      output.push(
        <div className="code-block" key={`code-${i}`}>
          <div className="code-top"><Icon name="code" size={15} /><span>EXEMPLO</span></div>
          <pre>{code.join("\n")}</pre>
        </div>,
      );
      i += 1;
      continue;
    }

    if (isTableRow(line) && i + 1 < lines.length && /^\|?[\s:-]+\|/.test(lines[i + 1])) {
      const tableRows: string[][] = [cells(line)];
      i += 2;
      while (i < lines.length && isTableRow(lines[i])) {
        tableRows.push(cells(lines[i]));
        i += 1;
      }
      output.push(
        <div className="table-wrap" key={`table-${i}`}>
          <table>
            <thead><tr>{tableRows[0].map((cell, index) => <th key={index}><RichText>{cell}</RichText></th>)}</tr></thead>
            <tbody>
              {tableRows.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>{row.map((cell, index) => <td key={index}><RichText>{cell || " "}</RichText></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      const text = quote.join(" ");
      const kind = kindFromText(text);
      if (kind) {
        const body = text.replace(/^.*?(DICA|ATENÇÃO)\s*:?\s*/i, "");
        output.push(<Callout kind={kind} key={`quote-${i}`}><p><RichText>{body}</RichText></p></Callout>);
      } else {
        output.push(<blockquote key={`quote-${i}`}><RichText>{text}</RichText></blockquote>);
      }
      continue;
    }

    const markerKind = kindFromText(line);
    const isMarker = markerKind && (/[📖💡🛠️🚀⚠️⭐]/u.test(line) || /^(APRENDA|DICA|PRATIQUE|DESAFIO|ATENÇÃO|MISSÃO)/i.test(stripMarkdown(line)));
    if (markerKind && isMarker) {
      const markerTitle = stripMarkdown(line).replace(/\s*—\s*Passo a passo/i, "");
      let body: ReactNode = null;
      if (i + 1 < lines.length && lines[i + 1].trim() && !isTableRow(lines[i + 1]) && !/^[-*]\s/.test(lines[i + 1].trim())) {
        i += 1;
        body = <p><RichText>{lines[i].trim()}</RichText></p>;
      }
      output.push(
        <Callout kind={markerKind} key={`callout-${i}`} title={markerTitle || undefined}>{body}</Callout>,
      );
      i += 1;
      continue;
    }

    if (/^☐\s*/.test(line)) {
      const checks: string[] = [];
      while (i < lines.length && /^☐\s*/.test(lines[i].trim())) {
        checks.push(lines[i].trim().replace(/^☐\s*/, ""));
        i += 1;
      }
      output.push(
        <ul className="checklist" key={`checks-${i}`}>
          {checks.map((item, index) => <li key={index}><span className="checkbox" /><RichText>{item}</RichText></li>)}
        </ul>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^(\s{0,3})[-*]\s+/.test(lines[i])) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      output.push(<ul className="bullet-list" key={`list-${i}`}>{items.map((item, index) => <li key={index}><RichText>{item}</RichText></li>)}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      output.push(<ol key={`ordered-${i}`}>{items.map((item, index) => <li key={index}><RichText>{item}</RichText></li>)}</ol>);
      continue;
    }

    const paragraphs = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      lines[i].trim() !== "---" &&
      !isTableRow(lines[i]) &&
      !/^(```|>|☐\s*|[-*]\s+|\d+\.\s+)/.test(lines[i].trim()) &&
      !kindFromText(lines[i].trim())
    ) {
      paragraphs.push(lines[i].trim());
      i += 1;
    }
    output.push(<p key={`p-${i}`}><RichText>{paragraphs.join(" ")}</RichText></p>);
  }
  return <>{output}</>;
}

function PageFrame({
  page,
  index,
  total,
}: {
  page: Page;
  index: number;
  total: number;
}) {
  if (page.kind === "cover") {
    return (
      <article className="sheet cover-page" id="page-1">
        <div className="cover-orbit orbit-one" />
        <div className="cover-orbit orbit-two" />
        <div className="cover-brand"><span className="brand-mark"><Icon name="code" size={20} /></span>Projeto de extensão</div>
        <div className="cover-content">
          <div className="cover-kicker">APOSTILA DE TECNOLOGIA E CRIAÇÃO</div>
          <h1>Programando<br /><span>o Futuro</span></h1>
          <p>Da primeira ideia ao seu projeto digital.</p>
          <div className="cover-rule" />
          <strong>Instituto Federal Baiano</strong>
          <small>Campus Guanambi</small>
        </div>
        <div className="cover-footer"><span>SCRATCH</span><span>WORDPRESS</span><span>GOOGLE SITES</span></div>
      </article>
    );
  }

  if (page.kind === "divider") {
    return (
      <article className="sheet divider-page" id={`page-${index + 1}`}>
        <div className="divider-number">{String(index).padStart(2, "0")}</div>
        <div className="divider-lines" />
        <div className="divider-content">
          <div className="divider-label">UNIDADE DE APRENDIZAGEM</div>
          <h1>{page.title.replace(/^PARTE [IVX]+\s*—\s*/, "")}</h1>
          <div className="orange-line" />
          <p>Conceitos, prática e desafios para transformar ideias em projetos reais.</p>
          {!!page.modules?.length && (
            <div className="module-list">
              {page.modules.map((item, moduleIndex) => (
                <div key={item}><span>{String(moduleIndex + 1).padStart(2, "0")}</span>{item.replace(/^MÓDULO \d+\s*—\s*/, "")}</div>
              ))}
            </div>
          )}
        </div>
        <footer><span>PROGRAMANDO O FUTURO</span><b>{index + 1}</b></footer>
      </article>
    );
  }

  if (page.kind === "legend") {
    return (
      <article className="sheet" id={`page-${index + 1}`}>
        <PageHeader label="APRESENTAÇÃO" />
        <main className="page-content legend-content">
          <div className="section-number">00</div>
          <h1>{page.title}</h1>
          <p className="lead">Ao longo desta apostila, cores e símbolos ajudam você a identificar rapidamente cada tipo de conteúdo.</p>
          <div className="legend-grid">
            {(Object.keys(callouts) as CalloutKind[]).map((kind) => (
              <Callout kind={kind} key={kind}>
                <p>{{
                  learn: "Conteúdo novo. Leia com atenção.",
                  tip: "Uma recomendação importante.",
                  practice: "Atividade guiada. Siga o passo a passo.",
                  challenge: "Você precisa descobrir como fazer.",
                  warning: "Erro comum. Cuidado!",
                  mission: "Atividade maior. Produto final.",
                }[kind]}</p>
              </Callout>
            ))}
          </div>
          <div className="start-note"><span>COMO COMEÇAR</span><p>Leia, experimente, erre, ajuste e tente novamente. Programar é aprender fazendo.</p></div>
        </main>
        <PageFooter index={index} total={total} />
      </article>
    );
  }

  const topicKind = kindFromText(page.title);
  return (
    <article className="sheet" id={`page-${index + 1}`}>
      <PageHeader label={page.part.replace(/^PARTE [IVX]+\s*—\s*/, "") || "PROGRAMANDO O FUTURO"} />
      <main className="page-content">
        <div className="topic-heading">
          <div className={`topic-index ${topicKind ? `topic-${topicKind}` : ""}`}>{String(index).padStart(2, "0")}</div>
          <div>
            <div className="eyebrow">{page.eyebrow?.replace(/^MÓDULO \d+\s*—\s*/, "")}</div>
            <h1>{page.title}</h1>
          </div>
        </div>
        <div className="content-flow"><ContentBlocks lines={page.lines} /></div>
      </main>
      <PageFooter index={index} total={total} />
    </article>
  );
}

function PageHeader({ label }: { label: string }) {
  return (
    <header className="page-header">
      <div className="mini-brand"><span>PF</span> PROGRAMANDO O FUTURO</div>
      <div className="part-name">{label}</div>
    </header>
  );
}

function PageFooter({ index, total }: { index: number; total: number }) {
  return (
    <footer className="page-footer">
      <span>INSTITUTO FEDERAL BAIANO · CAMPUS GUANAMBI</span>
      <b>{String(index + 1).padStart(2, "0")} <i>/ {String(total).padStart(2, "0")}</i></b>
    </footer>
  );
}

export default function App() {
  const pages = buildPages(bookletSource);
  return (
    <div className="app-shell">
      <nav className="viewer-bar">
        <div className="viewer-title"><span className="brand-mark"><Icon name="code" size={18} /></span><div><b>Programando o Futuro</b><small>Apostila educacional · A4</small></div></div>
        <div className="viewer-actions"><span>{pages.length} páginas</span><button onClick={() => window.print()}><Icon name="print" size={17} />Imprimir / PDF</button></div>
      </nav>
      <div className="workspace">
        <aside className="toc">
          <div className="toc-label">CONTEÚDO</div>
          {pages.filter((page) => page.kind === "divider").map((page) => (
            <a href={`#page-${pages.indexOf(page) + 1}`} key={page.title}>{page.title}</a>
          ))}
        </aside>
        <section className="page-stack">
          {pages.map((page, index) => <Fragment key={`${page.title}-${index}`}><PageFrame page={page} index={index} total={pages.length} /></Fragment>)}
        </section>
      </div>
    </div>
  );
}
