import nextJest from "next/jest";
import mappings from "./jest-module-name-mapping";

const createJestConfig = nextJest({
    dir: "./",
});

const customJestConfig = {
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

    moduleDirectories: ["node_modules", "<rootDir>/"],

    moduleNameMapper: {
        ...mappings,
        "^@/(.*)$": "<rootDir>/$1",
        "^@/components/(.*)$": "<rootDir>/components/$1",
        "^@/types/(.*)$": "<rootDir>/types/$1",
        "^@/lib/(.*)$": "<rootDir>/lib/$1",
    },

    testEnvironment: "jest-environment-jsdom",

    collectCoverageFrom: [
        "components/**/*.{js,jsx,ts,tsx}",
        "pages/**/*.{js,jsx,ts,tsx}",
        "lib/**/*.{js,jsx,ts,tsx}",
        "!**/*.d.ts",
        "!**/node_modules/**",
        "!**/.next/**",
        "!**/coverage/**",
        "!**/*.config.js",
    ],

    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    testMatch: [
        "<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}",
        "<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],

    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": [
            "babel-jest",
            { presets: ["next/babel"] },
        ] as [string, object],
    },

    setupFiles: ["<rootDir>/jest.polyfills.ts"],

    testTimeout: 30000,
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    transformIgnorePatterns: [
        "/node_modules/",
        "^.+\\.module\\.(css|sass|scss)$",
    ],

    clearMocks: true,
    restoreMocks: true,
    verbose: true,
};

export default createJestConfig(customJestConfig);
