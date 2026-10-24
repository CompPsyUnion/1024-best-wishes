// ESLint flat config for TypeScript projects.
// Division of labor: ESLint owns code quality, Prettier owns formatting
// (see .prettierrc in the same directory) — do not add formatting rules here.
// eslint.config.ts is loaded natively by ESLint >= 9.14 (jiti) — no flags,
// and the config itself gets type-checked.
// Dev dependencies: pnpm add -D eslint @eslint/js typescript-eslint
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // dist/ is build output, not source.
  { ignores: ["dist"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
