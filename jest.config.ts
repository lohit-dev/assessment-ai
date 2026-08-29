import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/api/**/*.test.ts"],
  globalSetup: "<rootDir>/tests/support/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/support/globalTeardown.ts",
  setupFiles: ["<rootDir>/tests/support/env.ts"],
  testTimeout: 120_000,
  verbose: true,
};

export default createJestConfig(config);
