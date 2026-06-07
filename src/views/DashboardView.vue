<template>
  <div class="min-h-screen bg-emerald font-outfit text-cream flex flex-col select-none">
    <!-- Navbar -->
    <header class="border-b-6 border-golden-title bg-crimson px-4 py-3 sticky top-0 z-50 shadow-retro">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Logo and App Title -->
        <div class="flex items-center gap-3">
          <img src="/ayurami-logo.png" alt="Ayurami Logo" class="h-10 md:h-12 object-contain" />
          <span class="text-xl md:text-2xl font-black text-golden-title tracking-wider uppercase drop-shadow">
            Administración
          </span>
        </div>

        <!-- Navigation Menu in Spanish -->
        <nav class="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
          <button
            @click="activeTab = 'home'"
            :class="activeTab === 'home' ? 'retro-nav-link-active' : 'retro-nav-link'"
          >
            Panel
          </button>
          <button
            @click="activeTab = 'products'"
            :class="activeTab === 'products' ? 'retro-nav-link-active' : 'retro-nav-link'"
          >
            Productos
          </button>
          <button
            @click="activeTab = 'users'"
            :class="activeTab === 'users' ? 'retro-nav-link-active' : 'retro-nav-link'"
          >
            Usuarios
          </button>
        </nav>

        <!-- User Profile & Logout -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex flex-col text-right">
            <span class="font-black text-cream text-sm">{{ session.user.name }}</span>
            <span class="text-xs text-goldenrod font-bold">{{ session.user.role }}</span>
          </div>
          <img :src="session.user.avatar" alt="Avatar" class="h-10 w-10 rounded-full border-2 border-black bg-cream p-0.5" />
          <button
            @click="handleLogout"
            class="retro-btn-yellow py-1.5 px-3 text-sm border-2 font-black shadow-retro-sm"
          >
            Salir
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6">
      <transition name="fade" mode="out-in">
        <!-- Dashboard Overview Tab -->
        <div v-if="activeTab === 'home'" class="space-y-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b-4 border-black pb-4">
            <div>
              <h1 class="text-4xl font-black text-golden-title tracking-wide uppercase">
                Panel de Control
              </h1>
              <p class="text-cream/80 font-bold">¡Bienvenido de nuevo, {{ session.user.name }}!</p>
            </div>
            <div class="bg-black/25 text-xs text-cream px-3 py-1.5 rounded-full font-bold border border-black/10">
              Servidor API: <span class="text-emerald font-black">Conectado (Mock)</span>
            </div>
          </div>

          <!-- Retro Panels Grid mirroring the Mobile App -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- TOTAL REVENUE CARD (Crimson Theme) -->
            <div class="retro-panel-crimson flex flex-col justify-between min-h-[200px]">
              <div>
                <span class="text-xs tracking-wider font-black text-goldenrod uppercase">Ingresos Totales</span>
                <h3 class="text-4xl font-extrabold mt-2 tracking-tight text-cream">
                  TOTAL REVENUE
                </h3>
              </div>
              <div class="mt-4 flex items-baseline">
                <span class="text-5xl font-black text-goldenrod">$12,670</span>
                <span class="ml-2 text-xs font-bold text-cream/70">+12% este mes</span>
              </div>
            </div>

            <!-- VISITS CARD (Emerald / Dark Green Theme) -->
            <div class="retro-panel-emerald flex flex-col justify-between min-h-[200px]">
              <div>
                <span class="text-xs tracking-wider font-black text-golden-title uppercase">Visitas</span>
                <h3 class="text-4xl font-extrabold mt-2 tracking-tight text-cream">
                  VISITS
                </h3>
              </div>
              <!-- Simulated Wave Graph SVG matching the Mobile UI -->
              <div class="h-20 w-full mt-4 bg-black/20 rounded-xl p-2 border-2 border-black/40 overflow-hidden relative">
                <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path
                    d="M0,35 Q10,15 20,25 T40,15 T60,28 T80,12 T100,5 L100,40 L0,40 Z"
                    fill="rgba(1, 106, 77, 0.4)"
                  />
                  <path
                    d="M0,35 Q10,15 20,25 T40,15 T60,28 T80,12 T100,5"
                    fill="none"
                    stroke="#40E0D0"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>

            <!-- TRAFFIC SOURCES CARD (Crimson Theme) -->
            <div class="retro-panel-crimson flex flex-col justify-between min-h-[200px]">
              <div>
                <span class="text-xs tracking-wider font-black text-goldenrod uppercase font-black">Orígenes de Tráfico</span>
                <h3 class="text-4xl font-extrabold mt-2 tracking-tight text-cream">
                  TRAFFIC SOURCES
                </h3>
              </div>
              <div class="flex items-center justify-between gap-4 mt-4">
                <!-- Conic Gradient Pie Chart -->
                <div class="h-20 w-20 rounded-full border-4 border-black shadow-retro-sm shrink-0" 
                     style="background: conic-gradient(#b73301 0% 35%, #fab214 35% 65%, #40E0D0 65% 85%, #016a4d 85% 100%)">
                </div>
                <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-bold text-cream/95">
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 bg-crimson border border-black inline-block rounded-full"></span> Directo (35%)
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 bg-golden-title border border-black inline-block rounded-full"></span> Social (30%)
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 bg-turquoise border border-black inline-block rounded-full"></span> Búsqueda (20%)
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 bg-emerald border border-black inline-block rounded-full"></span> Otros (15%)
                  </div>
                </div>
              </div>
            </div>

            <!-- UPDATE CARD (Folder-tab, Yellow Theme) -->
            <div class="lg:col-span-1 relative pt-6">
              <!-- Folder Tab Header -->
              <div class="absolute top-0 left-6 bg-golden-title text-crimson font-black px-4 py-1 rounded-t-xl border-t-4 border-x-4 border-black text-xs uppercase z-10">
                Update
              </div>
              <div class="retro-panel-yellow pt-8 flex flex-col justify-between h-full min-h-[250px]">
                <div class="space-y-3">
                  <div class="flex items-center gap-3 text-crimson font-bold">
                    <div class="w-6 h-6 rounded-full bg-emerald border-2 border-black flex items-center justify-center text-xs text-cream">✓</div>
                    <span>Inventario de Productos actualizado</span>
                  </div>
                  <div class="flex items-center gap-3 text-crimson font-bold">
                    <div class="w-6 h-6 rounded-full bg-emerald border-2 border-black flex items-center justify-center text-xs text-cream">✓</div>
                    <span>5 nuevos usuarios registrados</span>
                  </div>
                  <div class="flex items-center gap-3 text-crimson font-bold">
                    <div class="w-6 h-6 rounded-full bg-emerald border-2 border-black flex items-center justify-center text-xs text-cream">✓</div>
                    <span>Reporte mensual de ventas generado</span>
                  </div>
                </div>
                <button class="retro-btn-crimson w-full mt-4 font-black uppercase text-sm">
                  Actualizar Datos
                </button>
              </div>
            </div>

            <!-- USER GROWTH CARD (Folder-tab, Guayaba Theme) -->
            <div class="lg:col-span-2 relative pt-6">
              <!-- Folder Tab Header -->
              <div class="absolute top-0 left-6 bg-golden-title text-crimson font-black px-4 py-1 rounded-t-xl border-t-4 border-x-4 border-black text-xs uppercase z-10">
                User Growth
              </div>
              <div class="retro-panel-guayaba pt-8 flex flex-col justify-between h-full min-h-[250px]">
                <div>
                  <h4 class="text-xl font-black text-crimson tracking-wide uppercase mb-3">Crecimiento de Usuarios</h4>
                </div>
                <!-- Bar Chart -->
                <div class="h-32 flex items-end justify-between gap-1.5 bg-cream/35 border-4 border-black rounded-2xl p-4 shadow-retro-sm">
                  <!-- Flexbox Bars -->
                  <div class="w-full flex items-end justify-between h-full">
                    <div class="w-4 bg-emerald border-2 border-black rounded-t-sm" style="height: 15%"></div>
                    <div class="w-4 bg-golden-title border-2 border-black rounded-t-sm" style="height: 25%"></div>
                    <div class="w-4 bg-crimson border-2 border-black rounded-t-sm" style="height: 20%"></div>
                    <div class="w-4 bg-turquoise border-2 border-black rounded-t-sm" style="height: 38%"></div>
                    <div class="w-4 bg-emerald border-2 border-black rounded-t-sm" style="height: 45%"></div>
                    <div class="w-4 bg-golden-title border-2 border-black rounded-t-sm" style="height: 60%"></div>
                    <div class="w-4 bg-crimson border-2 border-black rounded-t-sm" style="height: 55%"></div>
                    <div class="w-4 bg-turquoise border-2 border-black rounded-t-sm" style="height: 75%"></div>
                    <div class="w-4 bg-emerald border-2 border-black rounded-t-sm" style="height: 82%"></div>
                    <div class="w-4 bg-golden-title border-2 border-black rounded-t-sm" style="height: 95%"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Products View Tab -->
        <div v-else-if="activeTab === 'products'">
          <ProductsView />
        </div>

        <!-- Users View Tab -->
        <div v-else-if="activeTab === 'users'">
          <UsersView />
        </div>
      </transition>
    </main>

    <!-- Footer -->
    <footer class="border-t-4 border-black bg-crimson/80 text-cream/70 text-center py-4 text-xs font-bold tracking-wider mt-auto">
      Plataforma Ayurami Web • Todos los derechos reservados © 2026
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import type { Session } from '../types';
import ProductsView from './ProductsView.vue';
import UsersView from './UsersView.vue';

defineProps<{
  session: Session;
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const activeTab = ref<'home' | 'products' | 'users'>('home');

const handleLogout = () => {
  emit('logout');
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
