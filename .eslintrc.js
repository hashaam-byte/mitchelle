module.exports = {
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off', // Disable unused vars rule
    '@typescript-eslint/no-explicit-any': 'off', // Disable explicit any rule
  },
};
