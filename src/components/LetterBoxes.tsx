import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type CSSProperties,
} from "react";

export interface LetterBoxesProps {
  /** Answer with spaces between words — spaces become word gaps. */
  answer: string;
  mode?: "alpha" | "digit";
  onFirstInput?: () => void;
  onWrong?: (attempt: string) => void;
  onSolved?: () => void;
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
  onFirstInput,
  onWrong,
  onSolved,
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
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  // One real input holds the whole answer; the boxes are pure display.
  // A single element keeps focus for the whole run — no per-box focus()
  // jumps (which make the iOS keyboard dismiss and reopen) — and IME
  // composition can finish before anything is committed (Chinese IMEs
  // used to leak pinyin letters into the boxes).
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const composing = useRef(false);

  useEffect(() => {
    const ids = timers.current;
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Desktop: focus once on mount. Mobile: wait for a tap, so the keyboard
  // doesn't jump up on page load.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      focusInput();
    }
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const focusInput = (caret?: number) => {
    const el = inputRef.current;
    if (!el || status !== "typing") {
      return;
    }
    el.focus();
    const pos = caret ?? el.value.length;
    el.setSelectionRange(pos, pos);
    setActive(Math.min(pos, letters.length - 1));
  };

  const syncActive = () => {
    const el = inputRef.current;
    if (el) {
      setActive(
        Math.min(el.selectionStart ?? el.value.length, letters.length - 1),
      );
    }
  };

  const commit = (raw: string) => {
    if (status !== "typing") {
      return;
    }
    const clean = sanitize(raw, mode).slice(0, letters.length);
    const next = letters.map((_, k) => clean[k] ?? "");
    if (!started.current && clean) {
      started.current = true;
      onFirstInput?.();
    }
    setValues(next);
    setActive(Math.min(clean.length, letters.length - 1));
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
            setActive(0);
            const el = inputRef.current;
            if (el && document.activeElement === el) {
              el.setSelectionRange(0, 0);
            }
          }, 750);
        }
      }, 380);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const native = e.nativeEvent as InputEvent;
    if (composing.current || native.isComposing) {
      return;
    }
    commit(e.target.value);
  };

  const handleCompositionEnd = (e: CompositionEvent<HTMLInputElement>) => {
    composing.current = false;
    commit(e.currentTarget.value);
  };

  const handleKeyDown = () => {
    // The caret may have moved (arrows / backspace) — sync the highlight.
    window.requestAnimationFrame(syncActive);
  };

  const handleFocus = () => {
    setFocused(true);
    const el = inputRef.current;
    if (el) {
      // Continue where typing left off — the end.
      const end = el.value.length;
      el.setSelectionRange(end, end);
      setActive(Math.min(end, letters.length - 1));
    }
  };

  const stateClass =
    status === "solved" ? " solved" : status === "wrong" ? " wrong" : "";

  return (
    <div className={`boxes${stateClass}`}>
      <input
        ref={inputRef}
        className="ghost-input"
        value={values.join("")}
        inputMode={mode === "digit" ? "numeric" : "text"}
        autoCapitalize={mode === "alpha" ? "characters" : "off"}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="answer input"
        readOnly={status !== "typing"}
        onChange={handleChange}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={handleCompositionEnd}
        onFocus={handleFocus}
        onBlur={() => setFocused(false)}
        onSelect={syncActive}
        onKeyDown={handleKeyDown}
      />
      <div
        className="words"
        onPointerDown={(e) => {
          e.preventDefault();
          focusInput();
        }}
      >
        {words.map((word, wi) => (
          <div className="word" key={wi}>
            {word.split("").map((_, ci) => {
              const idx = offsets[wi] + ci;
              const value = values[idx];
              const cls = `box${value ? " filled" : ""}${
                focused && idx === active ? " active" : ""
              }`;
              return (
                <div
                  key={idx}
                  className={cls}
                  style={{ "--i": idx } as CSSProperties}
                  aria-hidden="true"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    focusInput(idx);
                  }}
                >
                  {value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
