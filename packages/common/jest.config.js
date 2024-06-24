export default {
  transform: { '^.+\\.ts$': 'ts-jest' },
  testEnvironment: 'node',
  testRegex: '/spec/.*\\.(test|spec)?\\.ts$',
  moduleFileExtensions: ['ts', 'js']
};
