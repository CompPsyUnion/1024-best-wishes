# 1024-best-wishes

CPU (Computer Psycho Union) 1024 Programmer's Day mini-game — a single-page
React app: two "membership verification" questions, spell out what CPU stands
for and crack the programmer number, then a full-screen celebration.

## Play

- **Q1**: CAPTCHA-style boxes — spell out what CPU stands for (3 words,
  19 letters, case-insensitive). Stuck? "Peek at the answer" — but peeks go
  on your record
- **Q2**: `2⁷ = ?` — the number hardcoded in programmer DNA (those who answer
  128 get gently rejected)
- **Finale**: gold confetti + fireworks + terminal wishes, with your time,
  peek count and personal best (kept in `localStorage`) — who is the true
  Psycho?

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

## Build

```bash
pnpm build      # type-check with tsc, then bundle to dist/
pnpm preview    # serve the production bundle locally
```

## Deploy

`dist/` is fully static with relative asset paths (`base: "./"`), so it can be
hosted from any static directory. For GitHub Pages: repo Settings → Pages,
deploy via a workflow or the `gh-pages` branch.

## Design

The design system (colors, typography, motion) lives in [DESIGN.md](DESIGN.md).

## License

MIT — see [LICENSE](LICENSE).
