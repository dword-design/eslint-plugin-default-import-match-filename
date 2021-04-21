import packageConfig from '@/package.json'

import matchFilename from './rules/match-filename'

export default {
  configs: {
    recommended: {
      plugins: [packageConfig.name],
      rules: {
        [`${packageConfig.name.replace(
          /^eslint-plugin-/,
          ''
        )}/match-filename`]: 'error',
      },
    },
  },
  rules: {
    'match-filename': matchFilename,
  },
}
