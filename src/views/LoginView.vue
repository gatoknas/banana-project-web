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
            Correo Electrónico
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="ejemplo@ayurami.com"
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

        <!-- Help Info in Comic style -->
        <div class="bg-less-golden/50 border-2 border-black border-dashed rounded-xl p-3 text-sm font-semibold text-crimson/80">
          💡 <span class="font-bold">Credenciales de prueba:</span><br/>
          Usuario: <code class="font-mono text-black font-bold">admin@ayurami.com</code><br/>
          Clave: <code class="font-mono text-black font-bold">admin123</code>
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

const emit = defineEmits<{
  (e: 'login-success', session: Session): void;
}>();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = () => {
  isLoading.value = true;
  errorMessage.value = '';

  // Simulate API delay of 1 second
  setTimeout(() => {
    if (email.value === 'admin@ayurami.com' && password.value === 'admin123') {
      const mockUser: User = {
        id: 'usr_1',
        name: 'Administrador Ayurami',
        email: email.value,
        role: 'Administrador',
        status: 'Activo',
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ayurami'
      };

      const mockSession: Session = {
        token: 'mock_jwt_token_xyz_123',
        user: mockUser
      };

      isLoading.value = false;
      emit('login-success', mockSession);
    } else {
      isLoading.value = false;
      errorMessage.value = 'El correo electrónico o la contraseña son incorrectos.';
    }
  }, 1000);
};
</script>
