<template>
  <div class="min-h-screen bg-emerald text-cream selection:bg-goldenrod selection:text-crimson antialiased">
    <transition name="page-fade" mode="out-in">
      <LoginView
        v-if="!session"
        @login-success="handleLoginSuccess"
      />
      <DashboardView
        v-else
        :session="session"
        @logout="handleLogout"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Session } from './types';
import LoginView from './views/LoginView.vue';
import DashboardView from './views/DashboardView.vue';

const session = ref<Session | null>(null);

// Restore session from localStorage if available
onMounted(() => {
  const savedSession = localStorage.getItem('ayurami_session');
  if (savedSession) {
    try {
      session.value = JSON.parse(savedSession);
    } catch (e) {
      localStorage.removeItem('ayurami_session');
    }
  }
});

const handleLoginSuccess = (newSession: Session) => {
  session.value = newSession;
  localStorage.setItem('ayurami_session', JSON.stringify(newSession));
};

const handleLogout = () => {
  session.value = null;
  localStorage.removeItem('ayurami_session');
};
</script>

<style>
/* Page-level transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
