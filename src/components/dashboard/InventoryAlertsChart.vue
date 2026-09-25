<template>
  <div class="retro-panel p-5 flex flex-col justify-between h-full">
    <div class="flex items-center justify-between pb-4 border-b-2 border-line">
      <div>
        <h3 class="text-base font-bold text-ink font-['Outfit'] tracking-wide flex items-center gap-2">
          <span>Alertas de Inventario</span>
          <span
            v-if="alerts && alerts.length > 0"
            class="px-2 py-0.5 text-[11px] font-black bg-crimson text-white rounded-full border border-[#2d3748] shadow-2xs"
          >
            {{ alerts.length }}
          </span>
        </h3>
        <p class="text-xs text-muted font-medium">Productos en o bajo su nivel mínimo de stock</p>
      </div>
      <button
        class="text-xs font-bold text-emerald hover:underline font-['Outfit'] cursor-pointer"
        @click="$emit('navigate', 'products')"
      >
        Ir a Catálogo &rarr;
      </button>
    </div>

    <div class="mt-4 flex-1 min-h-[300px]">
      <EChart
        :option="chartOption"
        :loading="loading"
        :empty="!alerts || alerts.length === 0"
        empty-text="Todos los productos tienen niveles de stock saludables ✨"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EChartsOption } from 'echarts';
import EChart from '../charts/EChart.vue';
import type { InventoryAlertEntry } from '../../types';
import { useRetroChartTheme } from '../../composables/useChart';

const props = defineProps<{
  alerts: InventoryAlertEntry[];
  loading?: boolean;
}>();

defineEmits<{
  (e: 'navigate', tab: string): void;
}>();

const { baseTooltip, baseGrid } = useRetroChartTheme();

const chartOption = computed<EChartsOption>(() => {
  const sorted = [...(props.alerts || [])].slice(0, 10).reverse();
  const names = sorted.map((a) => a.productName);
  const currentStocks = sorted.map((a) => a.currentStock);
  const minStocks = sorted.map((a) => a.minimumStock);

  return {
    tooltip: {
      ...baseTooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!params || !params[0]) return '';
        const idx = params[0].dataIndex;
        const item = sorted[idx];
        const statusText =
          item.currentStock <= 0
            ? '<span class="text-crimson font-black">AGOTADO</span>'
            : item.currentStock <= item.minimumStock
            ? '<span class="text-crimson font-black">STOCK CRÍTICO</span>'
            : '<span class="text-golden-title font-black">STOCK BAJO</span>';

        return `
          <div class="p-1">
            <div class="font-bold text-xs text-[#2d3748] mb-1">${item.productName}</div>
            <div class="text-xs text-[#4a5568]">Estado: ${statusText}</div>
            <div class="text-xs text-[#4a5568]">Stock actual: <span class="font-bold text-[#2d3748]">${item.currentStock} ${item.unit}</span></div>
            <div class="text-xs text-[#4a5568]">Stock mínimo: <span class="font-bold text-[#c0392b]">${item.minimumStock} ${item.unit}</span></div>
          </div>
        `;
      }
    },
    grid: {
      ...baseGrid,
      left: '26%',
      right: '12%',
      top: '8%',
      bottom: '12%'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      icon: 'roundRect',
      textStyle: {
        fontFamily: 'Outfit, sans-serif',
        fontSize: 11,
        color: '#2d3748',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0e6d6', type: 'dashed' } },
      axisLabel: {
        color: '#718096',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: '#2d3748', width: 2 } },
      axisTick: { show: false },
      axisLabel: {
        color: '#2d3748',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 11,
        fontWeight: 'bold',
        formatter: (val: string) => {
          return val.length > 15 ? `${val.substring(0, 14)}...` : val;
        }
      }
    },
    series: [
      {
        name: 'Stock Actual',
        type: 'bar',
        data: currentStocks,
        itemStyle: {
          color: (param: any) => {
            const idx = param.dataIndex;
            const item = sorted[idx];
            if (item.currentStock <= 0) return '#742a2a';
            if (item.currentStock <= item.minimumStock) return '#c0392b';
            return '#d4a017';
          },
          borderRadius: [0, 4, 4, 0],
          borderColor: '#2d3748',
          borderWidth: 1.5
        },
        label: {
          show: true,
          position: 'right',
          fontFamily: 'Outfit, sans-serif',
          fontSize: 10,
          fontWeight: 'bold',
          color: '#2d3748',
          formatter: (p: any) => `${p.value}`
        }
      },
      {
        name: 'Mínimo Requerido',
        type: 'bar',
        data: minStocks,
        itemStyle: {
          color: 'rgba(45, 55, 72, 0.25)',
          borderRadius: [0, 4, 4, 0],
          borderColor: '#2d3748',
          borderWidth: 1.5
        }
      }
    ]
  };
});
</script>
