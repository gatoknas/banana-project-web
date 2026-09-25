<template>
  <div class="retro-panel p-5 flex flex-col justify-between h-full">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-line gap-2">
      <div>
        <h3 class="text-base font-bold text-ink font-['Outfit'] tracking-wide">Evolución de Ingresos</h3>
        <p class="text-xs text-muted font-medium">Histórico diario de recaudación por ventas</p>
      </div>
      <div class="flex items-center space-x-1.5 bg-[#f5ede0] p-1 rounded-xl border border-line">
        <button
          v-for="p in periods"
          :key="p.value"
          class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all font-['Outfit']"
          :class="modelValue === p.value ? 'bg-emerald text-white shadow-xs' : 'text-muted hover:text-ink'"
          @click="$emit('update:modelValue', p.value)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div class="mt-4 flex-1 min-h-[280px]">
      <EChart :option="chartOption" :loading="loading" :empty="!timeline || timeline.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EChartsOption } from 'echarts';
import EChart from '../charts/EChart.vue';
import type { SalesTimelineEntry } from '../../types';
import { useRetroChartTheme } from '../../composables/useChart';

const props = defineProps<{
  timeline: SalesTimelineEntry[];
  loading?: boolean;
  modelValue: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const periods = [
  { label: '7 Días', value: '7d' },
  { label: '30 Días', value: '30d' },
  { label: '90 Días', value: '90d' }
];

const { baseTooltip, baseGrid, formatCOP, formatCompactCOP } = useRetroChartTheme();

const chartOption = computed<EChartsOption>(() => {
  const dates = (props.timeline || []).map((t) => t.date);
  const revenues = (props.timeline || []).map((t) => t.revenue);
  const counts = (props.timeline || []).map((t) => t.count);

  return {
    tooltip: {
      ...baseTooltip,
      trigger: 'axis',
      formatter: (params: any) => {
        if (!params || !params[0]) return '';
        const index = params[0].dataIndex;
        const date = dates[index];
        const rev = revenues[index];
        const cnt = counts[index];
        return `
          <div class="p-1">
            <div class="font-bold text-xs text-[#2d3748] mb-1">${date}</div>
            <div class="text-sm font-black text-[#1a6b52]">${formatCOP(rev)}</div>
            <div class="text-[11px] text-[#718096] mt-0.5">${cnt} tickets emitidos</div>
          </div>
        `;
      }
    },
    grid: {
      ...baseGrid,
      top: '10%',
      bottom: '10%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#2d3748', width: 2 } },
      axisTick: { show: false },
      axisLabel: {
        color: '#4a5568',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 11,
        formatter: (val: string) => {
          const parts = val.split('-');
          return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0e6d6', type: 'dashed' } },
      axisLabel: {
        color: '#718096',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 11,
        formatter: (val: number) => formatCompactCOP(val)
      }
    },
    series: [
      {
        name: 'Ingresos',
        type: 'line',
        data: revenues,
        smooth: true,
        showSymbol: dates.length <= 15,
        symbolSize: 6,
        itemStyle: {
          color: '#1a6b52',
          borderColor: '#2d3748',
          borderWidth: 2
        },
        lineStyle: {
          width: 3,
          color: '#1a6b52'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(26, 107, 82, 0.45)' },
              { offset: 1, color: 'rgba(26, 107, 82, 0.02)' }
            ]
          }
        }
      }
    ]
  };
});
</script>
