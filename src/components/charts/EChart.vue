<template>
  <div class="relative w-full h-full min-h-[260px]">
    <div ref="chartContainer" class="w-full h-full min-h-[260px]"></div>

    <!-- Empty State Overlay -->
    <div
      v-if="!loading && empty"
      class="absolute inset-0 flex flex-col items-center justify-center bg-[#fffdfa]/80 backdrop-blur-xs rounded-xl"
    >
      <div class="w-12 h-12 rounded-full bg-[#f4ecd8] border-2 border-[#2d3748] flex items-center justify-center mb-2 shadow-[2px_2px_0px_0px_#2d3748]">
        <svg class="w-6 h-6 text-[#2d3748]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-[#2d3748] font-['Outfit']">{{ emptyText || 'Sin datos para este periodo' }}</p>
    </div>

    <!-- Loading Skeleton Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-[#fffdfa]/85 backdrop-blur-xs rounded-xl"
    >
      <div class="flex items-center space-x-3 px-4 py-2 bg-white border-2 border-[#2d3748] rounded-xl shadow-[3px_3px_0px_0px_#2d3748]">
        <svg class="animate-spin h-5 w-5 text-[#1a6b52]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span class="text-xs font-bold text-[#2d3748] tracking-wide font-['Outfit']">Cargando gráfico...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{
  option: echarts.EChartsOption;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
}>();

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;
let animationFrameId: number | null = null;

const handleResize = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  animationFrameId = requestAnimationFrame(() => {
    chartInstance?.resize();
    animationFrameId = null;
  });
};

const initChart = () => {
  if (!chartContainer.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartContainer.value, undefined, {
    renderer: 'svg'
  });

  if (props.option) {
    chartInstance.setOption(props.option, true);
  }

  // Setup ResizeObserver for responsive resizing using requestAnimationFrame
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(chartContainer.value);
  }
};

watch(
  () => props.option,
  (newOption) => {
    if (chartInstance && newOption) {
      chartInstance.setOption(newOption, true);
    }
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (resizeObserver && chartContainer.value) {
    resizeObserver.unobserve(chartContainer.value);
    resizeObserver.disconnect();
  }
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>
