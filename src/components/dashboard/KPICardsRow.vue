<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
    <!-- 1. Ingresos Hoy -->
    <div class="retro-panel-cream p-4 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-muted font-outfit">Ventas Hoy</span>
        <div class="w-9 h-9 rounded-lg bg-emerald border-2 border-black flex items-center justify-center text-cream shadow-retro-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div v-if="loading" class="h-8 bg-black/5 animate-pulse rounded"></div>
      <div v-else>
        <div class="text-xl lg:text-2xl font-black text-ink font-outfit tracking-tight">
          {{ formatCOP(kpis?.todayRevenue || 0) }}
        </div>
        <p class="text-[11px] font-semibold text-emerald mt-1 flex items-center">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald mr-1.5"></span>
          Recaudado hoy
        </p>
      </div>
    </div>

    <!-- 2. Tickets Hoy -->
    <div class="retro-panel-cream p-4 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-muted font-outfit">Tickets Hoy</span>
        <div class="w-9 h-9 rounded-lg bg-sky-blue border-2 border-black flex items-center justify-center text-cream shadow-retro-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>
      <div v-if="loading" class="h-8 bg-black/5 animate-pulse rounded"></div>
      <div v-else>
        <div class="text-xl lg:text-2xl font-black text-ink font-outfit tracking-tight">
          {{ kpis?.todayTransactions || 0 }}
        </div>
        <p class="text-[11px] font-semibold text-muted mt-1">Transacciones</p>
      </div>
    </div>

    <!-- 3. Ticket Promedio -->
    <div class="retro-panel-cream p-4 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-muted font-outfit">Ticket Promedio</span>
        <div class="w-9 h-9 rounded-lg bg-golden-title border-2 border-black flex items-center justify-center text-crimson shadow-retro-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
      <div v-if="loading" class="h-8 bg-black/5 animate-pulse rounded"></div>
      <div v-else>
        <div class="text-xl lg:text-2xl font-black text-ink font-outfit tracking-tight">
          {{ formatCOP(kpis?.averageTicket || 0) }}
        </div>
        <p class="text-[11px] font-semibold text-muted mt-1">Por ticket hoy</p>
      </div>
    </div>

    <!-- 4. Stock Crítico -->
    <div
      class="retro-panel-cream p-4 flex flex-col justify-between cursor-pointer group"
      :class="{ 'border-crimson/80 bg-crimson/10': (kpis?.lowStockProducts || 0) > 0 }"
      @click="$emit('navigate', 'products')"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-muted font-outfit">Stock Bajo</span>
        <div
          class="w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center shadow-retro-sm"
          :class="(kpis?.lowStockProducts || 0) > 0 ? 'bg-crimson text-cream' : 'bg-black/10 text-muted'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
      <div v-if="loading" class="h-8 bg-black/5 animate-pulse rounded"></div>
      <div v-else>
        <div
          class="text-xl lg:text-2xl font-black font-outfit tracking-tight"
          :class="(kpis?.lowStockProducts || 0) > 0 ? 'text-crimson' : 'text-ink'"
        >
          {{ kpis?.lowStockProducts || 0 }}
        </div>
        <p class="text-[11px] font-bold text-crimson mt-1 group-hover:underline flex items-center">
          Ver productos &rarr;
        </p>
      </div>
    </div>

    <!-- 5. Compras del Mes -->
    <div class="retro-panel-cream p-4 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-muted font-outfit">Compras Mes</span>
        <div class="w-9 h-9 rounded-lg bg-guayaba border-2 border-black flex items-center justify-center text-crimson shadow-retro-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <div v-if="loading" class="h-8 bg-black/5 animate-pulse rounded"></div>
      <div v-else>
        <div class="text-xl lg:text-2xl font-black text-ink font-outfit tracking-tight">
          {{ formatCOP(kpis?.monthPurchasesTotal || 0) }}
        </div>
        <p class="text-[11px] font-semibold text-muted mt-1">Acumulado mes</p>
      </div>
    </div>

    <!-- 6. Usuarios Activos -->
    <div class="retro-panel-cream p-4 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-muted font-outfit">Personal</span>
        <div class="w-9 h-9 rounded-lg bg-turquoise border-2 border-black flex items-center justify-center text-emerald shadow-retro-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <div v-if="loading" class="h-8 bg-black/5 animate-pulse rounded"></div>
      <div v-else>
        <div class="text-xl lg:text-2xl font-black text-ink font-outfit tracking-tight">
          {{ kpis?.activeUsers || 0 }}
        </div>
        <p class="text-[11px] font-semibold text-muted mt-1">Usuarios activos</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardKPIs } from '../../types';
import { formatCOP } from '../../composables/useChart';

defineProps<{
  kpis?: DashboardKPIs;
  loading?: boolean;
}>();

defineEmits<{
  (e: 'navigate', tab: string): void;
}>();
</script>
