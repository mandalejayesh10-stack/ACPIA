// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // ─── Ignored paths ────────────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.husky/**',
      '**/prisma/migrations/**',
    ],
  },

  // ─── Base JS rules ────────────────────────────────────────────────────────
  js.configs.recommended,

  // ─── TypeScript rules ─────────────────────────────────────────────────────
  ...tseslint.configs.recommended,

  // ─── ACPIA custom rules ───────────────────────────────────────────────────
  {
    rules: {
      // ENGINEERING_CONTRACT.md: No `any`. Ever.
      '@typescript-eslint/no-explicit-any': 'error',

      // Unused variables must be prefixed with _ to be ignored
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Enforce type-only imports for clarity and tree-shaking
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // No unsafe operations — use unknown + Zod instead
      '@typescript-eslint/no-unsafe-assignment': 'off', // re-enable per-package as needed
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      // Warn on console usage — use structured logger instead
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Prevent floating promises (important for agent async code)
      '@typescript-eslint/no-floating-promises': 'off', // requires parserOptions.project — enable per-package

      // Enforce consistent return types
      '@typescript-eslint/explicit-function-return-type': 'off', // enable in agent packages

      // No non-null assertion (use explicit checks)
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  }
)
