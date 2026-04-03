import { spawn } from 'node:child_process'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const SERVER_URL = 'http://127.0.0.1:3200/'
const SERVER_PORT = '3200'
const SERVER_HOST = '127.0.0.1'

const serverProcess = spawn(process.execPath, ['.output/server/index.mjs'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    HOST: SERVER_HOST,
    PORT: SERVER_PORT,
    NITRO_HOST: SERVER_HOST,
    NITRO_PORT: SERVER_PORT,
  },
  stdio: 'inherit',
})

let shuttingDown = false

async function waitForServer(url, timeoutMs = 30_000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (serverProcess.exitCode !== null) {
      throw new Error(
        `Nitro server exited early with code ${serverProcess.exitCode}`,
      )
    }

    try {
      const response = await fetch(url)

      if (response.ok) {
        return
      }
    } catch {
      // Server is still starting.
    }

    await delay(500)
  }

  throw new Error(`Timed out waiting for ${url}`)
}

function stopServer() {
  if (shuttingDown || serverProcess.exitCode !== null) {
    return
  }

  shuttingDown = true
  serverProcess.kill()
}

process.on('SIGINT', () => {
  stopServer()
  process.exit(130)
})

process.on('SIGTERM', () => {
  stopServer()
  process.exit(143)
})

try {
  await waitForServer(SERVER_URL)

  const playwrightProcess = spawn(
    process.execPath,
    ['node_modules/playwright/cli.js', 'test', '--config=playwright.config.ts'],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    },
  )

  const exitCode = await new Promise((resolve, reject) => {
    playwrightProcess.on('exit', (code) => resolve(code ?? 1))
    playwrightProcess.on('error', reject)
  })

  stopServer()
  process.exit(exitCode)
} catch (error) {
  stopServer()
  console.error(error)
  process.exit(1)
}
