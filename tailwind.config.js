module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: {
    content: ['./pages/**/*.tsx'],
  },
  theme: {
    extend: {},
  },
  variants: {
    display: ['group-hover', 'responsive'],
  },
  plugins: [],
}
