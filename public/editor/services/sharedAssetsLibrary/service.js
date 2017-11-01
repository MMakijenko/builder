import vcCake from 'vc-cake'

const SharedAssets = window.VCV_GET_SHARED_ASSETS()

const API = {
  getAssetsLibraryFiles: (library) => {
    let data = typeof library === 'string' ? SharedAssets[ library ] : SharedAssets[ library.name ]
    let files = {
      cssBundles: [],
      jsBundles: []
    }

    if (data) {
      if (vcCake.env('ATTRIBUTE_LIBS')) {
        if (library.dependencies && library.dependencies.length) {
          library.dependencies.forEach((dependency) => {
            let dependencyLibraryFiles = API.getAssetsLibraryFiles(dependency)
            if (dependencyLibraryFiles.cssBundles && dependencyLibraryFiles.cssBundles.length) {
              files.cssBundles = files.cssBundles.concat(dependencyLibraryFiles.cssBundles)
            }
            if (dependencyLibraryFiles.jsBundles && dependencyLibraryFiles.jsBundles.length) {
              files.jsBundles = files.jsBundles.concat(dependencyLibraryFiles.jsBundles)
            }
          })
        }
      } else if (data.dependencies && data.dependencies.length) {
        data.dependencies.forEach((dependency) => {
          let dependencyLibraryFiles = API.getAssetsLibraryFiles(dependency)
          if (dependencyLibraryFiles.cssBundles && dependencyLibraryFiles.cssBundles.length) {
            files.cssBundles = files.cssBundles.concat(dependencyLibraryFiles.cssBundles)
          }
          if (dependencyLibraryFiles.jsBundles && dependencyLibraryFiles.jsBundles.length) {
            files.jsBundles = files.jsBundles.concat(dependencyLibraryFiles.jsBundles)
          }
        })
      }
      if (data.cssBundle) {
        files.cssBundles = files.cssBundles.concat(data.cssBundle)
      }

      if (data.jsBundle) {
        files.jsBundles = files.jsBundles.concat(data.jsBundle)
      }
    }
    // Remove duplicates
    files.cssBundles = [ ...new Set(files.cssBundles) ]
    files.jsBundles = [ ...new Set(files.jsBundles) ]
    return files
  },
  /**
   * Get source path
   * @param file
   * @returns {*}
   */
  getSourcePath: (file = null) => {
    let path = window.vcvPluginSourceUrl
    if (file.match('^(https?:)?\\/\\/?')) {
      return file
    }
    if (file) {
      path += file.replace(/^\//, '')
    }

    return path
  }
}
vcCake.addService('sharedAssetsLibrary', API)
