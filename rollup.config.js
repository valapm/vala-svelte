import svelte from "rollup-plugin-svelte"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import livereload from "rollup-plugin-livereload"
import { terser } from "rollup-plugin-terser"
import json from "@rollup/plugin-json"
import nodePolyfills from "rollup-plugin-node-polyfills"
import postcss from "rollup-plugin-postcss"
import autoprefixer from "autoprefixer"
// import css from "rollup-plugin-css-only"
import sveltePreprocess from "svelte-preprocess"
import typescript from "@rollup/plugin-typescript"
import alias from "@rollup/plugin-alias"
import copy from "rollup-plugin-copy"
import replace from "@rollup/plugin-replace"
import dotenv from "dotenv"

dotenv.config()

const domain = "vala.ai"

const envVars = {
  BACKEND_HOST: process.env.BACKEND_HOST || `https://${domain}/api`,
  BACKEND_HOST_TESTNET: process.env.BACKEND_HOST_TESTNET || `https://${domain}/api/testnet`,
  GRAPHQL_HOST: process.env.GRAPHQL_HOST || `https://${domain}/gql`,
  GRAPHQL_HOST_TESTNET: process.env.GRAPHQL_HOST_TESTNET || `https://${domain}/gql/testnet`,
  GRAPHQL_WS_HOST: process.env.GRAPHQL_WS_HOST || `wss://${domain}/gql`,
  GRAPHQL_WS_HOST_TESTNET: process.env.GRAPHQL_WS_HOST_TESTNET || `wss://${domain}/gql/testnet`,
  AUTH_HOST: process.env.AUTH_HOST || `https://${domain}/auth`
}

console.log(envVars)

const production = !process.env.ROLLUP_WATCH

function serve() {
  let server

  function toExit() {
    if (server) server.kill(0)
  }

  return {
    writeBundle() {
      if (server) return
      server = require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
        stdio: ["ignore", "inherit", "inherit"],
        shell: true
      })

      process.on("SIGTERM", toExit)
      process.on("exit", toExit)
    }
  }
}

export default {
  input: "src/main.ts",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js"
  },
  external: ["vala-auth"],
  plugins: [
    replace({
      include: ["src/config.ts"],
      values: {
        ENV: JSON.stringify(envVars)
      }
    }),
    alias({
      crypto: "crypto-browserify"
    }),
    postcss({
      plugins: [autoprefixer],
      extract: "bundle.css",
      sourceMap: !production,
      minimize: production
    }),
    svelte({
      emitCss: true,
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
        css: false
      }
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    // css({ output: "bundle.css" }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
      preferBuiltins: true
    }),
    commonjs(),
    json(),
    nodePolyfills({
      include: ["node_modules/bitcoin-predict"] //, "../bitcoin-predict/lib"],
      // exclude: ["node_modules/bsv"]
      // crypto: true
    }),
    typescript({
      sourceMap: !production,
      inlineSources: !production
    }),
    copy({
      targets: [
        { src: "node_modules/vala-auth/dist/*", dest: "public/includes" },
        {
          src: "node_modules/@shoelace-style/shoelace/dist/assets",
          dest: "public/includes/shoelace"
        }
      ],
      copyOnce: true // Needed because of a bug resulting in horrible performance with shoelace
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public/"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
}
