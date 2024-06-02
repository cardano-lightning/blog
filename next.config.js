const withNextra = require('nextra')({
  // theme: 'nextra-theme-blog',
  theme: './theme/index.tsx',
  themeConfig: './theme.config.jsx'
})

module.exports = withNextra()
