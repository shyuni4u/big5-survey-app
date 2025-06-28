module.exports = {
  arrowParens: 'always',
  semi: false,
  trailingComma: 'all',
  singleQuote: true,
  useTabs: false,
  tabWidth: 2,
  printWidth: 120,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindAttributes: ['toastClassName', 'bodyClassName', 'overlayClassName'],
  tailwindFunctions: ['cn', 'cva', 'cx'],
}
