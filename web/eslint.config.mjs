import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import prettier from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
    {
    // 対象と除外ファイルの指定
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'src/generated/prisma/**',
      'prisma/**',
      '.next/',
      'out/',
      'dist/',
      'build/',
      'node_modules/',
      '.env',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  prettier,
]

export default eslintConfig
