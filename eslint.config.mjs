import { defineConfig } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
    ...nextVitals,
    {
        ignores: [
            '.next/**',
            'out/**',
            'build/**',
            'dist/**',
            'packages/**/dist/**',
            '**/build/**',
            '**/.turbo/**',
            'next-env.d.ts',
            '*.config.js',
            '*.config.mjs',
            'postcss.config.js',
            'tailwind.config.js',
            'next.config.js',
        ],
    },
    {
        rules: {
            // Override specific rules for our project
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "no-console": "off",
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        rules: {
            // TypeScript-specific overrides
            "no-unused-vars": "off", // Turn off base rule
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        },
    },
])

export default eslintConfig