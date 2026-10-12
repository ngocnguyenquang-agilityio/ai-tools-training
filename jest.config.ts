import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Path to the Next.js app, so next.config and .env files load in tests.
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Mirrors the `@/*` path alias in tsconfig.json.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Playwright specs live in e2e/ and must not run under Jest.
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/.next/"],
};

// Exported this way so next/jest can load the async Next.js config.
export default createJestConfig(config);
