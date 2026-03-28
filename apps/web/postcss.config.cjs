// apps/web/postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},   // ← this is the new correct plugin
    autoprefixer: {},
  },
}