import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // 생성물과 파이썬 가상환경은 린트 대상에서 제외 (site-packages가 minified JS를 포함)
  { ignores: ['src/scripts/venv/**', 'src/scripts/data/**', 'src/scripts/runs/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]

export default eslintConfig
