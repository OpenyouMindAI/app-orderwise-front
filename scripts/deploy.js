require('dotenv').config({ path: '.env.deploy' })
const { execSync } = require('child_process')
const FtpDeploy = require('ftp-deploy')
const ftpDeploy = new FtpDeploy()
const path = require('path')

const args = process.argv.slice(2)
const target = args[0] // 'qbitsinc' or 'dixcont'
const branch = args[1] || 'master' // default branch

if (!target) {
  console.error('Uso: node scripts/deploy.js [target] [branch]')
  console.error('Ejemplo: node scripts/deploy.js qbitsinc production')
  process.exit(1)
}

const configs = {
  qbitsinc: {
    develop: {
      buildCommand: 'npm run build-pwa-dev',
      remotePath: './develop/',
      host: process.env.FTP_HOST_QBITS,
      user: process.env.FTP_USER_QBITS,
      pass: process.env.FTP_PASS_QBITS
    },
    main: {
      buildCommand: 'npm run build-main',
      remotePath: './main/',
      host: process.env.FTP_HOST_QBITS,
      user: process.env.FTP_USER_QBITS,
      pass: process.env.FTP_PASS_QBITS
    },
    master: {
      buildCommand: 'npm run build-pwa',
      remotePath: './master/',
      host: process.env.FTP_HOST_QBITS,
      user: process.env.FTP_USER_QBITS,
      pass: process.env.FTP_PASS_QBITS
    }
  },
  dixcont: {
    staging: {
      buildCommand: 'npm run build-pwa-dixcont',
      remotePath: './master/',
      host: process.env.FTP_HOST_DIXCONT,
      user: process.env.FTP_USER_DIXCONT,
      pass: process.env.FTP_PASS_DIXCONT
    }
  }
}

const config = configs[target] ? configs[target][branch] : null

if (!config) {
  console.error(`Configuración no encontrada para target: ${target} y branch: ${branch}`)
  process.exit(1)
}

/**
 * Executes a shell command and logs output
 * @params {string} command
 */
function runCommand (command, cwd = process.cwd()) {
  console.log(`\n> Ejecutando: ${command} en ${cwd}`)
  try {
    execSync(command, { stdio: 'inherit', cwd })
  } catch (error) {
    console.error(`Error ejecutando comando: ${command}`)
    process.exit(1)
  }
}

async function deploy () {
  try {
    // 1. Build Plugins
    console.log('--- Construyendo Plugins ---')

    // Multi Display Manager
    runCommand('npm install --legacy-peer-deps', path.join(process.cwd(), 'plugin/multi-display-manager'))
    runCommand('npm run build', path.join(process.cwd(), 'plugin/multi-display-manager'))
    runCommand('npm install ./plugin/multi-display-manager --legacy-peer-deps')

    // Printers
    runCommand('npm install --legacy-peer-deps', path.join(process.cwd(), 'plugin/printers'))
    runCommand('npm run build', path.join(process.cwd(), 'plugin/printers'))
    runCommand('npm install ./plugin/printers --legacy-peer-deps')

    // 2. Install main dependencies
    console.log('\n--- Instalando dependencias principales ---')
    runCommand('npm install --legacy-peer-deps')

    // 3. Build main app
    console.log(`\n--- Construyendo aplicación (${target} - ${branch}) ---`)
    runCommand(config.buildCommand)

    // 4. Deploy via FTP
    console.log('\n--- Iniciando Transferencia FTP ---')

    const ftpConfig = {
      user: config.user,
      password: config.pass,
      host: config.host,
      port: 21,
      localRoot: path.join(process.cwd(), 'dist/spa'),
      remoteRoot: config.remotePath,
      include: ['*', '**/*'],
      deleteRemote: false,
      forcePasv: true
    }

    ftpDeploy.on('uploading', (data) => {
      process.stdout.write(`Subiendo: ${data.transferredFileCount}/${data.totalFilesCount} (${data.filename})\r`)
    })

    ftpDeploy.on('uploaded', (data) => {
      // Just keep progress clean
    })

    await ftpDeploy.deploy(ftpConfig)

    console.log('\n\n✅ ¡Despliegue completado con éxito!')
  } catch (err) {
    console.error('\n❌ Error durante el despliegue:', err)
    process.exit(1)
  }
}

deploy()
