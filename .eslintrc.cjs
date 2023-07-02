module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["airbnb-typescript/base", "plugin:import/recommended", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "tsconfig.json",
  },
  // rules: {
  //   "@typescript-eslint/strict-boolean-expressions": "off",
  //   "@typescript-eslint/semi": ["error", "always"],
  //   "@typescript-eslint/restrict-template-expressions": ["error", {
  //     allowAny: false,
  //     allowBoolean: true,
  //     allowNullish: true,
  //     allowNumber: true,
  //     allowRegExp: false,
  //     allowNever: false
  //   }]
  // }
};
