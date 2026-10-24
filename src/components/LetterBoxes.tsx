import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

export interface LetterBoxesProps {
  /** Answer with spaces between words — spaces become word gaps. */
  answer: string;
  mode?: "alpha" | "digit";
  peekable?: boolean;
  onFirstInput?: () => void;
  onWrong?: (attempt: string) => void;
  onSolved?: () => void;
  onPeek?: () => void;
}

function sanitize(raw: string, mode: "alpha" | "digit"): string {
  if (mode === "digit") {
    return raw.replace(/[^0-9]/g, "");
  }
  return raw.replace(/[^a-zA-Z]/g, "").toUpperCase();
}

export default function LetterBoxes({
  answer,
  mode = "alpha",
  peekable = false,
  onFirstInput,
  onWrong,
  onSolved,
  onPeek,
}: LetterBoxesProps) {
  const words = answer.split(" ").filter(Boolean);
  const letters = answer.replace(/\s/g, "").split("");
  const target = letters.join("");

  const offsets: number[] = [];
  let acc = 0;
  for (const word of words) {
    offsets.push(acc);
    acc += word.length;
  }

  const [values, setValues] = useState<string[]>(() => letters.map(() => ""));
  const [status, setStatus] = useState<"typing" | "solved" | "wrong">("typing");
  const [peeking, setPeeking] = useState(false);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const timers = useRef<number[]>([]);
  const started = useRef(false);

  useEffect(() => {
    const ids = timers.current;
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Desktop: land the cursor in the first box so typing can start at once.
  // Mobile: skip, so the on-screen keyboard doesn't jump up on page load.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      inputs.current[0]?.focus();
    }
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const focusAt = (i: number) => {
    const el = inputs.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const apply = (next: string[], focusIdx: number | null) => {
    if (!started.current) {
      started.current = true;
      onFirstInput?.();
    }
    setValues(next);
    if (focusIdx !== null) {
      focusAt(focusIdx);
    }
    if (next.every((v) => v !== "")) {
      const attempt = next.join("");
      later(() => {
        if (attempt === target) {
          setStatus("solved");
          later(() => onSolved?.(), 1000);
        } else {
          setStatus("wrong");
          onWrong?.(attempt);
          later(() => {
            setValues(letters.map(() => ""));
            setStatus("typing");
            focusAt(0);
          }, 750);
        }
      }, 380);
    }
  };

  const handleChange = (i: number, raw: string) => {
    if (status !== "typing") {
      return;
    }
    const clean = sanitize(raw, mode);
    if (clean === "") {
      const next = values.slice();
      next[i] = "";
      apply(next, null);
      return;
    }
    const next = values.slice();
    next[i] = clean.slice(-1);
    apply(next, i + 1 < letters.length ? i + 1 : i);
  };

  const handleKeyDown = (
    i: number,
    e: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (status !== "typing") {
        return;
      }
      const next = values.slice();
      if (next[i]) {
        next[i] = "";
        apply(next, i);
      } else if (i > 0) {
        next[i - 1] = "";
        apply(next, i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < letters.length - 1) {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (
    i: number,
    e: ClipboardEvent<HTMLInputElement>,
  ): void => {
    if (status !== "typing") {
      return;
    }
    e.preventDefault();
    const clean = sanitize(e.clipboardData.getData("text"), mode);
    if (!clean) {
      return;
    }
    const next = values.slice();
    for (let k = 0; k < clean.length && i + k < letters.length; k++) {
      next[i + k] = clean[k];
    }
    apply(next, Math.min(i + clean.length, letters.length) - 1);
  };

  const peek = () => {
    setPeeking(true);
    onPeek?.();
    later(() => setPeeking(false), 2200);
  };

  const stateClass =
    status === "solved" ? " solved" : status === "wrong" ? " wrong" : "";

  return (
    <div className={`boxes${stateClass}`}>
      <div className="words" aria-label="answer input">
        {words.map((word, wi) => (
          <div className="word" key={wi}>
            {word.split("").map((ch, ci) => {
              const idx = offsets[wi] + ci;
              const value = values[idx];
              return (
                <input
                  key={idx}
                  ref={(el) => {
                    inputs.current[idx] = el;
                  }}
                  className={value ? "box filled" : "box"}
                  style={{ "--i": idx } as CSSProperties}
                  value={value}
                  placeholder={peeking && !value ? ch : ""}
                  inputMode={mode === "digit" ? "numeric" : "text"}
                  autoCapitalize={mode === "alpha" ? "characters" : "off"}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={2}
                  aria-label={`character ${idx + 1}`}
                  readOnly={status !== "typing"}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={(e) => handlePaste(idx, e)}
                  onFocus={(e) => e.target.select()}
                />
              );
            })}
          </div>
        ))}
      </div>
      {peekable && status === "typing" && (
        <div className="q-tools">
          <button type="button" className="peek-btn" onClick={peek}>
            {peeking ? "shh — don't get caught" : "peek at the answer"}
          </button>
        </div>
      )}
    </div>
  );
}
