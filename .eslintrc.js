module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  extends: 'standard-with-typescript',
  overrides: [
    {
      files: [
        'test/**/*',
        '**/*.spec.ts',
        '**/*.test.ts'
      ],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/prefer-expect-assertions': 'off',
        'jest/expect-expect': 'off'
      },
      parserOptions: {
        project: [
          './tsconfig.test.json'
        ]
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [
      './tsconfig.json'
    ]
  },
  rules: {
    'space-before-function-paren': 0,
    '@typescript-eslint/space-before-function-paren': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/promise-function-async': 0
  },
  ignorePatterns: [
    'temp.js', '**/vendor/*.js',
    'dist/*'
  ]
}
