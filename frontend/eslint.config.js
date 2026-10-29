import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";
import vitest from "@vitest/eslint-plugin";
import react from "eslint-plugin-react";

export default defineConfig([
  // --- 1. Global Ignores ---
  globalIgnores([
    "dist",
    ".stryker-tmp/",
    ".storybook/",
    "build",
    "coverage",
    "node_modules",
    "public/mockServiceWorker.js",
    "storybook-static/",
  ]),

  // --- 2. Base React/Frontend Configuration ---
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      storybook: storybook,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: {
      react: {
        version: "detect", // Automatically detects React version (React 19)
      },
    },
    rules: {
      // Recommended standards
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules, // Handles React 17+ JSX transform
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": "warn",

      // Custom unused variables logic from your original package.json
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "(^_)|(^React$)",
        },
      ],

      // React 19 specific overrides (turning off legacy requirements)
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
    },
  },

  // --- 3. Vitest Configuration ---
  {
    files: ["**/*.test.{js,jsx}", "**/*.spec.{js,jsx}"],
    plugins: {
      vitest,
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals, // Fixes 'describe', 'test', 'expect' not defined
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "no-undef": "off", // Vitest handles global variable checks
    },
  },

  // --- 4. Storybook Configuration ---
  {
    files: ["**/*.stories.{js,jsx}"],
    plugins: {
      storybook,
    },
    rules: {
      ...storybook.configs.recommended.rules,
    },
  },
]);
