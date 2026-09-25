<template>
  <div class="retro-panel p-5 flex flex-col justify-between h-full">
    <div class="pb-4 border-b-2 border-line">
      <h3 class="text-base font-bold text-ink font-['Outfit'] tracking-wide">Compras vs Ventas Mensuales</h3>
      <p class="text-xs text-muted font-medium">Comparativo mensual de gastos en insumos vs ingresos generados</p>
    </div>

    <div class="mt-4 flex-1 min-h-[300px]">
      <EChart :option="chartOption" :loading="loading" :empty="!data || data.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EChartsOption } from 'echarts';
import EChart from '../charts/EChart.vue';
import type { PurchasesVsSalesEntry } from '../../types';
import { useRetroChartTheme } from '../../composables/useChart';

const props = defineProps<{
  data: PurchasesVsSalesEntry[];
  loading?: boolean;
}>();

const { baseTooltip, baseGrid, formatCOP, formatCompactCOP } = useRetroChartTheme();

const chartOption = computed<EChartsOption>(() => {
  const months = (props.data || []).map((d) => d.month);
  const purchases = (props.data || []).map((d) => d.purchases);
  const sales = (props.data || []).map((d) => d.sales);

  return {
    tooltip: {
      ...baseTooltip,
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!params || !params[0]) return '';
        const idx = params[0].dataIndex;
        const m = months[idx];
        const p = purchases[idx];
        const s = sales[idx];
        const margin = s - p;
        const marginPct = s > 0 ? ((margin / s) * 100).toFixed(1) : '0';

        return `
          <div class="p-1">
            <div class="font-bold text-xs text-[#2d3748] mb-1">Mes: ${m}</div>
            <div class="text-xs text-[#1a6b52] font-bold">Ventas: ${formatCOP(s)}</div>
            <div class="text-xs text-[#c0392b] font-bold">Compras: ${formatCOP(p)}</div>
            <div class="mt-1 pt-1 border-t border-[#e2e8f0] text-xs font-black ${
              margin >= 0 ? 'text-[#1a6b52]' : 'text-[#c0392b]'
            }">
              Margen Bruto: ${formatCOP(margin)} (${marginPct}%)
            </div>
          </div>
        `;
      }
    },
    grid: {
      ...baseGrid,
      top: '12%',
      bottom: '12%'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      icon: 'circle',
      textStyle: {
        fontFamily: 'Outfit, sans-serif',
        fontSize: 11,
        color: '#2d3748',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: '#2d3748', width: 2 } },
      axisTick: { show: false },
      axisLabel: {
        color: '#4a5568',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 11,
        fontWeight: '500'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0e6d6', type: 'dashed' } },
      axisLabel: {
        color: '#718096',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 10,
        formatter: (val: number) => formatCompactCOP(val)
      }
    },
    series: [
      {
        name: 'Compras (Gasto)',
        type: 'bar',
        data: purchases,
        itemStyle: {
          color: '#dd6b20',
          borderColor: '#2d3748',
          borderWidth: 1.5,
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: 'Ventas (Ingresos)',
        type: 'line',
        data: sales,
        smooth: true,
        symbolSize: 8,
        itemStyle: {
          color: '#1a6b52',
          borderColor: '#2d3748',
          borderWidth: 2
        },
        lineStyle: {
          width: 3,
          color: '#1a6b52'
        }
      }
    ]
  };
});
</script>
