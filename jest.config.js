const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  preset: 'ts-jest',
  
  setupFilesAfterEnv: ['C:/Users/moham/Desktop/postgres_connect/psmp/jest.setup.ts'],
};