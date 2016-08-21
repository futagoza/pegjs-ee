'use strict'

import { inlineGrammer, extendInitializer } from '../utils'
import { dirname, extname, join } from 'path'
import { readFileSync } from 'fs'

export function use ( config, options ) {
  
  if ( !config.passes.preprocess ) {
    config.passes = Object.assign({ preprocess: [] }, config.passes)
  }

  config.passes.preprocess.push(( ast, options ) => {
    const dependencies = ast.dependencies

    if ( Array.isArray(dependencies) && dependencies.length ) {
      dependencies.forEach(dependency => {

        var resolve, ext, root, filename

        switch ( dependency.type ) {

          case 'include':
            resolve = options.disableIncludes ? null : join
            break

          case 'import':
            resolve = options.disableImports ? null : require.resolve
            break

        }

        if ( resolve ) {
          ext = extname(dependency.path)
          root = dirname(dependency.location.filename)
          filename = resolve(root, dependency.path)

          if ( ext === '.pegjs' ) {
            inlineGrammer(filename, ast, config.parser)
          }
          else if ( ext === '.js' ) {
            extendInitializer(ast, readFileSync(filename, 'utf-8'))
          }
        }

      })
    }
  })

}
