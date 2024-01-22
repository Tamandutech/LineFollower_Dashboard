const { defaults: tsjPreset } = require("ts-jest/presets");
const { compilerOptions } = require("./tsconfig.json");
const { pathsToModuleNameMapper } = require("ts-jest");

module.exports = {
  preset: "jest-expo",
  ...tsjPreset,
  roots: ["<rootDir>"],
  globals: {
    "ts-jest": {
      babelConfig: true,
    },
  },
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>",
  }),
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(react-clone-referenced-element|@react-native-community|react-navigation|@react-navigation/.*|@unimodules/.*|native-base|react-native-code-push)",
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "\\.snap$"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.setup.js",
  ],
};
