import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixturesRoot = join(root, 'fixtures')
const temporaryRoot = join(root, '.local', 'package-verification')
const tarballRoot = join(temporaryRoot, 'tarballs')
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
const keepTemporaryFiles = process.argv.includes('--keep')

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`)
  }
}

function installAndRunFixture(name, entry) {
  const source = join(fixturesRoot, name)
  const destination = join(temporaryRoot, name)
  cpSync(source, destination, { recursive: true })

  const packagePath = join(destination, 'package.json')
  const fixturePackage = JSON.parse(readFileSync(packagePath, 'utf8'))
  fixturePackage.dependencies = {
    'enhanced-enum': `file:${relative(destination, tarballPath).replaceAll('\\', '/')}`,
  }
  writeFileSync(packagePath, `${JSON.stringify(fixturePackage, null, 2)}\n`)

  run(pnpm, ['install', '--offline'], destination)
  run(process.execPath, [tsc, '--project', 'tsconfig.json'], destination)
  run(process.execPath, [join('dist', entry)], destination)
}

let tarballPath

run(pnpm, ['build'])
rmSync(temporaryRoot, { recursive: true, force: true })
mkdirSync(tarballRoot, { recursive: true })

try {
  run(pnpm, ['pack', '--pack-destination', tarballRoot])
  const tarballs = readdirSync(tarballRoot).filter((file) => file.endsWith('.tgz'))
  if (tarballs.length !== 1) {
    throw new Error(`Expected one tarball, found ${tarballs.length}`)
  }

  tarballPath = join(tarballRoot, tarballs[0])
  installAndRunFixture('consumer-esm', 'index.mjs')
  installAndRunFixture('consumer-cjs', 'index.cjs')
} finally {
  if (existsSync(temporaryRoot) && !keepTemporaryFiles) {
    rmSync(temporaryRoot, { recursive: true, force: true })
  }
}

if (keepTemporaryFiles) {
  console.log(`Package verification files kept at ${temporaryRoot}`)
}
