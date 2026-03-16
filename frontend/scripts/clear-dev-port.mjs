import { execSync } from 'node:child_process'

const DEV_PORT = 5173

function getListeningPidsOnWindows(port) {
  try {
    const output = execSync(`netstat -ano -p tcp | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })

    const pids = new Set()

    for (const rawLine of output.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line) {
        continue
      }

      const columns = line.split(/\s+/)
      if (columns.length < 5) {
        continue
      }

      const localAddress = columns[1] ?? ''
      const state = (columns[3] ?? '').toUpperCase()
      const pid = Number(columns[4])

      if (!localAddress.endsWith(`:${port}`)) {
        continue
      }

      if (state !== 'LISTENING' || !Number.isInteger(pid) || pid <= 0) {
        continue
      }

      pids.add(pid)
    }

    return [...pids]
  } catch {
    return []
  }
}

function killPidsOnWindows(pids) {
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, {
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      process.stdout.write(`[predev] Cleared port ${DEV_PORT} by stopping PID ${pid}.\n`)
    } catch (error) {
      const stderr = String(error?.stderr ?? '').trim()
      if (stderr) {
        process.stdout.write(`[predev] Could not stop PID ${pid}: ${stderr}\n`)
      }
    }
  }
}

if (process.platform === 'win32') {
  const pids = getListeningPidsOnWindows(DEV_PORT)
  if (pids.length === 0) {
    process.stdout.write(`[predev] Port ${DEV_PORT} is free.\n`)
    process.exit(0)
  }

  killPidsOnWindows(pids)
  process.exit(0)
}

process.stdout.write(`[predev] Port cleanup is only configured for Windows.\n`)
