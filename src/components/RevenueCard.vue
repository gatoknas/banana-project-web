<template>
  <div class="retro-panel-crimson col-span-full flex flex-col justify-between min-h-[340px] relative transition-all duration-300">
    <!-- Top Header & Period Selector -->
    <div>
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-black/30 pb-3">
        <div class="flex items-center justify-between sm:justify-start gap-4">
          <div>
            <span class="text-xs tracking-wider font-black text-goldenrod uppercase">Recaudación • Recibos Electrónicos</span>
            <h3 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-cream mt-0.5 flex items-center gap-3">
              <span>Ingresos Totales</span>
            </h3>
          </div>

          <!-- Quick Sync Button in Header -->
          <button
            @click="syncReceipts"
            :disabled="syncing || loading"
            class="retro-btn-yellow py-1.5 px-3 text-xs flex items-center gap-1.5 border-2 shadow-none hover:shadow-retro-sm shrink-0"
            title="Sincronizar recibos bancarios desde Google Drive / Sheets"
          >
            <span :class="{ 'animate-spin': syncing }">🔄</span>
            <span class="hidden sm:inline">{{ syncing ? 'Sincronizando...' : 'Sincronizar Drive' }}</span>
            <span class="sm:hidden">{{ syncing ? '...' : 'Sync' }}</span>
          </button>
        </div>

        <!-- Period Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-2xl border-2 border-black/60 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            v-for="period in periodOptions"
            :key="period.value"
            @click="selectPeriod(period.value)"
            :class="[
              'px-2.5 py-1.5 text-xs font-black rounded-xl transition-all duration-150 whitespace-nowrap',
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

      <!-- Main Content Grid: Figures (Left) + Pie Chart (Right) -->
      <div class="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <!-- LEFT COLUMN: KPIs & Actions (5 cols) -->
        <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <span class="text-[11px] font-black text-goldenrod/90 uppercase tracking-wider block">
              Monto Facturado (email_receipts)
            </span>

            <!-- Main Revenue Figure & Growth Badge -->
            <div class="mt-1 flex flex-wrap items-baseline gap-3">
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
          </div>

          <!-- Secondary KPIs -->
          <div v-if="!loading && summary" class="grid grid-cols-2 gap-3 text-xs text-cream/90 font-bold">
            <div class="flex items-center gap-2 bg-black/25 p-2.5 rounded-xl border border-black/30">
              <span class="text-xl">🧾</span>
              <div>
                <div class="text-[10px] text-cream/70 uppercase">Recibos Válidos</div>
                <div class="text-base font-extrabold text-goldenrod">{{ summary.transactionCount }}</div>
              </div>
            </div>

            <div class="flex items-center gap-2 bg-black/25 p-2.5 rounded-xl border border-black/30">
              <span class="text-xl">🏷️</span>
              <div>
                <div class="text-[10px] text-cream/70 uppercase">Ticket Promedio</div>
                <div class="text-sm font-extrabold text-cream">{{ formatCOP(summary.averageTicket) }}</div>
              </div>
            </div>
          </div>

          <!-- Actions: Drill Down Button -->
          <div class="pt-2 flex flex-wrap items-center gap-3">
            <button
              @click="openDetailsModal"
              class="text-xs font-black text-goldenrod hover:text-cream flex items-center gap-1.5 transition-colors duration-150 underline decoration-goldenrod decoration-2 underline-offset-4"
              :disabled="loading"
            >
              <span>🔍 Ver Desglose de Recibos Bancarios</span>
            </button>
          </div>
        </div>

        <!-- RIGHT COLUMN: Apache ECharts Pie/Donut Chart (7 cols) -->
        <div class="lg:col-span-7 bg-black/30 rounded-2xl border-2 border-black/50 p-3 flex flex-col justify-between min-h-[290px]">
          <!-- Chart Header Subtitle -->
          <div class="flex items-center justify-between px-2 pt-1 border-b border-black/30 pb-2">
            <div class="flex items-center gap-2">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-goldenrod animate-pulse"></span>
              <span class="text-xs font-bold text-cream/90 uppercase tracking-wide">
                {{ chartSectionTitle }}
              </span>
            </div>
            <span class="text-[11px] font-bold text-goldenrod">
              {{ chartData.length }} segmento{{ chartData.length !== 1 ? 's' : '' }} con ingreso
            </span>
          </div>

          <!-- EChart Container -->
          <div class="w-full h-[240px] mt-1 relative">
            <EChart
              :option="chartOption"
              :loading="loading"
              :empty="chartData.length === 0"
              empty-text="Sin ingresos registrados en este período"
              dark
            />
          </div>
        </div>
      </div>
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
      role="dialog"
      aria-modal="true"
      aria-label="Desglose de recibos bancarios"
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
            class="bg-cream/80 border-2 border-black rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-retro-sm hover:translate-x-0.5 transition-all"
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
import { ref, computed, onMounted, watch } from 'vue';
import type { EChartsOption } from 'echarts';
import type { EChartsCallbackDataParams } from './dashboard/echarts-types';
import type { RevenueSummary, RevenuePeriod, EmailReceipt } from '../types';
import { emailReceiptsApi } from '../services/api';
import { formatCOP, RETRO_PALETTE } from '../composables/useChart';
import EChart from './charts/EChart.vue';

const activePeriod = ref<RevenuePeriod>('today');
const summary = ref<RevenueSummary | null>(null);
const loading = ref(false);
const syncing = ref(false);
const syncMessage = ref<string | null>(null);

const showDetailModal = ref(false);
const receipts = ref<EmailReceipt[]>([]);
const loadingReceipts = ref(false);

const periodOptions: { label: string; value: RevenuePeriod }[] = [
  { label: 'Hoy (6am-7pm)', value: 'today' },
  { label: '7 Días', value: '7d' },
  { label: 'Mes', value: 'month' },
  { label: '3 Meses', value: '3m' },
  { label: '6 Meses', value: '6m' },
  { label: 'Año', value: 'year' }
];

const activePeriodLabel = computed(() => {
  const found = periodOptions.find(p => p.value === activePeriod.value);
  return found ? found.label : activePeriod.value;
});

const chartSectionTitle = computed(() => {
  switch (activePeriod.value) {
    case 'today':
      return 'Distribución por Horas (6:00 AM - 7:00 PM)';
    case '7d':
      return 'Distribución de los Últimos 7 Días';
    case 'month':
      return 'Distribución Diaria del Mes';
    case '3m':
      return 'Distribución Trimestral (por Meses)';
    case '6m':
      return 'Distribución Semestral (por Meses)';
    case 'year':
      return 'Distribución Anual (por Meses)';
    default:
      return 'Distribución de Ingresos';
  }
});

// Helper to format ISO date to YYYY-MM-DD
function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate Date Range and aggregation interval based on active period
function getDateRangeAndInterval(period: RevenuePeriod): { from: string; to: string; interval: string } {
  const now = new Date();
  const toStr = toDateStr(now);

  if (period === 'today') {
    return { from: toStr, to: toStr, interval: 'hour' };
  }

  if (period === '7d') {
    const fromDate = new Date(now);
    fromDate.setDate(now.getDate() - 7);
    return { from: toDateStr(fromDate), to: toStr, interval: 'day' };
  }

  if (period === 'month' || period === '30d') {
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toDateStr(fromDate), to: toStr, interval: 'day' };
  }

  if (period === '3m') {
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { from: toDateStr(fromDate), to: toStr, interval: 'month' };
  }

  if (period === '6m') {
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return { from: toDateStr(fromDate), to: toStr, interval: 'month' };
  }

  if (period === 'year') {
    const fromDate = new Date(now.getFullYear(), 0, 1);
    return { from: toDateStr(fromDate), to: toStr, interval: 'month' };
  }

  return { from: toStr, to: toStr, interval: 'day' };
}

function formatTimelineDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

function formatTimelineMonth(monthStr: string): string {
  try {
    const parts = monthStr.split('-');
    if (parts.length >= 2) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      return d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return monthStr;
}

// Fetch revenue summary
async function fetchSummary() {
  loading.value = true;
  try {
    const { from, to, interval } = getDateRangeAndInterval(activePeriod.value);
    const data = await emailReceiptsApi.getRevenueSummary(from, to, interval);
    summary.value = data;
  } catch (err) {
    summary.value = null;
  } finally {
    loading.value = false;
  }
}

// Normalized chart data for Pie/Donut
const chartData = computed(() => {
  if (!summary.value || !summary.value.timeline || summary.value.timeline.length === 0) {
    return [];
  }

  const hasRevenue = summary.value.timeline.some(t => t.amount > 0);
  if (!hasRevenue) {
    return [];
  }

  return summary.value.timeline
    .filter(t => t.amount > 0)
    .map((item, idx) => {
      let displayName = item.date;
      if (activePeriod.value === 'today') {
        const hourNum = parseInt(item.date.split(':')[0], 10);
        const nextHour = String(hourNum + 1).padStart(2, '0');
        displayName = `${item.date} - ${nextHour}:00`;
      } else if (activePeriod.value === '7d' || activePeriod.value === 'month' || activePeriod.value === '30d') {
        displayName = formatTimelineDate(item.date);
      } else {
        displayName = formatTimelineMonth(item.date);
      }

      return {
        name: displayName,
        value: item.amount,
        count: item.count,
        rawDate: item.date,
        itemStyle: {
          color: RETRO_PALETTE[idx % RETRO_PALETTE.length],
          borderColor: '#000000',
          borderWidth: 2
        }
      };
    });
});

// ECharts Pie / Donut Option
const chartOption = computed<EChartsOption>(() => {
  const data = chartData.value;
  const total = summary.value?.totalRevenue ?? 0;

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1b1b1b',
      borderColor: '#d4a017',
      borderWidth: 2,
      textStyle: {
        color: '#fffcf6',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 12,
        fontWeight: 'bold'
      },
      extraCssText: 'box-shadow: 4px 4px 0px 0px #000000; border-radius: 12px; padding: 10px;',
      formatter: (param: EChartsCallbackDataParams) => {
        const item = param.data;
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
        return `
          <div style="font-family: Outfit, sans-serif;">
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 13px; color: #fffcf6;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${param.color}; border: 1px solid #000;"></span>
              ${param.name}
            </div>
            <div style="color: #68d391; font-weight: 900; font-size: 15px; margin-top: 4px;">
              ${formatCOP(item.value)}
            </div>
            <div style="color: #cbd5e0; font-size: 11px; margin-top: 2px;">
              🧾 ${item.count} recibo${item.count !== 1 ? 's' : ''} • ${pct}% del total
            </div>
          </div>
        `;
      }
    },
    legend: {
      orient: 'vertical',
      right: '2%',
      top: 'middle',
      type: 'scroll',
      textStyle: {
        color: '#fffcf6',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 11,
        fontWeight: 'bold'
      },
      pageTextStyle: {
        color: '#fffcf6'
      },
      pageIconColor: '#d4a017',
      pageIconInactiveColor: '#718096',
      icon: 'circle'
    },
    series: [
      {
        name: 'Ingresos',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['36%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#000000',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#fffcf6',
            formatter: '{b}\n{d}%'
          }
        },
        data
      }
    ]
  };
});

// Change active period
function selectPeriod(period: RevenuePeriod) {
  if (activePeriod.value === period) return;
  activePeriod.value = period;
  fetchSummary();
}

// Sync receipts action from Google Drive
async function syncReceipts() {
  syncing.value = true;
  try {
    const { from, to } = getDateRangeAndInterval(activePeriod.value);
    const res = await emailReceiptsApi.syncEmailReceipts(from, to);
    const imported = res.result?.imported ?? 0;
    syncMessage.value = `¡Sincronizado! ${imported} nuevos recibos.`;
    setTimeout(() => {
      syncMessage.value = null;
    }, 4000);
    await fetchSummary();
  } catch (err) {
    syncMessage.value = 'Error al sincronizar buzón.';
    setTimeout(() => {
      syncMessage.value = null;
    }, 4000);
  } finally {
    syncing.value = false;
  }
}

// Open Drill-Down Modal
async function openDetailsModal() {
  showDetailModal.value = true;
  loadingReceipts.value = true;
  try {
    const { from, to } = getDateRangeAndInterval(activePeriod.value);
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

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') showDetailModal.value = false;
}

watch(showDetailModal, (open) => {
  if (open) {
    window.addEventListener('keydown', onKeydown);
  } else {
    window.removeEventListener('keydown', onKeydown);
  }
});

onMounted(() => {
  fetchSummary();
});
</script>
