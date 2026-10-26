// Renders the simple text format used for editable long text:
//   "## Heading", "- bullet", **bold**, blank line = new paragraph, emails become links.

import { Fragment, type ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|([\w.+-]+@[\w-]+\.[\w.]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={k++}>{m[1]}</strong>);
    else out.push(<a key={k++} href={`mailto:${m[2]}`} className="text-primary underline">{m[2]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function PlainRichText({ text, headingClassName }: { text: string; headingClassName?: string }) {
  const blocks = text.replace(/\r/g, '').split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (!lines.length) return null;
        const parts: ReactNode[] = [];
        let bullets: string[] = [];
        const flush = () => {
          if (bullets.length) {
            parts.push(
              <ul key={`u${parts.length}`} className="list-disc pl-6 space-y-2">
                {bullets.map((b, j) => <li key={j}>{inline(b)}</li>)}
              </ul>,
            );
            bullets = [];
          }
        };
        let para: string[] = [];
        const flushPara = () => {
          if (para.length) {
            parts.push(<p key={`p${parts.length}`}>{inline(para.join(' '))}</p>);
            para = [];
          }
        };
        for (const line of lines) {
          if (line.startsWith('## ')) {
            flush();
            flushPara();
            parts.push(<h2 key={`h${parts.length}`} className={headingClassName}>{line.slice(3)}</h2>);
          } else if (line.startsWith('- ')) {
            flushPara();
            bullets.push(line.slice(2));
          } else {
            flush();
            para.push(line);
          }
        }
        flush();
        flushPara();
        return <Fragment key={i}>{parts}</Fragment>;
      })}
    </>
  );
}
