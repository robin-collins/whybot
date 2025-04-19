import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
// import pluginJsxA11y from 'eslint-plugin-jsx-a11y'; // Optional: For accessibility rules

export default tseslint.config(
    // Global ignores
    {
        ignores: ["dist/", "node_modules/", ".vercel/"], // Add common ignores
    },

    // Base JS configuration
    js.configs.recommended,

    // Base TS configuration
    ...tseslint.configs.recommendedTypeChecked, // Use type-checked rules for stricter checks

    // React specific configurations
    {
        files: ["src/**/*.{ts,tsx,jsx}"], // Apply React rules only to src files
        plugins: {
            react: pluginReact,
            'react-hooks': pluginReactHooks,
            // 'jsx-a11y': pluginJsxA11y, // Optional
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: { jsx: true },
                // Project setting for type-checked rules
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser, // Apply browser globals here
            },
        },
        settings: {
            react: {
                version: "detect", // Automatically detect React version
            },
        },
        rules: {
            ...pluginReact.configs.recommended.rules,
            ...pluginReact.configs['jsx-runtime'].rules, // Add rules for new JSX transform
            ...pluginReactHooks.configs.recommended.rules,
            // Prevent unreachable code
            'no-unreachable': 'error',
            // ...pluginJsxA11y.configs.recommended.rules, // Optional
            "react/prop-types": "off", // Not needed with TypeScript
            // Consider adding specific TS-aware rules overrides here if needed
            // e.g., '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },

    // Configuration for config files (like this one, vite.config.ts, tailwind.config.js)
    {
        files: ["*.config.{js,ts}", "eslint.config.js"],
        languageOptions: {
            globals: {
                ...globals.node, // Use Node globals for config files
            },
        },
        rules: {
            // Relax rules for config files if necessary
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off'
        }
    },

    // Disable type-aware linting on JS files if needed (can be slow)
    {
        files: ['**/*.js'],
        extends: [tseslint.configs.disableTypeChecked],
    },


    // Prettier config to disable conflicting ESLint rules
    // Make sure this is LAST in the array
    eslintConfigPrettier,
);