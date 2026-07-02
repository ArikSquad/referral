import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import reactPlugin from 'eslint-plugin-react'

const disabledReactRules = Object.fromEntries(
    Object.keys(reactPlugin.rules).map((ruleName) => [
        `react/${ruleName}`,
        'off'
    ])
)

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            ...disabledReactRules,
            'react-hooks/set-state-in-effect': 'off'
        }
    },
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'convex/**',
        'packages/*/dist/**',
        'eslint.config.mjs',
        '*.config.*',
        'next-env.d.ts'
    ])
])

export default eslintConfig
