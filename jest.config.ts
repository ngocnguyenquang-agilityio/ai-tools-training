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

// linkedom's CommonJS build requires these ESM-only packages (its CSS selector
// and HTML parser stack), which Jest can't load without transforming them.
const ESM_ONLY_PACKAGES = [
  "boolbase",
  "css-select",
  "css-what",
  "cssomnom",
  "dom-serializer",
  "domelementtype",
  "domhandler",
  "domutils",
  "entities",
  "htmlparser2",
  "nth-check",
];

const loadNextJestConfig = createJestConfig(config);

// next/jest builds `transformIgnorePatterns` itself and lets a custom config
// only append to it, which can't un-ignore a package. So add the packages to
// its allow-list, which starts with "geist".
const jestConfig = async () => {
  const resolved = await loadNextJestConfig();
  const transformIgnorePatterns = (resolved.transformIgnorePatterns ?? []).map(
    (pattern) =>
      pattern.replaceAll("(geist|", `(geist|${ESM_ONLY_PACKAGES.join("|")}|`),
  );
  // Fail here, in plain words, if a next/jest upgrade changes its allow-list;
  // otherwise the first sign is an ESM parse error from linkedom's dependencies.
  if (
    transformIgnorePatterns.every(
      (pattern) => !pattern.includes(ESM_ONLY_PACKAGES[0]),
    )
  ) {
    throw new Error(
      'jest.config.ts: next/jest no longer has a "(geist|" allow-list in transformIgnorePatterns, so linkedom\'s ESM-only dependencies would not be transformed.',
    );
  }
  return { ...resolved, transformIgnorePatterns };
};

export default jestConfig;
