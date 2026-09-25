const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (
            error?.message?.includes('ResizeObserver loop completed with undelivered notifications') ||
            error?.message?.includes('ResizeObserver loop limit exceeded')
          ) {
            return false;
          }
          return true;
        }
      }
    },
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
