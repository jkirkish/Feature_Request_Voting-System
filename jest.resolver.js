module.exports = (path, options) => {
  // Call the default resolver
  return options.defaultResolver(path, {
    ...options,
    // Use package.json's "exports" field for module resolution
    packageFilter: pkg => {
      if (pkg.exports) {
        pkg.main = pkg.exports['.']?.default ?? pkg.exports['.']
      }
      return pkg
    },
  })
} 