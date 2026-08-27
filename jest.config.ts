import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          moduleResolution: "node",
          esModuleInterop: true,
        },
      },
    ],
  },

  transformIgnorePatterns: ["/node_modules/(?!(pdfjs-dist)/)"],

  // Load .env.local before each test file so GEMINI_API_KEY is available
  setupFiles: ["<rootDir>/tests/setup.ts"],

  testTimeout: 120_000,
  verbose: true,
};

export default config;
