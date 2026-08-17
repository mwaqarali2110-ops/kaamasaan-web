import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Ported-from-mobile layers. `any` here is almost entirely Supabase row
    // mappers — `(row: any) => MaintenancePlan` and friends — which exist
    // because the client is untyped while src/types/supabase.generated.ts is
    // stale (see src/services/client.ts). Hand-writing row types now would be
    // guesswork against a schema we know the artefact misrepresents; the fix is
    // to regenerate the types, after which these can be removed properly.
    // New web code (app/, components/, hooks/) keeps the strict rule.
    files: ["src/services/**/*.ts", "src/utils/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    rules: {
      // The ported mobile logic uses a leading underscore to mark intentional
      // discards (destructured-and-dropped values, unused catch bindings).
      // Honour that convention rather than editing engine code we must keep
      // byte-identical to kaamasaan-mobile.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
