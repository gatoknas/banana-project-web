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
            @click="activeTab = 'proveedores'"
            :class="activeTab === 'proveedores' ? 'retro-nav-link-active' : 'retro-nav-link'"
          >
            Proveedores
          </button>
          <button
            @click="activeTab = 'compras'"
            :class="activeTab === 'compras' ? 'retro-nav-link-active' : 'retro-nav-link'"
          >
            Compras
          </button>
          <button
            @click="activeTab = 'ventas'"
            :class="activeTab === 'ventas' ? 'retro-nav-link-active' : 'retro-nav-link'"
          >
            Ventas
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
          <!-- Top Title Bar & Global Period Selector -->
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-4 border-black pb-4">
            <div>
              <h1 class="text-3xl md:text-4xl font-black text-golden-title tracking-wide uppercase drop-shadow">
                Panel Ejecutivo
              </h1>
              <p class="text-cream/90 font-bold text-sm">
                Métricas del negocio, evolución de ingresos e inventario en tiempo real
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <!-- Period Selector -->
              <div class="flex items-center space-x-1 bg-black/40 p-1.5 rounded-2xl border-2 border-black/50">
                <button
                  v-for="p in periodButtons"
                  :key="p.value"
                  class="px-3 py-1.5 text-xs font-black rounded-xl transition-all font-['Outfit']"
                  :class="selectedPeriod === p.value ? 'bg-golden-title text-crimson shadow-retro-sm border-2 border-black scale-105' : 'text-cream/80 hover:text-cream'"
                  @click="changePeriod(p.value)"
                >
                  {{ p.label }}
                </button>
              </div>

              <!-- Reload Button -->
              <button
                class="retro-btn-yellow p-2 rounded-xl border-2 font-bold shadow-retro-sm flex items-center justify-center cursor-pointer"
                title="Recargar datos del dashboard"
                :disabled="loading"
                @click="loadDashboardStats"
              >
                <svg
                  class="w-4 h-4 text-crimson"
                  :class="{ 'animate-spin': loading }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Alert if API Fails -->
          <div
            v-if="errorMessage"
            class="p-4 bg-crimson border-4 border-black rounded-2xl shadow-retro flex items-center justify-between text-cream font-bold text-sm"
          >
            <span>{{ errorMessage }}</span>
            <button
              class="retro-btn-yellow text-xs px-3 py-1"
              @click="loadDashboardStats"
            >
              Reintentar
            </button>
          </div>

          <!-- ROW 1: Real-Time Executive KPI Cards -->
          <KPICardsRow
            :kpis="stats?.kpis"
            :loading="loading"
            @navigate="activeTab = $event as any"
          />

          <!-- ROW 2: Revenue Trend (2/3) + Payment Method Distribution (1/3) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <RevenueTrendChart
                v-model="selectedPeriod"
                :timeline="stats?.salesTimeline || []"
                :loading="loading"
              />
            </div>
            <div class="lg:col-span-1">
              <PaymentMethodChart
                :breakdown="stats?.paymentMethodBreakdown || []"
                :loading="loading"
              />
            </div>
          </div>

          <!-- ROW 3: Top Products (1/2) + Sales by Category (1/2) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProductsChart
              :products="stats?.topProducts || []"
              :loading="loading"
            />
            <CategoryDistributionChart
              :categories="stats?.categoryBreakdown || []"
              :loading="loading"
            />
          </div>

          <!-- ROW 4: Purchases vs Sales Trend (2/3) + Inventory Stock Alerts (1/3) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <PurchasesVsSalesChart
                :data="stats?.purchasesVsSales || []"
                :loading="loading"
              />
            </div>
            <div class="lg:col-span-1">
              <InventoryAlertsChart
                :alerts="stats?.inventoryAlerts || []"
                :loading="loading"
                @navigate="activeTab = $event as any"
              />
            </div>
          </div>

          <!-- Hero Bank Revenue Card -->
          <RevenueCard class="col-span-full mt-4" />
        </div>

        <!-- Products View Tab -->
        <div v-else-if="activeTab === 'products'">
          <ProductsView />
        </div>

        <!-- Suppliers View Tab -->
        <div v-else-if="activeTab === 'proveedores'">
          <SuppliersView />
        </div>

        <!-- Purchases View Tab -->
        <div v-else-if="activeTab === 'compras'">
          <PurchasesView />
        </div>

        <!-- Sales View Tab -->
        <div v-else-if="activeTab === 'ventas'">
          <SalesView />
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
import { ref, onMounted, watch } from 'vue';
import type { Session, DashboardStats } from '../types';
import ProductsView from './ProductsView.vue';
import UsersView from './UsersView.vue';
import SuppliersView from './SuppliersView.vue';
import PurchasesView from './PurchasesView.vue';
import SalesView from './SalesView.vue';
import RevenueCard from '../components/RevenueCard.vue';

// New ECharts Dashboard Components
import KPICardsRow from '../components/dashboard/KPICardsRow.vue';
import RevenueTrendChart from '../components/dashboard/RevenueTrendChart.vue';
import PaymentMethodChart from '../components/dashboard/PaymentMethodChart.vue';
import TopProductsChart from '../components/dashboard/TopProductsChart.vue';
import CategoryDistributionChart from '../components/dashboard/CategoryDistributionChart.vue';
import PurchasesVsSalesChart from '../components/dashboard/PurchasesVsSalesChart.vue';
import InventoryAlertsChart from '../components/dashboard/InventoryAlertsChart.vue';

import { dashboardService } from '../services/dashboardService';

defineProps<{
  session: Session;
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const activeTab = ref<'home' | 'products' | 'proveedores' | 'compras' | 'ventas' | 'users'>('home');
const selectedPeriod = ref<string>('30d');
const loading = ref<boolean>(false);
const errorMessage = ref<string>('');
const stats = ref<DashboardStats | null>(null);

const periodButtons = [
  { label: '7 Días', value: '7d' },
  { label: '30 Días', value: '30d' },
  { label: '90 Días', value: '90d' }
];

const computeDateRange = (period: string): { from: string; to: string } => {
  const today = new Date();
  const to = today.toISOString().split('T')[0];

  const fromDate = new Date(today);
  if (period === '7d') {
    fromDate.setDate(today.getDate() - 7);
  } else if (period === '90d') {
    fromDate.setDate(today.getDate() - 90);
  } else {
    // 30d default
    fromDate.setDate(today.getDate() - 30);
  }

  const from = fromDate.toISOString().split('T')[0];
  return { from, to };
};

const loadDashboardStats = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const { from, to } = computeDateRange(selectedPeriod.value);
    stats.value = await dashboardService.getDashboardStats(from, to);
  } catch (err: any) {
    errorMessage.value = err.message || 'Error al cargar las estadísticas del panel.';
  } finally {
    loading.value = false;
  }
};

const changePeriod = (val: string) => {
  if (selectedPeriod.value === val) return;
  selectedPeriod.value = val;
  loadDashboardStats();
};

watch(selectedPeriod, () => {
  loadDashboardStats();
});

onMounted(() => {
  loadDashboardStats();
});

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
