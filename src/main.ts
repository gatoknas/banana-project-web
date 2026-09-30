import { createApp } from 'vue'
import App from './App.vue'
import './ui/theme/main.css'
import { logger } from './utils/logger'

// Global Vue application instance
const app = createApp(App);

// Vue 3 Component Error Boundary Handler
app.config.errorHandler = (err, instance, info) => {
  logger.error('vue_component_error', `Unhandled component error during ${info}`, err, {
    info,
    component: instance?.$options?.name || 'AnonymousComponent'
  });
};

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.error('unhandled_promise_rejection', 'Unhandled Promise Rejection detected', event.reason, {
    reason: event.reason
  });
});

// Window error listener (with filter for benign ResizeObserver notifications)
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('ResizeObserver loop completed with undelivered notifications') ||
    event.message?.includes('ResizeObserver loop limit exceeded')
  ) {
    event.stopImmediatePropagation();
    return;
  }

  logger.error('window_runtime_error', event.message || 'Window runtime error', event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

app.mount('#app');
