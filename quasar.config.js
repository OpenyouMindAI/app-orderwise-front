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
  // Cargar variables de entorno según entorno actual
  const envFile = `.env.${process.env.NODE_ENV}`
  const env = dotenv.config({ path: envFile }).parsed

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
      'pinia',
      'authorization',
      'VueHtmlToPaper',
      'pusher',
      'payment-notifier',
      // 'background-mode',
      'statusbar',
      'pixel',
      'company-config',
      'session-tracking'
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
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
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
        appId: 'orderwise'
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
