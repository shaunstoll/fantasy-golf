import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import checkFile from "eslint-plugin-check-file";
import github from "eslint-plugin-github";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  github.getFlatConfigs().react,
  github.getFlatConfigs().internal,
  github.getFlatConfigs().recommended,
  ...github.getFlatConfigs().typescript,
  eslintPluginUnicorn.configs.all,
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended",
    "plugin:testing-library/react",
    "plugin:jest-dom/recommended",
    "plugin:better-tailwindcss/recommended-error",
  ),
  {
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/features/home",
              from: "./src/features",
              except: ["./home"],
            },
            {
              target: ["./src/features"],
              from: "./src/app",
            },
            {
              target: [
                "./src/components",
                "./src/hooks",
                "./src/libs",
                "./src/interfaces",
                "./src/utils",
                "./src/enums",
                "./src/consts",
                "./src/stores",
              ],
              from: ["./src/features", "./src/app"],
            },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "./*"],
              message: "Use absolute imports instead of relative imports.",
            },
          ],
        },
      ],
      "no-console": ["error", { allow: ["warn", "error", "info", "debug"] }],
      "import/no-cycle": "error",
      "i18n-text/no-en": "off",
      "linebreak-style": ["error", "unix"],
      "react-hooks/exhaustive-deps": "error",
      "better-tailwindcss/no-unregistered-classes": "off",
      "@typescript-eslint/no-shadow": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-keyword-prefix": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],
    },
  },
  {
    plugins: {
      "check-file": checkFile,
    },
    files: ["src/**/*"],
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "!(src/app)/**/*": "KEBAB_CASE",
          "!(**/__tests__)/**/*": "KEBAB_CASE",
        },
      ],
    },
  },
];

export default eslintConfig;
