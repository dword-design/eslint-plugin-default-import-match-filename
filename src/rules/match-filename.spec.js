import { keys, map, mapKeys, pick } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { Linter } from 'eslint'
import outputFiles from 'output-files'

import self from './match-filename'

const getMessage = filename =>
  `Default import name does not match filename "${filename}".`

const fail = (code, expectedFilename, filename) => ({
  code,
  errors: [
    {
      message: getMessage(expectedFilename),
    },
  ],
  filename,
})

const parserOptions = {
  ecmaVersion: 6,
  sourceType: 'module',
}

export default tester(
  [
    'import Cat from "./cat"',
    'import cat from "./cat"',
    'import cat from "./Cat"',
    'import Cat from "./Cat"',
    'import cat from "./cat.js"',
    'import cat from "./cat.ts"',
    'import cat from "./cat.jpeg"',
    'import cat from ".cat"',
    'import cat_ from "./cat"',
    'import cat from "./cat/index"',
    'import cat from "./cat/index.js"',
    'import cat from "./cat/index.css"',
    'import cat from "../cat/index.js"',
    'import merge from "lodash/merge"',
    'import cat from "/cat.js"', // absolute path
    'import cat from "C:\\cat.js"',
    'import cat from "C:/cat.js"',
    'import loudCat from "./loud-cat"',
    'import LOUDCAT from "./loud-cat"',
    'import loud_cat from "./loud-cat"',
    'import loudcat from "./loud_cat"',
    'import loud_cat from "./loud_cat"',
    'import loudCat from "./loud_cat"',
    'import catModel from "./cat.model"',
    'import catModel from "./cat.model.js"',
    'import doge from "cat"',
    'import doge from "loud-cat"',
    'import doge from ".cat"',
    'import doge from ""',
    'import whatever from "@foo/bar"',
    'import {doge} from "./cat"',
    'import cat, {doge} from "./cat"',
    'const cat = require("./cat")',
    'const cat = require("../cat")',
    'const cat = require("./cat/index")',
    'const cat = require("./cat/index.js")',
    'const doge = require("cat")',
    'const {f, g} = require("./cat")',
    {
      code: `import whatever from './ignored/foo.js'`,
      filename: 'main.js',
      options: [{ ignorePaths: ['**/ignored/*.js'] }],
    },
    {
      code: `import whatever from '../ignored/foo.js'`,
      filename: 'some-directory/a.js',
      options: [{ ignorePaths: ['**/ignored/*.js'] }],
    },
    {
      code: `import whatever from './ignored/foo.js'`,
      filename: 'main.js',
      options: [{ ignorePaths: ['**/foo.js'] }],
    },
    {
      code: `import whatever from './some-directory/a.js'`,
      filename: 'main.js',
      // This test should be ran with project root as process.cwd().
      options: [
        {
          ignorePaths: ['some-directory/a.js'],
        },
      ],
    },
    {
      code: `
    import someDirectory from ".";
    import someDirectory_ from "./";
    const someDirectory__ = require('.');
  `,
      filename: 'some-directory/a.js',
    },
    {
      code: `
    import packageName from "..";
    import packageName_ from "../";
    import packageName__ from "./..";
    import packageName___ from "./../";
    const packageName____ = require('..');
  `,
      filename: 'some-directory/a.js',
    },
    {
      code: 'import doge from "../index.js"',
      filename: 'doge/a/a.js',
    },
    {
      code: 'import JordanHarband from "./JordanHarband";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "./JordanHarband.js";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "./JordanHarband.jsx";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "/some/path/to/JordanHarband.js";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "/another/path/to/JordanHarband.js";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "/another/path/to/jordanHarband.js";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "/another/path/to/jordanHarband.jsx";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "./JordanHarband/index.js";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "./JordanHarband/index.jsx";',
      parserOptions,
    },
    {
      code: 'import TaeKim from "./TaeKim.ts";',
      parserOptions,
      settings: {
        'import/extensions': ['.ts'],
      },
    },
    {
      code: 'import TaeKim from "./TaeKim.tsx";',
      parserOptions,
      settings: {
        'import/extensions': ['.ts'],
      },
    },
    {
      code: 'import TaeKim from "./TaeKim.js";',
      parserOptions,
      settings: {
        'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    {
      code: 'import TaeKim from "./TaeKim.jsx";',
      parserOptions,
      settings: {
        'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    {
      code: 'import TaeKim from "./TaeKim.ts";',
      parserOptions,
      settings: {
        'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    {
      code: 'import TaeKim from "./TaeKim.tsx";',
      parserOptions,
      settings: {
        'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    {
      code: 'import JordanHarband from "path/to/something/JoRdAnHaRbAnD.jsx";',
      parserOptions,
    },
    fail('import cat0 from "./cat"', 'cat'),
    fail('import catfish from "./cat"', 'cat'),
    fail('import catfish, {cat} from "./cat"', 'cat'),
    fail('import catModel from "./models/cat"', 'cat'),
    fail('import cat from "./cat.model.js"', 'cat.model.js'),
    fail('import doge from "./cat/index"', 'cat/'),
    fail('import doge from "./cat/index.js"', 'cat/'),
    fail('import doge from "../cat/index.js"', 'cat/'),
    fail('import doge from "../cat/index.css"', 'cat/'),
    fail('import doge from "lodash/merge"', 'merge'),
    fail('import doge from "lodash/a/b/c"', 'c'),
    fail('import doge from "@foo/bar/a"', 'a'),
    fail('import doge from "/cat"', 'cat'),
    fail('import cat7 from "./cat8"', 'cat8'),
    fail('const catfish = require("./cat")', 'cat'),
    fail('const doge = require("./cat/index")', 'cat/'),
    fail('const doge = require("./cat/index.js")', 'cat/'),
    fail('const doge = require("../models/cat")', 'cat'),
    fail('import nope from "."', 'some-directory', 'some-directory/a.js'),
    fail('import nope from ".."', 'package-name', 'some-directory/a.js'),
    fail(
      'import nope from "../../index.js"',
      'package-name',
      'some-directory/foo/a.js'
    ),
    {
      code: `import wrongName from './some-directory/a.js';`,
      errors: [{ message: getMessage('a.js') }],
      filename: 'main.js',
      options: [{ ignorePaths: ['**/b.js', 'a.js', './a.js'] }],
      output: `import wrongName from './some-directory/a.js';`,
    },
    {
      code: 'import JordanHarband from "./NotJordanHarband.js";',
      errors: [
        {
          message: getMessage('NotJordanHarband.js'),
          type: 'ImportDefaultSpecifier',
        },
      ],
      output: 'import JordanHarband from "./NotJordanHarband.js";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "./NotJordanHarband.jsx";',
      errors: [
        {
          message: getMessage('NotJordanHarband.jsx'),
          type: 'ImportDefaultSpecifier',
        },
      ],
      output: 'import JordanHarband from "./NotJordanHarband.jsx";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "./NotJordanHarband/index.js";',
      errors: [
        {
          message: getMessage('NotJordanHarband/'),
          type: 'ImportDefaultSpecifier',
        },
      ],
      output: 'import JordanHarband from "./NotJordanHarband/index.js";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "./JordanHarband/foobar.js";',
      errors: [
        {
          message: getMessage('foobar.js'),
          type: 'ImportDefaultSpecifier',
        },
      ],
      output: 'import JordanHarband from "./JordanHarband/foobar.js";',
      parserOptions,
    },
    {
      code: 'import JordanHarband from "/path/to/JordanHarbandReducer.js";',
      errors: [
        {
          message: getMessage('JordanHarbandReducer.js'),
          type: 'ImportDefaultSpecifier',
        },
      ],
      output: 'import JordanHarband from "/path/to/JordanHarbandReducer.js";',
      parserOptions,
    },
  ],
  [
    {
      transform: test => async () => {
        await outputFiles({
          'ignored/foo.js': '',
          'main.js': '',
          'package.json': JSON.stringify({ name: 'package-name' }),
          'some-directory': {
            'a.js': '',
            'index.js': '',
          },
        })
        if (typeof test === 'string') {
          test = { code: test }
        }
        test = {
          errors: [],
          eslintConfig: {},
          filename: 'index.js',
          options: [],
          output: test.code,
          ...test,
        }

        const linter = new Linter()
        linter.defineRule('self/self', self)

        const lintingConfig = {
          parserOptions: {
            ecmaVersion: 2015,
            sourceType: 'module',
          },
          rules: {
            'self/self': ['error', ...test.options],
            ...test.eslintConfig.rules,
          },
          ...test.eslintConfig,
        }

        const lintedMessages = linter.verify(test.code, lintingConfig, {
          filename: test.filename,
        })

        const lintedOutput = linter.verifyAndFix(test.code, lintingConfig, {
          filename: test.filename,
        }).output
        if (test.errors.length === 0 && lintedMessages.length > 0) {
          throw new Error(
            `Expected ${test.errors.length} errors but got ${JSON.stringify(
              lintedMessages,
              undefined,
              2
            )}`
          )
        } else if (test.errors.length > 0 && lintedMessages.length === 0) {
          throw new Error(
            `Expected ${test.errors.length} errors but got ${lintedMessages.length}`
          )
        }
        expect(
          lintedMessages
            |> map(
              (message, index) =>
                message
                |> mapKeys((value, key) => (key === 'nodeType' ? 'type' : key))
                |> pick(test.errors[index] |> keys)
            )
        ).toEqual(test.errors)
        expect(lintedOutput).toEqual(test.output)
      },
    },
    testerPluginTmpDir(),
  ]
)
