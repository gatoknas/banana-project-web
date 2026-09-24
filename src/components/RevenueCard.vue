<template>
  <div class="retro-panel-crimson col-span-full flex flex-col justify-between min-h-[280px] relative transition-all duration-300">
    <!-- Top Header & Period Selector -->
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black/30 pb-3">
        <div>
          <span class="text-xs tracking-wider font-black text-goldenrod uppercase">Ingresos Totales</span>
          <h3 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-cream mt-0.5">
            TOTAL REVENUE
          </h3>
        </div>

        <!-- Period Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 bg-black/40 p-1 rounded-2xl border-2 border-black/60 shrink-0 self-start sm:self-auto">
          <button
            v-for="period in periodOptions"
            :key="period.value"
            @click="selectPeriod(period.value)"
            :class="[
              'px-3 py-1.5 text-xs font-black rounded-xl transition-all duration-150',
              activePeriod === period.value
                ? 'bg-golden-title text-crimson shadow-retro-sm border-2 border-black scale-105'
                : 'text-cream/80 hover:text-cream hover:bg-white/10'
            ]"
            :disabled="loading"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <!-- Main Revenue Figure & Secondary KPIs -->
      <div class="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Figure and Growth Badge -->
        <div class="flex flex-wrap items-baseline gap-3">
          <div v-if="loading" class="h-12 w-48 bg-black/30 rounded-xl animate-pulse"></div>
          <div v-else class="text-4xl sm:text-5xl font-black text-goldenrod tracking-tight drop-shadow">
            {{ formatCOP(summary?.totalRevenue ?? 0) }}
          </div>

          <!-- Growth Badge -->
          <div
            v-if="!loading && summary"
            :class="[
              'px-2.5 py-1 rounded-full text-xs font-black border-2 border-black flex items-center gap-1 shadow-retro-sm',
              summary.growthPercentage > 0
                ? 'bg-emerald text-cream'
                : summary.growthPercentage < 0
                ? 'bg-red-800 text-cream'
                : 'bg-golden-title text-crimson'
            ]"
          >
            <span v-if="summary.growthPercentage > 0">▲ +{{ summary.growthPercentage.toFixed(1) }}%</span>
            <span v-else-if="summary.growthPercentage < 0">▼ {{ summary.growthPercentage.toFixed(1) }}%</span>
            <span v-else>0.0%</span>
            <span class="opacity-80 font-bold text-[10px]">vs anterior</span>
          </div>
        </div>

        <!-- Secondary KPIs (Transaction count & Avg Ticket) -->
        <div v-if="!loading && summary" class="flex flex-wrap items-center gap-3 text-xs text-cream/90 font-bold">
          <div class="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-black/30">
            <span class="text-goldenrod font-black">🧾 Recibos:</span>
            <span class="text-sm font-extrabold text-cream">{{ summary.transactionCount }}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-black/30">
            <span class="text-goldenrod font-black">🏷️ Promedio:</span>
            <span class="text-sm font-extrabold text-cream">{{ formatCOP(summary.averageTicket) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mini SVG Interactive Timeline / Sparkline -->
    <div class="mt-5">
      <div v-if="loading" class="h-20 w-full bg-black/20 rounded-xl animate-pulse"></div>
      
      <div v-else-if="timelineData.length > 0" class="relative">
        <div class="h-20 w-full flex items-end gap-1.5 pt-2 px-2 bg-black/25 rounded-xl border-2 border-black/40 overflow-hidden">
          <div
            v-for="(item, idx) in timelineData"
            :key="item.date"
            class="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
            @mouseenter="hoveredIndex = idx"
            @mouseleave="hoveredIndex = null"
          >
            <!-- Bar -->
            <div
              class="w-full rounded-t-sm transition-all duration-200 border-t border-x border-black/40"
              :class="hoveredIndex === idx ? 'bg-turquoise shadow-retro-sm' : 'bg-golden-title hover:bg-turquoise'"
              :style="{ height: `${Math.max(item.percentage, 8)}%` }"
            ></div>

            <!-- Floating Hover Tooltip -->
            <div
              v-if="hoveredIndex === idx"
              class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-cream px-2.5 py-1.5 rounded-lg text-xs font-black whitespace-nowrap z-20 border border-golden-title shadow-retro-sm pointer-events-none"
            >
              <div class="text-[10px] text-cream/70">{{ item.date }}</div>
              <div class="text-goldenrod text-xs">{{ formatCOP(item.amount) }}</div>
              <div class="text-cream/80 text-[10px]">{{ item.count }} recibo{{ item.count !== 1 ? 's' : '' }}</div>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center text-xs font-bold text-cream/60 mt-1.5 px-2">
          <span>{{ timelineData[0]?.date }}</span>
          <span class="tracking-wide uppercase text-[10px]">Tendencia Diaria de Facturación</span>
          <span>{{ timelineData[timelineData.length - 1]?.date }}</span>
        </div>
      </div>

      <div v-else-if="!loading" class="py-4 text-center text-xs text-cream/60 italic bg-black/20 rounded-xl border border-black/30">
        Sin transacciones registradas en este período.
      </div>
    </div>

    <!-- Actions Footer: Drill Down & Sync -->
    <div class="mt-4 pt-3 border-t-2 border-black/30 flex flex-wrap items-center justify-between gap-3">
      <button
        @click="openDetailsModal"
        class="text-xs font-black text-goldenrod hover:text-cream flex items-center gap-1.5 transition-colors duration-150 underline decoration-goldenrod decoration-2 underline-offset-4"
        :disabled="loading"
      >
        <span>🔍 Ver Desglose de Recibos</span>
      </button>

      <button
        @click="syncReceipts"
        :disabled="syncing || loading"
        class="retro-btn-yellow py-1.5 px-4 text-xs flex items-center gap-1.5 border-2 shadow-none hover:shadow-retro-sm"
        title="Sincronizar recibos bancarios de correo"
      >
        <span :class="{ 'animate-spin': syncing }">🔄</span>
        <span>{{ syncing ? 'Sincronizando...' : 'Sincronizar' }}</span>
      </button>
    </div>

    <!-- Sync Toast Alert -->
    <div
      v-if="syncMessage"
      class="absolute top-2 right-2 bg-emerald text-cream px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shadow-retro-sm animate-bounce z-30"
    >
      {{ syncMessage }}
    </div>

    <!-- Drill-Down Receipts Modal -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="showDetailModal = false"
    >
      <div class="retro-panel-cream max-w-3xl w-full max-h-[85vh] flex flex-col shadow-retro border-6 border-black text-crimson">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b-4 border-black pb-3">
          <div>
            <span class="text-xs font-black uppercase text-crimson/70">Auditoría Financiera</span>
            <h2 class="text-2xl font-black text-crimson uppercase tracking-wide">
              Desglose de Recibos Bancarios
            </h2>
          </div>
          <button
            @click="showDetailModal = false"
            class="w-9 h-9 rounded-full bg-crimson text-cream border-2 border-black font-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-retro-sm"
          >
            ✕
          </button>
        </div>

        <!-- Filter info -->
        <div class="py-2.5 flex items-center justify-between text-xs font-bold text-crimson/80 border-b-2 border-black/20">
          <span>Período seleccionado: <strong class="text-crimson uppercase">{{ activePeriodLabel }}</strong></span>
          <span>Total en rango: <strong class="text-emerald font-black">{{ formatCOP(summary?.totalRevenue ?? 0) }}</strong></span>
        </div>

        <!-- Receipts List -->
        <div class="flex-grow overflow-y-auto py-3 space-y-2.5 retro-scrollbar pr-1">
          <div v-if="loadingReceipts" class="py-12 text-center font-black text-crimson/60 animate-pulse">
            Cargando transacciones bancarias...
          </div>

          <div v-else-if="receipts.length === 0" class="py-12 text-center text-sm font-bold text-crimson/60">
            No se encontraron recibos en el período seleccionado.
          </div>

          <div
            v-else
            v-for="receipt in receipts"
            :key="receipt.id"
            class="bg-cream/80 border-3 border-black rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-retro-sm hover:translate-x-0.5 transition-all"
          >
            <div class="flex items-center gap-3">
              <!-- Bank / Method Icon Badge -->
              <div class="w-10 h-10 rounded-xl bg-emerald text-cream border-2 border-black font-black flex items-center justify-center text-sm shrink-0 shadow-retro-sm">
                {{ (receipt.bank || 'Banco').slice(0, 2).toUpperCase() }}
              </div>
              <div>
                <div class="font-black text-crimson text-sm leading-snug">
                  {{ receipt.payer || 'Pagador no identificado' }}
                </div>
                <div class="text-xs text-crimson/70 font-bold flex flex-wrap items-center gap-2">
                  <span>{{ receipt.paymentMethod || receipt.bank || 'Transferencia' }}</span>
                  <span v-if="receipt.reference" class="text-black/50">• Ref: {{ receipt.reference }}</span>
                  <span v-if="receipt.transactionDate" class="text-emerald font-black">• {{ formatDate(receipt.transactionDate) }}</span>
                </div>
              </div>
            </div>

            <!-- Amount -->
            <div class="text-right shrink-0">
              <div class="text-lg font-black text-emerald">
                {{ formatCOP(receipt.amount || 0) }}
              </div>
              <div class="text-[10px] font-bold text-crimson/60 uppercase">
                {{ receipt.status }}
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="border-t-4 border-black pt-3 flex justify-end">
          <button
            @click="showDetailModal = false"
            class="retro-btn-crimson py-2 px-6 text-xs uppercase"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { RevenueSummary, RevenuePeriod, EmailReceipt, DailyRevenueBucket } from '../types';
import { emailReceiptsApi } from '../services/api';
import { formatCOP } from '../utils/currency';

const activePeriod = ref<RevenuePeriod>('30d');
const summary = ref<RevenueSummary | null>(null);
const loading = ref(false);
const syncing = ref(false);
const syncMessage = ref<string | null>(null);
const hoveredIndex = ref<number | null>(null);

const showDetailModal = ref(false);
const receipts = ref<EmailReceipt[]>([]);
const loadingReceipts = ref(false);

const periodOptions: { label: string; value: RevenuePeriod }[] = [
  { label: 'Hoy', value: 'today' },
  { label: '7 Días', value: '7d' },
  { label: '30 Días', value: '30d' },
  { label: 'Año', value: 'year' }
];

const activePeriodLabel = computed(() => {
  const found = periodOptions.find(p => p.value === activePeriod.value);
  return found ? found.label : activePeriod.value;
});

// Helper to format ISO date to YYYY-MM-DD
function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate Date Range based on active period
function getDateRange(period: RevenuePeriod): { from: string; to: string } {
  const now = new Date();
  const toStr = toDateStr(now);

  if (period === 'today') {
    return { from: toStr, to: toStr };
  }

  if (period === '7d') {
    const fromDate = new Date();
    fromDate.setDate(now.getDate() - 7);
    return { from: toDateStr(fromDate), to: toStr };
  }

  if (period === 'year') {
    const fromDate = new Date(now.getFullYear(), 0, 1);
    return { from: toDateStr(fromDate), to: toStr };
  }

  // default '30d'
  const fromDate = new Date();
  fromDate.setDate(now.getDate() - 30);
  return { from: toDateStr(fromDate), to: toStr };
}

// Fetch revenue summary
async function fetchSummary() {
  loading.value = true;
  try {
    const { from, to } = getDateRange(activePeriod.value);
    const data = await emailReceiptsApi.getRevenueSummary(from, to);
    summary.value = data;
  } catch (err) {
    // Graceful error state handling
    summary.value = null;
  } finally {
    loading.value = false;
  }
}

// Normalized timeline with percentage heights
const timelineData = computed(() => {
  if (!summary.value || !summary.value.timeline || summary.value.timeline.length === 0) {
    return [];
  }
  const maxAmount = Math.max(...summary.value.timeline.map((t: DailyRevenueBucket) => t.amount), 1);
  return summary.value.timeline.map((t: DailyRevenueBucket) => ({
    ...t,
    percentage: Math.round((t.amount / maxAmount) * 100)
  }));
});

// Change active period
function selectPeriod(period: RevenuePeriod) {
  if (activePeriod.value === period) return;
  activePeriod.value = period;
  fetchSummary();
}

// Sync receipts action
async function syncReceipts() {
  syncing.value = true;
  try {
    const { from, to } = getDateRange(activePeriod.value);
    const res = await emailReceiptsApi.syncEmailReceipts(from, to);
    const imported = res.result?.imported ?? 0;
    syncMessage.value = `¡Sincronizado! ${imported} nuevos recibos.`;
    setTimeout(() => {
      syncMessage.value = null;
    }, 3500);
    await fetchSummary();
  } catch (err) {
    syncMessage.value = 'Error al sincronizar buzón.';
    setTimeout(() => {
      syncMessage.value = null;
    }, 3500);
  } finally {
    syncing.value = false;
  }
}

// Open Drill-Down Modal
async function openDetailsModal() {
  showDetailModal.value = true;
  loadingReceipts.value = true;
  try {
    const { from, to } = getDateRange(activePeriod.value);
    const list = await emailReceiptsApi.getEmailReceipts(from, to);
    receipts.value = list;
  } catch (err) {
    receipts.value = [];
  } finally {
    loadingReceipts.value = false;
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

onMounted(() => {
  fetchSummary();
});
</script>
