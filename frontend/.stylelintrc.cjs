module.exports = {
  rules: {
    'selector-disallowed-list': [
      '/^div$/',
      '/^p$/',
      '/^span$/',
      '/^ul$/',
      '/^li$/',
      '/^a$/',
      '/^button$/',
      '/^img$/',
    ],
    'selector-max-universal': 0,
  },
  ignoreFiles: [
    'src/styles/base.css',
    'src/components/HeroSection.css',
    'src/components/admin/AdminLayout.css',
  ],
};
