<template>
  <div class="space-y-6">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
      <div>
        <h2 class="text-3xl font-black text-golden-title tracking-wide uppercase">
          Gestión y Registro de Ventas
        </h2>
        <p class="text-cream/80 font-bold">
          Historial de tickets y transacciones de punto de venta (POS) registradas en tiempo real desde la app móvil.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="loadSales(true)"
          :disabled="isLoading"
          class="retro-btn-yellow flex items-center justify-center gap-2 py-2 px-4 text-sm font-black border-2 shadow-retro-sm"
          title="Recargar ventas del servidor"
        >
          <span :class="{ 'animate-spin': isLoading }">↻</span>
          <span>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Toast Notification Banner -->
    <transition name="fade">
      <div
        v-if="toastMessage"
        class="border-4 border-black rounded-xl p-4 font-black text-sm flex items-center justify-between shadow-retro"
        :class="toastType === 'success' ? 'bg-emerald text-cream' : 'bg-crimson text-cream'"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ toastType === 'success' ? '✅' : '⚠️' }}</span>
          <span>{{ toastMessage }}</span>
        </div>
        <button
          @click="toastMessage = ''"
          class="bg-black/20 hover:bg-black/40 text-cream rounded-md px-2 py-0.5 text-xs font-black uppercase"
        >
          ✕
        </button>
      </div>
    </transition>

    <!-- KPI Metrics Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Total Tickets -->
      <div class="retro-panel-yellow p-4 flex flex-col justify-between">
        <span class="text-xs font-black uppercase text-crimson/70 tracking-wider">Tickets / Transacciones</span>
        <div class="text-3xl font-black text-crimson mt-1">{{ summary.totalCount }}</div>
        <span class="text-xs font-bold text-black/60 mt-1">Ventas en el filtro actual</span>
      </div>

      <!-- Total Revenue -->
      <div class="retro-panel-cream p-4 flex flex-col justify-between">
        <span class="text-xs font-black uppercase text-crimson/70 tracking-wider">Ingresos Totales</span>
        <div class="text-3xl font-black text-crimson mt-1">{{ formatCOP(summary.totalAmount) }}</div>
        <span class="text-xs font-bold text-black/60 mt-1">Facturado en el periodo</span>
      </div>

      <!-- Average Ticket -->
      <div class="retro-panel-guayaba p-4 flex flex-col justify-between">
        <span class="text-xs font-black uppercase text-crimson/70 tracking-wider">Ticket Promedio</span>
        <div class="text-3xl font-black text-crimson mt-1">{{ formatCOP(averageTicket) }}</div>
        <span class="text-xs font-bold text-crimson/80 mt-1">Promedio por cliente</span>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="retro-panel-crimson space-y-3">
      <!-- Quick Date Presets -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b-2 border-goldenrod/30">
        <span class="text-xs font-black uppercase text-goldenrod tracking-wider mr-1">Filtros rápidos:</span>
        <button
          v-for="preset in datePresets"
          :key="preset.id"
          @click="applyDatePreset(preset.id)"
          class="px-2.5 py-1 text-xs font-black rounded-lg border-2 border-black transition-transform active:scale-95"
          :class="activePreset === preset.id ? 'bg-golden-title text-crimson shadow-retro-xs' : 'bg-cream/90 text-crimson hover:bg-cream'"
        >
          {{ preset.label }}
        </button>
      </div>

      <!-- Filter Controls Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div>
          <label for="filter-sale-from-date" class="block text-goldenrod font-extrabold text-sm mb-1">
            Desde
          </label>
          <input
            id="filter-sale-from-date"
            v-model="filterFromDate"
            type="date"
            @change="activePreset = 'custom'"
            class="retro-input !bg-cream/90 text-sm"
          />
        </div>

        <div>
          <label for="filter-sale-to-date" class="block text-goldenrod font-extrabold text-sm mb-1">
            Hasta
          </label>
          <input
            id="filter-sale-to-date"
            v-model="filterToDate"
            type="date"
            @change="activePreset = 'custom'"
            class="retro-input !bg-cream/90 text-sm"
          />
        </div>

        <div>
          <label for="filter-payment-method" class="block text-goldenrod font-extrabold text-sm mb-1">
            Método de Pago
          </label>
          <select
            id="filter-payment-method"
            v-model="filterPaymentMethod"
            class="retro-input !bg-cream/90 text-sm"
          >
            <option value="">Todos los Métodos</option>
            <option value="Cash">Efectivo (Cash)</option>
            <option value="Card">Tarjeta (Card)</option>
            <option value="Transfer">Transferencia</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            @click="applyFilters"
            class="retro-btn-yellow py-2 px-4 text-sm font-black border-2 shadow-retro-sm flex-grow"
          >
            Filtrar
          </button>
          <button
            @click="resetFilters"
            class="retro-btn-emerald py-2 px-3 text-sm font-black border-2 shadow-retro-sm"
            title="Limpiar filtros"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Sales Table / List -->
    <div v-if="!isLoading && sales.length > 0" class="retro-panel-cream overflow-hidden space-y-4">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b-4 border-black bg-cream/60 text-xs font-black uppercase text-crimson tracking-wider">
              <th class="py-3 px-4">Ticket / ID</th>
              <th class="py-3 px-4">Fecha y Hora</th>
              <th class="py-3 px-4">Cajero / Vendedor</th>
              <th class="py-3 px-4 text-center">Método de Pago</th>
              <th class="py-3 px-4 text-center">Ítems</th>
              <th class="py-3 px-4 text-right">Total Venta</th>
              <th class="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y-2 divide-black/10 font-bold text-sm text-black">
            <tr v-for="sale in sales" :key="sale.id" class="hover:bg-cream/40 transition-colors">
              <td class="py-3.5 px-4 font-black">
                <span class="bg-crimson text-cream border-2 border-black rounded-md px-2 py-0.5 text-xs mr-2 shadow-retro-xs">
                  #{{ sale.id }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-black/80 font-semibold whitespace-nowrap">
                {{ formatDateTime(sale.saleDate) }}
              </td>
              <td class="py-3.5 px-4">
                <div class="font-extrabold text-crimson">
                  {{ sale.userName || 'Usuario #' + sale.userId }}
                </div>
              </td>
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <span
                  class="border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black uppercase shadow-retro-xs"
                  :class="getPaymentMethodBadgeClass(sale.paymentMethod)"
                >
                  {{ formatPaymentMethod(sale.paymentMethod) }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <span class="bg-goldenrod/30 text-black border border-black/30 rounded-md px-2 py-0.5 text-xs font-extrabold">
                  {{ sale.itemsCount || 1 }} {{ (sale.itemsCount || 1) === 1 ? 'ítem' : 'ítems' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right font-black text-crimson text-base whitespace-nowrap">
                {{ formatCOP(sale.totalAmount) }}
              </td>
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <button
                  @click="viewSaleDetails(sale.id)"
                  class="retro-btn-emerald py-1 px-3 text-xs font-black uppercase border shadow-retro-sm"
                  title="Ver recibo y detalle de la venta"
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t-2 border-black/10 px-2">
        <!-- Records Counter & Page Size Selector -->
        <div class="flex items-center gap-3 text-xs font-bold text-black/80">
          <span>
            Mostrando {{ startRecord }} a {{ endRecord }} de {{ pagination.totalItems }} ventas
          </span>
          <span class="text-black/30">•</span>
          <div class="flex items-center gap-1.5">
            <label for="select-page-size" class="text-xs font-bold text-black/70">Mostrar:</label>
            <select
              id="select-page-size"
              v-model="pageSize"
              @change="changePageSize"
              class="border-2 border-black rounded-md px-2 py-0.5 text-xs bg-cream font-black shadow-retro-xs"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>

        <!-- Page Navigation Buttons -->
        <div class="flex items-center gap-1">
          <!-- Previous Button -->
          <button
            @click="goToPage(pagination.page - 1)"
            :disabled="pagination.page <= 1 || isLoading"
            class="retro-btn-yellow py-1 px-3 text-xs font-black border-2 shadow-retro-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            « Anterior
          </button>

          <!-- Numeric Page Indicator -->
          <div class="flex items-center gap-1 px-2">
            <span class="text-xs font-black text-crimson">
              Página {{ pagination.page }} de {{ pagination.totalPages || 1 }}
            </span>
          </div>

          <!-- Next Button -->
          <button
            @click="goToPage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages || isLoading"
            class="retro-btn-yellow py-1 px-3 text-xs font-black border-2 shadow-retro-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente »
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="retro-panel-yellow text-center py-12 flex flex-col items-center justify-center gap-4">
      <div class="relative w-16 h-16">
        <div class="w-16 h-16 rounded-full border-8 border-crimson/20 border-t-8 border-t-crimson animate-spin"></div>
        <div class="absolute inset-0 m-auto w-4 h-4 bg-golden-title rounded-full border-2 border-black"></div>
      </div>
      <p class="text-2xl font-black text-crimson uppercase tracking-wider animate-pulse">Cargando ventas...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && sales.length === 0" class="retro-panel-yellow text-center py-12">
      <p class="text-2xl font-black text-crimson uppercase mb-2">No se encontraron ventas registradas</p>
      <p class="font-bold text-crimson/80 mb-4">
        {{ filterFromDate || filterToDate || filterPaymentMethod ? 'Prueba ajustando los filtros de fecha o método de pago.' : 'Las ventas registradas desde la aplicación móvil de caja aparecerán aquí automáticamente.' }}
      </p>
      <button
        v-if="filterFromDate || filterToDate || filterPaymentMethod"
        @click="resetFilters"
        class="retro-btn-crimson py-2 px-4 text-sm font-black uppercase shadow-retro-sm"
      >
        Limpiar Filtros
      </button>
    </div>

    <!-- Modal: View Sale Details (Receipt Style) -->
    <transition name="fade">
      <div
        v-if="selectedSale"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
        @click.self="selectedSale = null"
      >
        <div class="retro-panel-cream max-w-2xl w-full p-6 shadow-retro-lg border-4 border-black max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex justify-between items-start border-b-4 border-black pb-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="bg-crimson text-cream border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black uppercase shadow-retro-xs">
                  Ticket #{{ selectedSale.id }}
                </span>
                <span
                  class="border-2 border-black rounded-lg px-2 py-0.5 text-xs font-black uppercase shadow-retro-xs"
                  :class="getPaymentMethodBadgeClass(selectedSale.paymentMethod)"
                >
                  {{ formatPaymentMethod(selectedSale.paymentMethod) }}
                </span>
              </div>
              <h3 class="text-2xl font-black text-crimson uppercase mt-2">
                Detalle del Ticket de Venta
              </h3>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-black/70 mt-1">
                <span>Fecha: {{ formatDateTime(selectedSale.saleDate) }}</span>
                <span>•</span>
                <span>Cajero: {{ selectedSale.userName || 'Usuario #' + selectedSale.userId }}</span>
              </div>
            </div>
            <button
              @click="selectedSale = null"
              class="retro-btn-crimson py-1 px-3 border-2 text-xs font-black uppercase shadow-retro-sm"
            >
              ✕ Cerrar
            </button>
          </div>

          <!-- Items Table -->
          <div class="border-2 border-black rounded-xl overflow-hidden mb-4 bg-white/70 shadow-retro-xs">
            <table class="w-full text-left text-xs font-bold">
              <thead>
                <tr class="border-b-2 border-black bg-cream text-crimson uppercase font-black">
                  <th class="py-2.5 px-3">Producto</th>
                  <th class="py-2.5 px-3 text-center">Cant.</th>
                  <th class="py-2.5 px-3 text-right">Precio Unit.</th>
                  <th class="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y border-black/10">
                <tr v-for="item in selectedSale.details || []" :key="item.id" class="hover:bg-cream/30">
                  <td class="py-2.5 px-3 font-extrabold text-black">
                    {{ item.productName || 'Producto #' + item.productId }}
                  </td>
                  <td class="py-2.5 px-3 text-center font-black">
                    {{ item.quantity }}
                  </td>
                  <td class="py-2.5 px-3 text-right text-black/80 font-bold whitespace-nowrap">
                    {{ formatCOP(item.historicalUnitPrice) }}
                  </td>
                  <td class="py-2.5 px-3 text-right font-black text-crimson whitespace-nowrap">
                    {{ formatCOP(item.subtotal) }}
                  </td>
                </tr>
                <tr v-if="!selectedSale.details || selectedSale.details.length === 0">
                  <td colspan="4" class="py-4 text-center text-black/60 italic font-bold">
                    No se registraron líneas de detalle para este ticket.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Grand Total Box -->
          <div class="bg-golden-title/20 border-3 border-black rounded-xl p-4 flex justify-between items-center mb-6 shadow-retro-xs">
            <div>
              <span class="text-xs font-black uppercase text-crimson tracking-wider">Total Facturado</span>
              <p class="text-xs font-bold text-black/60">Moneda legal: Pesos Colombianos (COP)</p>
            </div>
            <div class="text-3xl font-black text-crimson">
              {{ formatCOP(selectedSale.totalAmount) }}
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex justify-end gap-3">
            <button
              @click="printReceipt"
              class="retro-btn-yellow py-2 px-4 border-2 text-xs font-black uppercase shadow-retro-sm flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Imprimir Ticket</span>
            </button>
            <button
              @click="selectedSale = null"
              class="retro-btn-crimson py-2 px-5 border-2 text-xs font-black uppercase shadow-retro-sm"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Sale, SalePagination, SaleSummaryStats } from '../types';
import { saleService } from '../services/saleService';

// State variables
const sales = ref<Sale[]>([]);
const pagination = ref<SalePagination>({
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1
});
const summary = ref<SaleSummaryStats>({
  totalAmount: 0,
  totalCount: 0
});

const isLoading = ref<boolean>(false);
const toastMessage = ref<string>('');
const toastType = ref<'success' | 'error'>('success');
const selectedSale = ref<Sale | null>(null);

// Filters State
const filterFromDate = ref<string>('');
const filterToDate = ref<string>('');
const filterPaymentMethod = ref<string>('');
const pageSize = ref<number>(10);
const activePreset = ref<'all' | 'today' | 'week' | 'month' | 'custom'>('all');

// Date presets definitions
const datePresets = [
  { id: 'all', label: 'Todo' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Últimos 7 días' },
  { id: 'month', label: 'Este Mes' }
] as const;

// Computed Properties
const averageTicket = computed(() => {
  if (!summary.value.totalCount || summary.value.totalCount === 0) return 0;
  return summary.value.totalAmount / summary.value.totalCount;
});

const startRecord = computed(() => {
  if (pagination.value.totalItems === 0) return 0;
  return (pagination.value.page - 1) * pagination.value.pageSize + 1;
});

const endRecord = computed(() => {
  const calculatedEnd = pagination.value.page * pagination.value.pageSize;
  return Math.min(calculatedEnd, pagination.value.totalItems);
});

// Formatters
const formatCOP = (val: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPaymentMethod = (method: string): string => {
  if (!method) return 'Efectivo';
  const lower = method.toLowerCase();
  if (lower === 'cash' || lower === 'efectivo') return '💵 Efectivo';
  if (lower === 'card' || lower === 'tarjeta') return '💳 Tarjeta';
  if (lower === 'transfer' || lower === 'transferencia') return '📱 Transferencia';
  return method;
};

const getPaymentMethodBadgeClass = (method: string): string => {
  if (!method) return 'bg-emerald text-cream';
  const lower = method.toLowerCase();
  if (lower === 'cash' || lower === 'efectivo') return 'bg-emerald text-cream';
  if (lower === 'card' || lower === 'tarjeta') return 'bg-turquoise text-black';
  return 'bg-goldenrod text-black';
};

// Data Loading
const loadSales = async (isManualRefresh = false) => {
  isLoading.value = true;
  try {
    const res = await saleService.getSales({
      page: pagination.value.page,
      pageSize: pageSize.value,
      fromDate: filterFromDate.value || undefined,
      toDate: filterToDate.value || undefined,
      paymentMethod: filterPaymentMethod.value || undefined
    });

    sales.value = res.data || [];
    pagination.value = res.pagination || {
      page: 1,
      pageSize: pageSize.value,
      totalItems: 0,
      totalPages: 1
    };
    summary.value = res.summary || {
      totalAmount: 0,
      totalCount: 0
    };

    if (isManualRefresh) {
      showToast('Lista de ventas actualizada con éxito', 'success');
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al cargar las ventas';
    showToast(msg, 'error');
  } finally {
    isLoading.value = false;
  }
};

// Detail modal
const viewSaleDetails = async (id: number) => {
  try {
    const sale = await saleService.getSaleById(id);
    selectedSale.value = sale;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener los detalles del ticket';
    showToast(msg, 'error');
  }
};

// Print ticket handler
const printReceipt = () => {
  window.print();
};

// Filter actions
const applyFilters = () => {
  pagination.value.page = 1;
  loadSales();
};

const resetFilters = () => {
  filterFromDate.value = '';
  filterToDate.value = '';
  filterPaymentMethod.value = '';
  activePreset.value = 'all';
  pagination.value.page = 1;
  loadSales();
};

const applyDatePreset = (preset: 'all' | 'today' | 'week' | 'month') => {
  activePreset.value = preset;
  const now = new Date();

  if (preset === 'all') {
    filterFromDate.value = '';
    filterToDate.value = '';
  } else if (preset === 'today') {
    const todayStr = now.toISOString().split('T')[0];
    filterFromDate.value = todayStr;
    filterToDate.value = todayStr;
  } else if (preset === 'week') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    filterFromDate.value = sevenDaysAgo.toISOString().split('T')[0];
    filterToDate.value = now.toISOString().split('T')[0];
  } else if (preset === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    filterFromDate.value = firstDay.toISOString().split('T')[0];
    filterToDate.value = now.toISOString().split('T')[0];
  }

  applyFilters();
};

// Pagination actions
const goToPage = (pageNumber: number) => {
  if (pageNumber >= 1 && pageNumber <= pagination.value.totalPages) {
    pagination.value.page = pageNumber;
    loadSales();
  }
};

const changePageSize = () => {
  pagination.value.page = 1;
  loadSales();
};

// Toast helper
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  setTimeout(() => {
    if (toastMessage.value === message) {
      toastMessage.value = '';
    }
  }, 4000);
};

// Initialize
onMounted(() => {
  loadSales();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
