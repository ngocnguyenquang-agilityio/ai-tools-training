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
  // Playwright specs live in e2e/ and must not run under Jest. Claude Code
  // worktrees in .claude/ hold full copies of the repo with their own tests.
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/.next/", "/.claude/"],
  // Keeps the worktrees' package.json out of the module map (duplicate name).
  modulePathIgnorePatterns: ["<rootDir>/.claude/"],
};

// Exported this way so next/jest can load the async Next.js config.
export default createJestConfig(config);
