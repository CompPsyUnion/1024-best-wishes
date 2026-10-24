import { useEffect, useState } from "react";

type Line = { kind: "cmd" | "out" | "ok"; text: string };

const SCRIPT: Line[] = [
  { kind: "cmd", text: "whoami" },
  { kind: "out", text: "a proud Psycho · Computer Psycho Union" },
  { kind: "cmd", text: "./wish --to=all --day=1024" },
  { kind: "ok", text: "may your code compile on the first try" },
  { kind: "ok", text: "may your hair hold and your offers stack" },
  { kind: "cmd", text: "sudo rm -rf /worries" },
  { kind: "ok", text: "worries deleted; happiness cannot be killed" },
];

export default function Terminal() {
  const [done, setDone] = useState(0);
  const [chars, setChars] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(SCRIPT.length);
      setFinished(true);
    }
  }, []);

  useEffect(() => {
    if (finished) {
      return;
    }
    const line = SCRIPT[done];
    if (!line) {
      setFinished(true);
      return;
    }
    let t: number;
    if (chars < line.text.length) {
      t = window.setTimeout(
        () => setChars((c) => c + 1),
        line.kind === "cmd" ? 55 : 22,
      );
    } else {
      t = window.setTimeout(
        () => {
          setDone((d) => d + 1);
          setChars(0);
        },
        line.kind === "cmd" ? 350 : 200,
      );
    }
    return () => window.clearTimeout(t);
  }, [done, chars, finished]);

  const visibleCount = finished ? SCRIPT.length : done + 1;

  return (
    <div className="terminal" aria-label="holiday wishes terminal">
      {SCRIPT.slice(0, visibleCount).map((line, i) => {
        const text = i < done ? line.text : line.text.slice(0, chars);
        const isTypingCmd = i === done && !finished && line.kind === "cmd";
        return (
          <div key={i} className={`t-line t-${line.kind}`}>
            {text}
            {isTypingCmd && <span className="t-caret" />}
          </div>
        );
      })}
      {finished && (
        <div className="t-line t-cmd">
          <span className="t-caret" />
        </div>
      )}
    </div>
  );
}
