module.exports = {
  plugins: [
    "tailwindcss",
    // process.env.NODE_ENV === "production" ? purgecss : undefined,
    "autoprefixer",
    "postcss-preset-env",
  ],
};
