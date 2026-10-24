import { useCallback, useEffect, useRef, useState } from "react";
import Background from "./components/Background";
import Confetti from "./components/Confetti";
import CpuTitle from "./components/CpuTitle";
import LetterBoxes from "./components/LetterBoxes";
import Terminal from "./components/Terminal";

type Stage = "name" | "power" | "party";

interface Toast {
  id: number;
  text: string;
  warn?: boolean;
}

const BEST_KEY = "cpu1024:best";

function loadBest(): number | null {
  try {
    const v = window.localStorage.getItem(BEST_KEY);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

function saveBest(t: number): void {
  try {
    window.localStorage.setItem(BEST_KEY, String(t));
  } catch {
    // private mode etc. — best time is a nicety, not a feature
  }
}

export default function App() {
  const [stage, setStage] = useState<Stage>("name");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [best, setBest] = useState<number | null>(() => loadBest());
  const [newRecord, setNewRecord] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((text: string, warn = false) => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    setToast({ id: Date.now(), text, warn });
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // Live timer while the game is running.
  useEffect(() => {
    if (startTime === null || endTime !== null) {
      return;
    }
    const t = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(t);
  }, [startTime, endTime]);

  const elapsed =
    startTime === null ? 0 : ((endTime ?? now) - startTime) / 1000;

  // Record the personal best once the run finishes.
  useEffect(() => {
    if (endTime === null || startTime === null) {
      return;
    }
    const t = (endTime - startTime) / 1000;
    if (best === null || t < best) {
      saveBest(t);
      setBest(t);
      setNewRecord(true);
    }
  }, [endTime, startTime, best]);

  const handleFirstInput = useCallback(() => {
    setStartTime((s) => s ?? Date.now());
  }, []);

  const handleWrongName = useCallback(
    (attempt: string) => {
      if (attempt.startsWith("COMPUTER")) {
        showToast("First word's right! Now the other two… (・∀・)");
      } else {
        showToast("Nope, try again (´・ω・`)");
      }
    },
    [showToast],
  );

  const handleWrongPower = useCallback(() => {
    showToast("Not that one — check your programmer DNA", true);
  }, [showToast]);

  const handleSolvedName = useCallback(() => {
    showToast("[OK] identity confirmed — welcome home");
    setStage("power");
  }, [showToast]);

  const handleSolvedPower = useCallback(() => {
    setEndTime(Date.now());
    setStage("party");
  }, []);

  const restart = useCallback(() => {
    setStage("name");
    setStartTime(null);
    setEndTime(null);
    setNow(0);
    setNewRecord(false);
  }, []);

  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied — go share it in the group");
    } catch {
      showToast("Copy failed — grab the link from the address bar", true);
    }
  }, [showToast]);

  return (
    <div className="app">
      <Background />
      <div className="bg-vignette" aria-hidden="true" />
      {stage === "party" && <Confetti />}
      <div className="scanlines" aria-hidden="true" />

      <main className="term">
        <div className="term-bar">
          <div className="dots" aria-hidden="true">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
          </div>
          <div className="term-title">subscriber@cpu:~/1024-party</div>
          <div className="term-timer">
            {startTime === null ? "--.-s" : `t=${elapsed.toFixed(1)}s`}
          </div>
        </div>

        <div className="term-body">
          {stage === "name" && (
            <section className="stage" key="name">
              <p className="kicker">subscribership verification</p>
              <CpuTitle text="CPU" />
              <p className="cpu-sub">1024 PROGRAMMER&apos;S DAY</p>
              <div className="q-card">
                <p className="q-tag">Q1 / 2</p>
                <h2 className="q-title">Spell out what CPU stands for</h2>
                <p className="q-hint">
                  3 words · 19 letters · case doesn&apos;t matter
                </p>
                <LetterBoxes
                  answer="COMPUTER PSYCHO UNION"
                  mode="alpha"
                  onFirstInput={handleFirstInput}
                  onWrong={handleWrongName}
                  onSolved={handleSolvedName}
                />
              </div>
            </section>
          )}

          {stage === "power" && (
            <section className="stage" key="power">
              <p className="kicker">final question · an easy one</p>
              <div className="equation" aria-label="two to the tenth power">
                <span className="base">2</span>
                <sup>10</sup> <span className="qmark">= ?</span>
              </div>
              <p className="q-hint">
                the number hardcoded in every programmer&apos;s DNA
              </p>
              <LetterBoxes
                answer="1024"
                mode="digit"
                onFirstInput={handleFirstInput}
                onWrong={handleWrongPower}
                onSolved={handleSolvedPower}
              />
            </section>
          )}

          {stage === "party" && (
            <section className="stage" key="party">
              <p className="kicker">verification passed · happy 1024</p>
              <div className="party-1024" aria-label="1024">
                1024
              </div>
              <h2 className="party-title">HAPPY PROGRAMMER&apos;S DAY</h2>
              <p className="party-sub">COMPUTER PSYCHO UNION</p>
              <div className="stats">
                <span className="chip">
                  TIME <b>{elapsed.toFixed(1)}s</b>
                </span>
                {best !== null && (
                  <span className={`chip${newRecord ? " chip-gold" : ""}`}>
                    {newRecord ? "NEW BEST" : "PERSONAL BEST"}{" "}
                    <b>{best.toFixed(1)}s</b>
                  </span>
                )}
              </div>
              <Terminal />
              <div className="actions">
                <button className="btn btn-primary" onClick={restart}>
                  Play again
                </button>
                <button className="btn btn-ghost" onClick={share}>
                  Copy link to share
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="footer">
        <b>CPU</b> | 1024 Programmer&apos;s Day
      </footer>

      {toast && (
        <div
          key={toast.id}
          className={`toast${toast.warn ? " warn" : ""}`}
          role="status"
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
