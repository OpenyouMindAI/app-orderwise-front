/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { configure } from 'quasar/wrappers'
import path from 'path'
import dotenv from 'dotenv'

export default configure(function (/* ctx */) {
  // Cargar variables de entorno en orden de prioridad ascendente.
  // El mode-specific (.env.[mode]) siempre pisa a .env.local,
  // permitiendo que NODE_ENV=development use .env.development, etc.
  const nodeEnv = process.env.NODE_ENV || 'development'
  const envFiles = [
    '.env',                       // base (menor prioridad)
    `.env.${nodeEnv}`,            // mode-specific — pisa al base
    `.env.${nodeEnv}.local`,      // mode-specific local
    '.env.local',                 // local genérico — solo si no existe mode-specific
  ]

  let env = {}
  const loadedFiles = []
  for (const file of envFiles) {
    const result = dotenv.config({ path: path.resolve(__dirname, file) })
    if (!result.error) {
      // Mode-specific tiene mayor prioridad que .env.local
      // Si ya cargamos un archivo mode-specific, .env.local no pisa esas vars
      if (file === '.env.local' && loadedFiles.some(f => f.startsWith(`.env.${nodeEnv}`))) {
        // Mergear solo las keys que no estén ya definidas por mode-specific
        for (const [key, val] of Object.entries(result.parsed || {})) {
          if (!(key in env)) env[key] = val
        }
      } else {
        env = { ...env, ...result.parsed }
      }
      loadedFiles.push(file)
    }
  }
  console.log(`[env] NODE_ENV=${nodeEnv} | archivos cargados: ${loadedFiles.join(', ')}`)

  return {
    eslint: {
      warnings: true,
      errors: true
    },

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    boot: [
      'i18n',
      'axios',
      'authorization',
      'session-tracking',
      'VueHtmlToPaper',
      'pusher',
      'payment-notifier',
      'statusbar',
      'pixel'
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it
    ],

    build: {
      target: {
        browser: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15'],
        node: 'node16'
      },

      env,

      vueRouterMode: 'history', // available values: 'hash', 'history'
      extractCSS: true,
      vitePlugins: [
        ['@intlify/vite-plugin-vue-i18n', {
          include: path.resolve(__dirname, './src/i18n/**')
        }]
      ]
    },

    devServer: {
      port: 3000,
      open: false
    },

    framework: {
      config: {
        loading: {
          spinner: 'QSpinnerGears'
        }
      },
      components: [
        'QSpinnerGears',
        'QSpinnerHourglass',
        'QSpinnerRadio',
        'QSpinnerGrid'
      ],
      plugins: [
        'Notify',
        'Dialog',
        'Screen',
        'Loading'
      ]
    },

    animations: [],

    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [
        'render'
      ]
    },

    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      swFilename: 'register-service-worker.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false
    },

    cordova: {
      // noIosLegacyBuildFlag: true,
    },

    capacitor: {
      hideSplashscreen: true,
      iosStatusBarPadding: true,
      appName: 'Qbits'
    },

    electron: {
      inspectPort: 5858,
      bundler: 'packager',
      packager: {
        // Opciones específicas para electron-packager
      },
      builder: {
        appId: 'qbitsapp'
      }
    },

    bex: {
      contentScripts: [
        'my-content-script'
      ]
    },

    bin: {
      linuxAndroidStudio: '/snap/android-studio/current/bin/studio.sh'
    }
  }
})
