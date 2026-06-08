<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-emerald p-4 font-outfit">
    <!-- Header/Logo container -->
    <div class="mb-8">
      <img src="/ayurami-logo.png" alt="Ayurami Logo" class="h-32 md:h-44 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]" />
    </div>

    <!-- Retro Login Card -->
    <div class="retro-panel-cream w-full max-w-md">
      <h2 class="text-3xl font-black text-crimson text-center mb-6 tracking-wide uppercase">
        Acceso al Sistema
      </h2>

      <!-- Alert messages -->
      <transition enter-active-class="transition duration-200 ease-out"
                  enter-from-class="transform -translate-y-2 opacity-0"
                  enter-to-class="transform translate-y-0 opacity-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="transform translate-y-0 opacity-100"
                  leave-to-class="transform -translate-y-2 opacity-0">
        <div v-if="errorMessage" class="bg-crimson text-cream border-4 border-black rounded-xl p-3 mb-5 font-bold flex items-center shadow-retro-sm">
          <span class="mr-2 text-xl">⚠️</span>
          <span>{{ errorMessage }}</span>
        </div>
      </transition>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label for="email" class="block text-crimson font-extrabold text-lg mb-2">
            Usuario
          </label>
          <input
            id="email"
            v-model="email"
            type="text"
            placeholder="ej. admin"
            class="retro-input"
            :disabled="isLoading"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-crimson font-extrabold text-lg mb-2">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="retro-input"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="retro-btn-yellow w-full block text-xl py-4 mt-6 uppercase tracking-wider"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-crimson" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando Sesión...
          </span>
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>

    <!-- Footer credit -->
    <div class="mt-8 text-cream/70 font-semibold text-sm tracking-wide">
      © 2026 Ayurami Web App
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import type { Session, User } from '../types';
import { api } from '../services/api';

const emit = defineEmits<{
  (e: 'login-success', session: Session): void;
 }>();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Custom JWT payload decoder
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await api.post<{ token: string }>('/login', {
      username: email.value,
      password: password.value
    });

    const token = response.token;
    const claims = parseJwt(token);
    if (!claims) {
      throw new Error('El token recibido del servidor no es válido.');
    }

    // Map backend role to frontend display role
    const backendRole = claims.role;
    let displayRole = 'Cliente';
    if (backendRole === 'ayurami-admin') {
      displayRole = 'Administrador';
    } else if (backendRole === 'ayurami-salesperson') {
      displayRole = 'Vendedor';
    }

    const authenticatedUser: User = {
      id: String(claims.id),
      name: claims.username === 'admin' ? 'Administrador Ayurami' : claims.username,
      email: claims.username.includes('@') ? claims.username : `${claims.username}@ayurami.com`,
      username: claims.username,
      role: displayRole,
      status: 'Activo',
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${claims.username}`
    };

    const session: Session = {
      token,
      user: authenticatedUser
    };

    emit('login-success', session);
  } catch (err: any) {
    console.error('Error logging in:', err);
    errorMessage.value = err.message || 'El usuario o la contraseña son incorrectos.';
  } finally {
    isLoading.value = false;
  }
};
</script>
