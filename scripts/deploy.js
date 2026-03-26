/**
 * deploy.js — Script de despliegue atómico vía SSH + rsync
 *
 * Estrategia de deploy sin downtime:
 *  1. Sube el build a una carpeta temporal (branch_tmp/) en el servidor
 *  2. Hace el swap atómico: branch_bak/ ← branch/ ← branch_tmp/
 *  3. El usuario nunca ve una versión mezclada de archivos
 *
 * Uso:
 *  node scripts/deploy.js [target] [branch]
 *  npm run deploy:qbits:develop
 *
 * @requires dotenv, node-ssh
 */

require('dotenv').config({ path: '.env.deploy' })
const { execSync } = require('child_process')
const { NodeSSH } = require('node-ssh')
const path = require('path')
const fs = require('fs')

const args = process.argv.slice(2)
const target = args[0]
const branch = args[1] || 'master'

if (!target) {
  console.error('Uso: node scripts/deploy.js [target] [branch]')
  console.error('Ejemplo: node scripts/deploy.js qbitsinc develop')
  process.exit(1)
}

/**
 * Configuración de targets y branches.
 * remotePath: ruta relativa dentro de public_html/orderwise/app/
 */
const configs = {
  qbitsinc: {
    host: process.env.SSH_HOST_QBITS || process.env.FTP_HOST_QBITS,
    port: parseInt(process.env.SSH_PORT_QBITS || '65002'),
    user: process.env.SSH_USER_QBITS || process.env.FTP_USER_QBITS?.split('.')[0],
    pass: process.env.SSH_PASS_QBITS || process.env.FTP_PASS_QBITS,
    remoteBase: 'public_html/orderwise/app',
    branches: {
      develop:      { buildCommand: 'npm run build-pwa-dev',      remoteDir: 'develop' },
      main:         { buildCommand: 'npm run build-main',          remoteDir: 'main' },
      master:       { buildCommand: 'npm run build-pwa',           remoteDir: 'master' },
      'main-premium': { buildCommand: 'npm run build-main-premium', remoteDir: 'main-premium' }
    }
  },
  dixcont: {
    host: process.env.SSH_HOST_DIXCONT || process.env.FTP_HOST_DIXCONT,
    port: parseInt(process.env.SSH_PORT_DIXCONT || '22'),
    user: process.env.SSH_USER_DIXCONT || process.env.FTP_USER_DIXCONT?.split('.')[0],
    pass: process.env.SSH_PASS_DIXCONT || process.env.FTP_PASS_DIXCONT,
    remoteBase: 'public_html/orderwise/app',
    branches: {
      staging: { buildCommand: 'npm run build-pwa-dixcont', remoteDir: 'master' }
    }
  }
}

const targetConfig = configs[target]
if (!targetConfig) {
  console.error(`Target desconocido: ${target}`)
  process.exit(1)
}

const branchConfig = targetConfig.branches[branch]
if (!branchConfig) {
  console.error(`Branch desconocido: ${branch} para target ${target}`)
  process.exit(1)
}

/**
 * Ejecuta un comando local y lanza excepción si falla.
 * @param {string} command Comando a ejecutar
 * @param {string} [cwd] Directorio de trabajo
 */
function runCommand (command, cwd = process.cwd()) {
  console.log(`\n> ${command}`)
  try {
    execSync(command, { stdio: 'inherit', cwd })
  } catch {
    console.error(`❌ Falló: ${command}`)
    process.exit(1)
  }
}

/**
 * Deploy principal con estrategia atómica:
 * Sube a _tmp → swap atómico → limpia _bak
 */
async function deploy () {
  const ssh = new NodeSSH()
  const localDist = path.join(process.cwd(), 'dist/spa')
  const remoteBase = `${targetConfig.remoteBase}/${branchConfig.remoteDir}`
  const remoteTmp = `${remoteBase}_tmp`
  const remoteBak = `${remoteBase}_bak`

  try {
    // ── 1. Plugins desde GitHub (no build local) ──────────────────────────
    console.log('📦 Plugins: se instalan desde GitHub (package.json)')

    // ── 2. Instalar dependencias ──────────────────────────────────────────
    console.log('\n📦 Instalando dependencias...')
    runCommand('npm install --legacy-peer-deps')

    // ── 3. Build ──────────────────────────────────────────────────────────
    console.log(`\n🔨 Construyendo (${target} / ${branch})...`)
    runCommand(branchConfig.buildCommand)

    if (!fs.existsSync(localDist)) {
      console.error('❌ dist/spa no existe — el build falló')
      process.exit(1)
    }

    // ── 4. Conectar por SSH ───────────────────────────────────────────────
    console.log(`\n🔗 Conectando a ${targetConfig.host}:${targetConfig.port}...`)
    await ssh.connect({
      host: targetConfig.host,
      port: targetConfig.port,
      username: targetConfig.user,
      password: targetConfig.pass,
      readyTimeout: 20000
    })
    console.log('✅ Conectado')

    // ── 5. Crear carpeta temporal en el servidor ──────────────────────────
    console.log(`\n📁 Preparando carpeta temporal: ${remoteTmp}`)
    await ssh.execCommand(`rm -rf ~/${remoteTmp} && mkdir -p ~/${remoteTmp}`)

    // ── 6. Subir archivos a _tmp (sin tocar la carpeta activa) ───────────
    console.log('\n⬆️  Subiendo archivos...')
    const files = getAllFiles(localDist)
    let uploaded = 0

    for (const file of files) {
      const relativePath = path.relative(localDist, file)
      const remoteFilePath = `${remoteTmp}/${relativePath.replace(/\\/g, '/')}`
      const remoteFileDir = remoteFilePath.substring(0, remoteFilePath.lastIndexOf('/'))

      await ssh.execCommand(`mkdir -p ~/${remoteFileDir}`)
      await ssh.putFile(file, `/home/${targetConfig.user}/${remoteFilePath}`)

      uploaded++
      process.stdout.write(`  ${uploaded}/${files.length} archivos\r`)
    }

    console.log(`\n✅ ${uploaded} archivos subidos a carpeta temporal`)

    // ── 7. Swap atómico ───────────────────────────────────────────────────
    console.log('\n🔄 Swap atómico (sin downtime)...')
    const swapCmd = [
      `rm -rf ~/${remoteBak}`,             // limpia backup anterior
      `mv ~/${remoteBase} ~/${remoteBak}`, // actual → backup
      `mv ~/${remoteTmp} ~/${remoteBase}`, // nueva → activa
    ].join(' && ')

    const swapResult = await ssh.execCommand(swapCmd)
    if (swapResult.stderr && !swapResult.stderr.includes('No such file')) {
      throw new Error(`Swap falló: ${swapResult.stderr}`)
    }

    console.log('✅ Swap completado — la versión nueva está activa')

    // ── 8. Limpiar backup ─────────────────────────────────────────────────
    await ssh.execCommand(`rm -rf ~/${remoteBak}`)

    ssh.dispose()
    console.log(`\n🚀 Deploy completado: ${target}/${branch}`)
    console.log(`   URL activa: https://app-app.qbitsinc.com/${branchConfig.remoteDir}/`)

  } catch (err) {
    console.error('\n❌ Error durante el deploy:', err.message || err)
    // Intentar rollback si el swap ya ocurrió parcialmente
    try {
      await ssh.execCommand(`[ -d ~/${remoteBak} ] && mv ~/${remoteBak} ~/${remoteBase}`)
      console.log('⚠️  Rollback aplicado — versión anterior restaurada')
    } catch {}
    ssh.dispose()
    process.exit(1)
  }
}

/**
 * Obtiene todos los archivos de un directorio recursivamente.
 * @param {string} dir Directorio raíz
 * @param {string[]} [result] Array acumulador
 * @returns {string[]} Lista de rutas absolutas
 */
function getAllFiles (dir, result = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      getAllFiles(fullPath, result)
    } else {
      result.push(fullPath)
    }
  }
  return result
}

deploy()
