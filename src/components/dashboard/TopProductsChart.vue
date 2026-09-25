<template>
  <div class="retro-panel p-5 flex flex-col justify-between h-full">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-line gap-2">
      <div>
        <h3 class="text-base font-bold text-ink font-['Outfit'] tracking-wide">Top 10 Productos Más Vendidos</h3>
        <p class="text-xs text-muted font-medium">Líderes de rotación e ingresos</p>
      </div>
      <div class="flex items-center space-x-1 bg-[#f5ede0] p-1 rounded-xl border border-line">
        <button
          class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all font-['Outfit']"
          :class="metric === 'quantity' ? 'bg-emerald text-white shadow-xs' : 'text-muted hover:text-ink'"
          @click="metric = 'quantity'"
        >
          Unidades
        </button>
        <button
          class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all font-['Outfit']"
          :class="metric === 'revenue' ? 'bg-emerald text-white shadow-xs' : 'text-muted hover:text-ink'"
          @click="metric = 'revenue'"
        >
          Ingresos
        </button>
      </div>
    </div>

    <div class="mt-4 flex-1 min-h-[300px]">
      <EChart :option="chartOption" :loading="loading" :empty="!products || products.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { EChartsOption } from 'echarts';
import EChart from '../charts/EChart.vue';
import type { TopProductEntry } from '../../types';
import { useRetroChartTheme } from '../../composables/useChart';

const props = defineProps<{
  products: TopProductEntry[];
  loading?: boolean;
}>();

const metric = ref<'quantity' | 'revenue'>('quantity');

const { baseTooltip, baseGrid, formatCOP, formatCompactCOP } = useRetroChartTheme();

const chartOption = computed<EChartsOption>(() => {
  const sorted = [...(props.products || [])].sort((a, b) => {
    return metric.value === 'quantity'
      ? a.totalQuantity - b.totalQuantity
      : a.totalRevenue - b.totalRevenue;
  });

  const names = sorted.map((p) => p.productName);
  const values = sorted.map((p) =>
    metric.value === 'quantity' ? p.totalQuantity : p.totalRevenue
  );

  return {
    tooltip: {
      ...baseTooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!params || !params[0]) return '';
        const idx = params[0].dataIndex;
        const item = sorted[idx];
        return `
          <div class="p-1">
            <div class="font-bold text-xs text-[#2d3748] mb-1">${item.productName}</div>
            <div class="text-xs text-[#4a5568]">Cantidad: <span class="font-bold text-[#1a6b52]">${item.totalQuantity} und</span></div>
            <div class="text-xs text-[#4a5568]">Total: <span class="font-black text-[#1a6b52]">${formatCOP(item.totalRevenue)}</span></div>
          </div>
        `;
      }
    },
    grid: {
      ...baseGrid,
      left: '25%',
      right: '8%',
      top: '5%',
      bottom: '5%'
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0e6d6', type: 'dashed' } },
      axisLabel: {
        color: '#718096',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 10,
        formatter: (val: number) =>
          metric.value === 'quantity' ? `${val}` : formatCompactCOP(val)
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
          return val.length > 16 ? `${val.substring(0, 15)}...` : val;
        }
      }
    },
    series: [
      {
        name: metric.value === 'quantity' ? 'Cantidad Vendida' : 'Ingresos Totales',
        type: 'bar',
        data: values,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#1a6b52' },
              { offset: 1, color: '#38a169' }
            ]
          },
          borderRadius: [0, 6, 6, 0],
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
          formatter: (p: any) =>
            metric.value === 'quantity' ? `${p.value}` : formatCompactCOP(p.value)
        }
      }
    ]
  };
});
</script>
