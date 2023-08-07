/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "@routes/(.+)": "<rootDir>/src/routes/$1",
    "@/(.*)": "<rootDir>/src/$1",
  },
};
