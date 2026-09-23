const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    proxy: {
      '/login':   { target: 'http://127.0.0.1:8082' },
      '/refresh': { target: 'http://127.0.0.1:8082' },
      '/status':  { target: 'http://127.0.0.1:8082' },
      '/hello':   { target: 'http://127.0.0.1:8082' },
      '/docs':    { target: 'http://127.0.0.1:8082' },
      '/api':     { target: 'http://127.0.0.1:8082' }
    }
  }
})
