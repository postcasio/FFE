module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    /*
     * Uses eslint-config-prettier to disable ESLint rules from
     * @typescript-eslint/eslint-plugin that would conflict with prettier
     */
    "prettier/@typescript-eslint",
    /*
     * Enables eslint-plugin-prettier and eslint-config-prettier.
     * This will display prettier errors as ESLint errors. Make sure this is
     * always the last configuration in the extends array.
     */
    "plugin:prettier/recommended",
  ],
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-var-requires": "off",
    "max-len": ["error", { code: 120 }],
  },
};
