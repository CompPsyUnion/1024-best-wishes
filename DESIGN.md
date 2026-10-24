# Design System: CPU 1024 Programmer's Day Mini-Game

## 1. Visual Theme & Atmosphere

A late-night machine-room terminal glowing gold in the dark. The whole game lives
inside one terminal window (traffic lights, `psycho@cpu:~/1024-party`, a live
`t=…s` stopwatch) floating over a faint gold code-rain. Density 5, variance 6,
motion 8 — playful and choreographed, but every pixel stays deliberate. Gold is
the only voice; everything else is quiet charcoal.

## 2. Color Palette & Roles

- **Machine-Room Black** (#0b0c11) — page canvas, never pure #000000
- **Panel Surface** (#12141c / rgba 0.86 + blur) — terminal window body
- **Raise Surface** (#171a24) — chips, title bar
- **Warm Ink** (#ecebe4) — primary text
- **Muted Steel** (#8f92a0) — secondary text, hints
- **Faint Steel** (#565a68) — metadata, prompt glyphs
- **Whisper Border** (rgba(236,235,228,0.08)) — 1px structural lines
- **Signal Gold** (#f7d447) — the single accent: title, boxes, caret, CTAs,
  confetti, focus rings; derived tones #ffe28a / #fff3bf / #d4a017 / rgba fills
- **Error Red** (#ff6b6b) — wrong-answer borders and warn toasts only

## 3. Typography Rules

- **Display:** Outfit → Geist → Satoshi → system (never Inter) — "CPU" hero and
  the "1024" finale, weight 800, tight tracking
- **Body:** system-ui + PingFang SC / HarmonyOS Sans SC / MiSans fallbacks —
  relaxed leading, short lines only
- **Mono:** JetBrains Mono → Geist Mono → SF Mono → Menlo — every letter box,
  the terminal, kickers, chips, timer; numbers are always monospace
- No webfonts are fetched: the audience is on Chinese mobile networks, so all
  stacks are local-first with graceful fallbacks

## 4. Component Stylings

- **Letter boxes:** CAPTCHA-style single-char inputs; 1.5px gold border at 28%
  alpha, filled state tints gold 6%; focus lifts -3px with a soft gold ring
  (no neon). Solved = staggered gold wave (45ms/box); wrong = shake + red
  border, then clear
- **Buttons:** primary = solid gold, tactile press (translateY 1px, scale .97),
  inset top highlight, soft gold shadow; ghost = 1px gold outline at 40%
- **Chips:** pill, mono, gold values; record chip inverts to gold-tinted
- **Terminal card:** near-black #0d0e14 inset panel, $ prompts gold, [OK]
  prefixes gold, block caret blinks forever
- **Toast:** bottom-center mono pill, gold border (red when warning)

## 5. Layout Principles

One column, one terminal window (max-width 620px) vertically centered in
100dvh. Question content sits in a gold-tinted card inside the window. Words
never break mid-word: the 19 boxes wrap as three word groups. All touch targets
≥ 44px; the longest row (COMPUTER) fits 320px viewports without horizontal
scroll.

## 6. Motion & Interaction

- Springs (`cubic-bezier(0.34,1.56,0.64,1)`) own every pop, press and entrance;
  ease-out owns fades
- Perpetual loops: glitch bursts on the CPU title (RGB-split slices, quiet most
  of the 4s cycle), blinking carets, pulsing `= ?`, code-rain, ticking timer
- Staggered orchestration: solve-wave cascades box by box; finale content
  cascades 1024 → title → sub → chips → typed terminal
- Celebration: canvas confetti cannons (both lower corners + center) and 7
  timed firework bursts, gold-dominant with rare RGB sparks
- Only `transform`/`opacity` animate; canvases cap DPR at 2; everything honors
  `prefers-reduced-motion` (rain becomes static scatter, typing instant,
  confetti skipped)

## 7. Anti-Patterns (Banned)

No pure black, no purple/blue neon, no second accent, no Inter, no emoji in UI
chrome (kaomoji in copy only), no fake metrics (the timer is real play data),
no overlapping layers, no filler text, no horizontal scroll on
mobile.
