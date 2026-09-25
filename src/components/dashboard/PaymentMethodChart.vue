<template>
  <div class="retro-panel p-5 flex flex-col justify-between h-full">
    <div class="pb-4 border-b-2 border-line">
      <h3 class="text-base font-bold text-ink font-['Outfit'] tracking-wide">Métodos de Pago</h3>
      <p class="text-xs text-muted font-medium">Distribución de ingresos por canal de cobro</p>
    </div>

    <div class="mt-4 flex-1 min-h-[280px]">
      <EChart :option="chartOption" :loading="loading" :empty="!breakdown || breakdown.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EChartsOption } from 'echarts';
import EChart from '../charts/EChart.vue';
import type { PaymentMethodEntry } from '../../types';
import { useRetroChartTheme } from '../../composables/useChart';

const props = defineProps<{
  breakdown: PaymentMethodEntry[];
  loading?: boolean;
}>();

const { palette, baseTooltip, formatCOP } = useRetroChartTheme();

const methodLabels: Record<string, string> = {
  Cash: 'Efectivo',
  Card: 'Tarjeta',
  Transfer: 'Transferencia',
  Other: 'Otro'
};

const chartOption = computed<EChartsOption>(() => {
  const data = (props.breakdown || []).map((item, idx) => ({
    name: methodLabels[item.method] || item.method,
    value: item.amount,
    count: item.count,
    itemStyle: {
      color: palette[idx % palette.length],
      borderColor: '#2d3748',
      borderWidth: 2
    }
  }));

  const totalAmount = data.reduce((acc, curr) => acc + curr.value, 0);

  return {
    tooltip: {
      ...baseTooltip,
      trigger: 'item',
      formatter: (params: any) => {
        const item = params.data;
        const pct = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : '0';
        return `
          <div class="p-1">
            <div class="font-bold text-xs text-[#2d3748] flex items-center gap-1.5">
              <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${params.color}"></span>
              ${params.name}
            </div>
            <div class="text-sm font-black text-[#1a6b52] mt-1">${formatCOP(item.value)}</div>
            <div class="text-[11px] text-[#718096] mt-0.5">${item.count} tickets (${pct}%)</div>
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
        name: 'Método',
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            fontFamily: 'Outfit, sans-serif',
            formatter: '{b}\n{d}%'
          }
        },
        data
      }
    ]
  };
});
</script>
