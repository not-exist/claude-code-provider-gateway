import { loadConfig } from './config/index.js'
import { startDaemon } from './runtime/daemon.js'

const config = loadConfig()
startDaemon(config)
