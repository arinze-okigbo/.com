import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // Retained legacy navigation synchronizes its disclosure state with a media query.
  { files: ["src/components/layout/Nav.tsx"], rules: { "react-hooks/set-state-in-effect": "off" } },
  globalIgnores([
    ".next/**", "playwright-report/**", "test-results/**", "coverage/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "hive/research/**",
    "hive/qa/**",
  ]),
]);
