import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  globalTeardown: './src/__test__/globalTeardown',
};

export default config;