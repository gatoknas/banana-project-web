import { createApp } from 'vue'
import App from './App.vue'
import './ui/theme/main.css'

// Prevent benign ResizeObserver loop notification warnings from triggering webpack overlay
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('ResizeObserver loop completed with undelivered notifications') ||
    event.message?.includes('ResizeObserver loop limit exceeded')
  ) {
    event.stopImmediatePropagation();
  }
});

createApp(App).mount('#app')
