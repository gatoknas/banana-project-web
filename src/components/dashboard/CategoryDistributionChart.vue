<template>
  <div class="retro-panel p-5 flex flex-col justify-between h-full">
    <div class="pb-4 border-b-2 border-line">
      <h3 class="text-base font-bold text-ink font-['Outfit'] tracking-wide">Ventas por Categoría</h3>
      <p class="text-xs text-muted font-medium">Participación de ingresos por familia de productos</p>
    </div>

    <div class="mt-4 flex-1 min-h-[300px]">
      <EChart :option="chartOption" :loading="loading" :empty="!categories || categories.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EChartsOption } from 'echarts';
import EChart from '../charts/EChart.vue';
import type { CategoryEntry } from '../../types';
import { useRetroChartTheme } from '../../composables/useChart';

const props = defineProps<{
  categories: CategoryEntry[];
  loading?: boolean;
}>();

const { palette, baseTooltip, formatCOP } = useRetroChartTheme();

const chartOption = computed<EChartsOption>(() => {
  const totalRev = (props.categories || []).reduce((acc, c) => acc + c.totalRevenue, 0);

  const data = (props.categories || []).map((cat, idx) => ({
    name: cat.categoryName,
    value: cat.totalRevenue,
    tickets: cat.count,
    itemStyle: {
      color: palette[idx % palette.length],
      borderColor: '#2d3748',
      borderWidth: 2
    }
  }));

  return {
    tooltip: {
      ...baseTooltip,
      trigger: 'item',
      formatter: (params: any) => {
        const item = params.data;
        const pct = totalRev > 0 ? ((item.value / totalRev) * 100).toFixed(1) : '0';
        return `
          <div class="p-1">
            <div class="font-bold text-xs text-[#2d3748] flex items-center gap-1.5">
              <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${params.color}"></span>
              ${params.name}
            </div>
            <div class="text-sm font-black text-[#1a6b52] mt-1">${formatCOP(item.value)}</div>
            <div class="text-[11px] text-[#718096] mt-0.5">${item.tickets} tickets (${pct}%)</div>
          </div>
        `;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: {
        fontFamily: 'Outfit, sans-serif',
        fontSize: 11,
        color: '#2d3748',
        fontWeight: 'bold'
      },
      icon: 'circle'
    },
    series: [
      {
        name: 'Categoría',
        type: 'pie',
        roseType: 'radius',
        radius: ['30%', '72%'],
        center: ['50%', '45%'],
        itemStyle: {
          borderRadius: 6
        },
        label: {
          show: true,
          fontFamily: 'Outfit, sans-serif',
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2d3748',
          formatter: '{b}'
        },
        data
      }
    ]
  };
});
</script>
