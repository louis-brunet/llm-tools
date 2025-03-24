// FIXME: server tests are broken. module resolution does not work with tsconfig
// paths for some reason

import tsconfig from './tsconfig.json' with { type: 'json' };

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    // '.*': 'ts-jest',
    '^.+\\.(t|j)s$': 'ts-jest',
    '^.+\\.tsx?$': ['ts-jest', {}],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  modulePaths: [tsconfig.compilerOptions.baseUrl], // <-- This will be set to 'baseUrl' value
  moduleNameMapper: {
    '^#app/(.*)$': '<rootDir>/app/$1',
    '^#helpers/(.*)$': '<rootDir>/helpers/$1',
    '^#config/(.*)$': '<rootDir>/config/$1',
    '^#infra/(.*)$': '<rootDir>/infra/$1',
  },
};
