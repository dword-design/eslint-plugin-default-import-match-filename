import minimatch from 'minimatch'
import P from 'path'

const isStaticRequire = node =>
  node &&
  node.callee &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'require' &&
  node.arguments.length === 1 &&
  node.arguments[0].type === 'Literal' &&
  typeof node.arguments[0].value === 'string'

const removeExtension = filename => P.basename(filename, P.extname(filename))

const normalizeFilename = filename =>
  filename.replace(/[-_.]/g, '').toLowerCase()

const isCompatible = (localName, filename) => {
  const normalizedLocalName = localName.replace(/_/g, '').toLowerCase()

  return (
    normalizedLocalName === normalizeFilename(filename) ||
    normalizedLocalName === normalizeFilename(removeExtension(filename))
  )
}

const isBarePackageImport = path =>
  (path !== '.' &&
    path !== '..' &&
    !path.includes('/') &&
    !path.startsWith('@')) ||
  /@[^/]+\/[^/]+$/.test(path)

const isAncestorRelativePath = path =>
  path.length > 0 &&
  !path.startsWith('/') &&
  path
    .split(/[/\\]/)
    .every(segment => segment === '..' || segment === '.' || segment === '')

const getPackageJsonName = packageJsonPath => {
  try {
    return require(P.resolve(packageJsonPath)).name || undefined
  } catch (_) {
    return undefined
  }
}

const getNameFromPackageJsonOrDirname = (path, context) => {
  const directoryName = P.join(context.getFilename(), path, '..')

  const packageJsonPath = P.join(directoryName, 'package.json')

  const packageJsonName = getPackageJsonName(packageJsonPath)

  return packageJsonName || P.basename(directoryName)
}

const getFilename = (path, context) => {
  // like require('lodash')
  if (isBarePackageImport(path)) {
    return undefined
  }

  const basename = P.basename(path)

  const isDir = /^index$|^index\./.test(basename)

  const processedPath = isDir ? P.dirname(path) : path
  // like require('.'), require('..'), require('../..')
  if (isAncestorRelativePath(processedPath)) {
    return getNameFromPackageJsonOrDirname(processedPath, context)
  }

  return P.basename(processedPath) + (isDir ? '/' : '')
}

const isIgnored = (context, ignorePaths, path) => {
  const resolvedPath = P.relative(
    process.cwd(),
    P.resolve(P.dirname(context.getFilename()), path)
  )

  return [...ignorePaths].some(pattern => minimatch(resolvedPath, pattern))
}

export default {
  create: context => {
    const ignorePaths = new Set(
      context.options[0] ? context.options[0].ignorePaths || [] : []
    )

    return {
      CallExpression: node => {
        if (
          !isStaticRequire(node) ||
          node.parent.type !== 'VariableDeclarator' ||
          node.parent.id.type !== 'Identifier'
        ) {
          return
        }

        const localName = node.parent.id.name

        const filename = getFilename(node.arguments[0].value, context)
        if (!filename) {
          return
        }
        if (
          !isCompatible(localName, filename) &&
          !isIgnored(context, ignorePaths, node.arguments[0].value)
        ) {
          context.report({
            message: `Default import name does not match filename "${filename}".`,
            node: node.parent.id,
          })
        }
      },

      ImportDeclaration: node => {
        const defaultImportSpecifier = node.specifiers.find(
          specifier => specifier.type === 'ImportDefaultSpecifier'
        )

        const defaultImportName =
          defaultImportSpecifier && defaultImportSpecifier.local.name
        if (!defaultImportName) {
          return
        }

        const filename = getFilename(node.source.value, context)
        if (!filename) {
          return
        }
        if (
          !isCompatible(defaultImportName, filename) &&
          !isIgnored(context, ignorePaths, node.source.value)
        ) {
          context.report({
            message: `Default import name does not match filename "${filename}".`,
            node: defaultImportSpecifier,
          })
        }
      },
    }
  },

  meta: {
    schema: [
      {
        additionalProperties: false,
        properties: {
          ignorePaths: {
            items: {
              type: 'string',
            },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
}
