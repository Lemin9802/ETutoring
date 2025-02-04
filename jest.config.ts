// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest", // Use ts-jest to handle TypeScript
  testEnvironment: "jsdom", // Suitable for Next.js projects
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)"], // Match test files
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // Transform TypeScript files using ts-jest
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // Alias mapping (if using path aliases)
  },
  // setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;
