<template>
  <div class="space-y-6">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
      <div>
        <h2 class="text-3xl font-black text-golden-title tracking-wide uppercase">
          Gestión de Compras e Inventario
        </h2>
        <p class="text-cream/80 font-bold">
          Registra entradas de mercancía, factores de conversión por empaque y actualización de costo promedio (PMP).
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="retro-btn-yellow flex items-center justify-center gap-2"
      >
        <span class="text-2xl font-black">+</span> Nueva Compra
      </button>
    </div>

    <!-- Toast Notification Banner -->
    <transition name="fade">
      <div
        v-if="toastMessage"
        class="border-4 border-black rounded-xl p-4 font-black text-sm flex items-center justify-between shadow-retro"
        :class="toastType === 'success' ? 'bg-emerald text-cream' : 'bg-crimson text-cream'"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ toastType === 'success' ? '✅' : '⚠️' }}</span>
          <span>{{ toastMessage }}</span>
        </div>
        <button
          @click="toastMessage = ''"
          class="bg-black/20 hover:bg-black/40 text-cream rounded-md px-2 py-0.5 text-xs font-black uppercase"
        >
          ✕
        </button>
      </div>
    </transition>

    <!-- KPI Metrics Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="retro-panel-yellow p-4 flex flex-col justify-between">
        <span class="text-xs font-black uppercase text-crimson/70 tracking-wider">Órdenes / Facturas</span>
        <div class="text-3xl font-black text-crimson mt-1">{{ purchases.length }}</div>
        <span class="text-xs font-bold text-black/60 mt-1">Registradas en el periodo</span>
      </div>

      <div class="retro-panel-cream p-4 flex flex-col justify-between">
        <span class="text-xs font-black uppercase text-crimson/70 tracking-wider">Inversión Total</span>
        <div class="text-3xl font-black text-crimson mt-1">{{ formatCOP(totalInvestment) }}</div>
        <span class="text-xs font-bold text-black/60 mt-1">Gasto total acumulado</span>
      </div>

      <div class="retro-panel-guayaba p-4 flex flex-col justify-between">
        <span class="text-xs font-black uppercase text-crimson/70 tracking-wider">Proveedores Activos</span>
        <div class="text-3xl font-black text-crimson mt-1">{{ uniqueSuppliersCount }}</div>
        <span class="text-xs font-bold text-crimson/80 mt-1">Con compras realizadas</span>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="retro-panel-crimson">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label for="filter-supplier" class="block text-goldenrod font-extrabold text-sm mb-1">
            Proveedor
          </label>
          <select
            id="filter-supplier"
            v-model="filterSupplierId"
            class="retro-input !bg-cream/90 text-sm"
          >
            <option :value="0">Todos los Proveedores</option>
            <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
              {{ sup.companyName }} (NIT: {{ sup.taxId }})
            </option>
          </select>
        </div>

        <div>
          <label for="filter-from-date" class="block text-goldenrod font-extrabold text-sm mb-1">
            Desde
          </label>
          <input
            id="filter-from-date"
            v-model="filterFromDate"
            type="date"
            class="retro-input !bg-cream/90 text-sm"
          />
        </div>

        <div>
          <label for="filter-to-date" class="block text-goldenrod font-extrabold text-sm mb-1">
            Hasta
          </label>
          <input
            id="filter-to-date"
            v-model="filterToDate"
            type="date"
            class="retro-input !bg-cream/90 text-sm"
          />
        </div>

        <div class="flex gap-2">
          <button
            @click="applyFilters"
            class="retro-btn-yellow py-2 px-4 text-sm font-black border-2 shadow-retro-sm flex-grow"
          >
            Filtrar
          </button>
          <button
            @click="resetFilters"
            class="retro-btn-emerald py-2 px-3 text-sm font-black border-2 shadow-retro-sm"
            title="Limpiar filtros"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Purchases Table / List -->
    <div v-if="!isLoading && purchases.length > 0" class="retro-panel-cream overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b-4 border-black bg-cream/60 text-xs font-black uppercase text-crimson tracking-wider">
              <th class="py-3 px-4">Factura / ID</th>
              <th class="py-3 px-4">Proveedor</th>
              <th class="py-3 px-4">Fecha</th>
              <th class="py-3 px-4 text-right">Total Factura</th>
              <th class="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y-2 divide-black/10 font-bold text-sm text-black">
            <tr v-for="purchase in purchases" :key="purchase.id" class="hover:bg-cream/40 transition-colors">
              <td class="py-3.5 px-4 font-black">
                <span class="bg-crimson text-cream border-2 border-black rounded-md px-2 py-0.5 text-xs mr-2">
                  #{{ purchase.id }}
                </span>
                <span class="text-crimson font-black tracking-wide">{{ purchase.invoiceNumber }}</span>
              </td>
              <td class="py-3.5 px-4">
                <div class="font-extrabold text-crimson">{{ purchase.supplierName || 'Proveedor #' + purchase.supplierId }}</div>
                <div v-if="purchase.notes" class="text-xs text-black/60 truncate max-w-xs">{{ purchase.notes }}</div>
              </td>
              <td class="py-3.5 px-4 text-black/80 font-semibold whitespace-nowrap">
                {{ formatDate(purchase.purchaseDate) }}
              </td>
              <td class="py-3.5 px-4 text-right font-black text-crimson text-base whitespace-nowrap">
                {{ formatCOP(purchase.totalAmount) }}
              </td>
              <td class="py-3.5 px-4 text-center">
                <button
                  @click="viewPurchaseDetails(purchase.id)"
                  class="retro-btn-emerald py-1 px-3 text-xs font-black uppercase border shadow-retro-sm"
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="retro-panel-yellow text-center py-12 flex flex-col items-center justify-center gap-4">
      <div class="relative w-16 h-16">
        <div class="w-16 h-16 rounded-full border-8 border-crimson/20 border-t-8 border-t-crimson animate-spin"></div>
        <div class="absolute inset-0 m-auto w-4 h-4 bg-golden-title rounded-full border-2 border-black"></div>
      </div>
      <p class="text-2xl font-black text-crimson uppercase tracking-wider animate-pulse">Cargando compras...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && purchases.length === 0" class="retro-panel-yellow text-center py-12">
      <p class="text-2xl font-black text-crimson uppercase mb-2">No se encontraron compras registradas</p>
      <p class="font-bold text-crimson/80 mb-4">
        {{ filterSupplierId || filterFromDate || filterToDate ? 'Prueba ajustando los filtros de fecha o proveedor.' : 'Comienza registrando la primera entrada de insumos o productos al almacén.' }}
      </p>
      <button
        @click="openCreateModal"
        class="retro-btn-crimson py-2 px-4 text-sm font-black uppercase shadow-retro-sm"
      >
        Registrar Nueva Compra
      </button>
    </div>

    <!-- Modal: View Purchase Details -->
    <transition name="fade">
      <div v-if="selectedPurchase" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <div class="retro-panel-cream max-w-3xl w-full p-6 shadow-retro-lg border-4 border-black max-h-[90vh] overflow-y-auto retro-scrollbar">
          <div class="flex justify-between items-start border-b-4 border-black pb-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="bg-crimson text-cream border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black uppercase">
                  Factura {{ selectedPurchase.invoiceNumber }}
                </span>
                <span class="text-xs font-bold text-black/70">ID #{{ selectedPurchase.id }}</span>
              </div>
              <h3 class="text-2xl font-black text-crimson uppercase mt-1">
                {{ selectedPurchase.supplierName || 'Proveedor #' + selectedPurchase.supplierId }}
              </h3>
              <p class="text-xs font-bold text-black/70">Fecha: {{ formatDate(selectedPurchase.purchaseDate) }}</p>
            </div>
            <button
              @click="selectedPurchase = null"
              class="retro-btn-crimson py-1 px-3 border-2 text-xs font-black uppercase shadow-retro-sm"
            >
              Cerrar
            </button>
          </div>

          <div v-if="selectedPurchase.notes" class="mb-4 bg-yellow-100/80 p-3 rounded-lg border border-black/20 text-xs font-semibold text-black">
            <span class="font-black text-crimson uppercase">Observaciones:</span> {{ selectedPurchase.notes }}
          </div>

          <!-- Items Table -->
          <div class="border-2 border-black rounded-xl overflow-hidden mb-4">
            <table class="w-full text-left text-xs font-bold">
              <thead class="bg-crimson text-cream border-b-2 border-black uppercase">
                <tr>
                  <th class="py-2.5 px-3">Producto</th>
                  <th class="py-2.5 px-3 text-center">Unidad Empaque</th>
                  <th class="py-2.5 px-3 text-right">Cant. Comprada</th>
                  <th class="py-2.5 px-3 text-right">Factor Conv.</th>
                  <th class="py-2.5 px-3 text-right">Stock Base</th>
                  <th class="py-2.5 px-3 text-right">Costo Unit.</th>
                  <th class="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-black/10 bg-cream">
                <tr v-for="item in selectedPurchase.details" :key="item.id" class="hover:bg-yellow-50">
                  <td class="py-2.5 px-3 font-black text-crimson">
                    {{ item.productName || 'Producto #' + item.productId }}
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="border border-black/30 rounded px-1.5 py-0.5 bg-black/5">
                      {{ item.purchaseUnitName || item.purchaseUnitAbbreviation || 'Base' }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-extrabold">{{ item.quantityPurchased }}</td>
                  <td class="py-2.5 px-3 text-right text-black/70">× {{ item.conversionFactor }}</td>
                  <td class="py-2.5 px-3 text-right font-black text-emerald">{{ item.baseQuantity }}</td>
                  <td class="py-2.5 px-3 text-right">{{ formatCOP(item.unitCost) }}</td>
                  <td class="py-2.5 px-3 text-right font-black text-crimson">{{ formatCOP(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total Footer -->
          <div class="flex justify-between items-center bg-cream/90 border-2 border-black rounded-xl p-4">
            <span class="text-sm font-black uppercase text-crimson">Total Factura / Inversión:</span>
            <span class="text-3xl font-black text-crimson">{{ formatCOP(selectedPurchase.totalAmount) }}</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- Slide-Over Drawer Modal: Nueva Compra Form -->
    <transition name="slide">
      <div v-if="showForm" class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
        <div class="flex-grow" @click="closeForm"></div>

        <div class="w-full max-w-3xl bg-emerald border-l-6 border-golden-title p-6 flex flex-col justify-between overflow-y-auto retro-scrollbar shadow-retro-lg">
          <div>
            <!-- Form Header -->
            <div class="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
              <div>
                <h3 class="text-2xl font-black text-golden-title uppercase tracking-wide">
                  Registrar Nueva Compra
                </h3>
                <p class="text-xs font-bold text-cream/80">
                  Ingreso de insumos, factores de conversión y recálculo de costo promedio.
                </p>
              </div>
              <button
                @click="closeForm"
                class="retro-btn-crimson py-1 px-3 border-2 text-xs font-black uppercase shadow-retro-sm"
              >
                Cerrar
              </button>
            </div>

            <!-- Error Banner -->
            <div v-if="formError" class="bg-crimson text-cream border-4 border-black rounded-xl p-3 mb-5 font-bold text-sm shadow-retro-sm">
              ⚠️ {{ formError }}
            </div>

            <form @submit.prevent="savePurchase" class="space-y-6">
              <!-- General Info Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/20 p-4 rounded-2xl border-2 border-black/30">
                <div>
                  <label for="p-supplier" class="block text-golden-title font-extrabold text-xs mb-1 uppercase">
                    Proveedor <span class="text-crimson font-black">*</span>
                  </label>
                  <select
                    id="p-supplier"
                    v-model.number="formModel.supplierId"
                    class="retro-input !bg-cream/95 text-sm"
                    required
                  >
                    <option :value="0" disabled>Seleccionar proveedor...</option>
                    <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
                      {{ sup.companyName }} ({{ sup.taxId }})
                    </option>
                  </select>
                </div>

                <div>
                  <label for="p-invoice" class="block text-golden-title font-extrabold text-xs mb-1 uppercase">
                    N° Factura / Remisión <span class="text-crimson font-black">*</span>
                  </label>
                  <input
                    id="p-invoice"
                    v-model="formModel.invoiceNumber"
                    type="text"
                    placeholder="ej. FAC-2026-0042"
                    class="retro-input !bg-cream/95 text-sm"
                    required
                  />
                </div>

                <div>
                  <label for="p-date" class="block text-golden-title font-extrabold text-xs mb-1 uppercase">
                    Fecha de Compra <span class="text-crimson font-black">*</span>
                  </label>
                  <input
                    id="p-date"
                    v-model="formModel.purchaseDate"
                    type="date"
                    class="retro-input !bg-cream/95 text-sm"
                    required
                  />
                </div>

                <div class="sm:col-span-3">
                  <label for="p-notes" class="block text-golden-title font-extrabold text-xs mb-1 uppercase">
                    Observaciones / Notas
                  </label>
                  <input
                    id="p-notes"
                    v-model="formModel.notes"
                    type="text"
                    placeholder="ej. Compra semanal de banano y pulpa de fruta fresca"
                    class="retro-input !bg-cream/95 text-sm"
                  />
                </div>
              </div>

              <!-- Multi-Item Purchase Lines -->
              <div>
                <div class="flex justify-between items-center mb-3">
                  <h4 class="text-lg font-black text-golden-title uppercase tracking-wide">
                    Productos e Insumos a Ingresar
                  </h4>
                  <button
                    type="button"
                    @click="addItemRow"
                    class="retro-btn-yellow py-1.5 px-3 text-xs font-black uppercase flex items-center gap-1 border shadow-retro-sm"
                  >
                    <span>+</span> Agregar Línea
                  </button>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="(item, index) in formModel.items"
                    :key="index"
                    class="bg-cream/95 border-3 border-black rounded-xl p-3 shadow-retro-sm text-black space-y-2"
                  >
                    <div class="flex justify-between items-center border-b border-black/10 pb-1.5">
                      <span class="text-xs font-black uppercase text-crimson">Línea #{{ index + 1 }}</span>
                      <button
                        v-if="formModel.items.length > 1"
                        type="button"
                        @click="removeItemRow(index)"
                        class="text-crimson hover:text-red-700 font-black text-xs uppercase"
                      >
                        ✕ Eliminar línea
                      </button>
                    </div>

                    <!-- Row Inputs Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                      <!-- Product Selector -->
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-extrabold text-black/70 mb-0.5">Producto</label>
                        <select
                          v-model.number="item.productId"
                          @change="onProductSelected(item)"
                          class="retro-input !py-1.5 !px-2 text-xs !bg-white"
                          required
                        >
                          <option :value="0" disabled>Seleccionar producto...</option>
                          <option v-for="prod in products" :key="prod.id" :value="Number(prod.id)">
                            {{ prod.name }} (Base: {{ prod.unitAbbreviation || 'Ud' }})
                          </option>
                        </select>
                      </div>

                      <!-- Purchase Unit Dropdown -->
                      <div>
                        <label class="block text-xs font-extrabold text-black/70 mb-0.5">Unidad Compra</label>
                        <select
                          v-model.number="item.purchaseUnitId"
                          class="retro-input !py-1.5 !px-2 text-xs !bg-white"
                        >
                          <option v-for="uom in unitsOfMeasure" :key="uom.id" :value="uom.id">
                            {{ uom.name }} ({{ uom.abbreviation }})
                          </option>
                        </select>
                      </div>

                      <!-- Quantity Purchased -->
                      <div>
                        <label class="block text-xs font-extrabold text-black/70 mb-0.5">Cantidad</label>
                        <input
                          v-model.number="item.quantityPurchased"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="ej. 2"
                          class="retro-input !py-1.5 !px-2 text-xs !bg-white"
                          required
                        />
                      </div>

                      <!-- Unit Cost -->
                      <div>
                        <label class="block text-xs font-extrabold text-black/70 mb-0.5">Costo Unit. ($)</label>
                        <input
                          v-model.number="item.unitCost"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="ej. 60000"
                          class="retro-input !py-1.5 !px-2 text-xs !bg-white"
                          required
                        />
                      </div>
                    </div>

                    <!-- Conversion Factor & Live Subtotal calculation row -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center pt-2 border-t border-black/10 text-xs">
                      <div>
                        <label class="block text-xs font-bold text-black/70 mb-0.5">
                          Factor Conv. (Unidades base por empaque):
                        </label>
                        <input
                          v-model.number="item.conversionFactor"
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          placeholder="1.0"
                          class="retro-input !py-1 !px-2 text-xs !bg-white w-28"
                          required
                        />
                      </div>

                      <div class="bg-emerald/10 border border-emerald/40 rounded p-1.5 text-xs text-emerald font-black">
                        ⚡ Aporta: {{ (item.quantityPurchased * item.conversionFactor).toFixed(2) }} unidades base
                        <span v-if="item.conversionFactor > 0" class="block font-semibold text-black/70">
                          Costo base: {{ formatCOP(item.unitCost / item.conversionFactor) }} c/u
                        </span>
                      </div>

                      <div class="text-right">
                        <span class="text-black/60 font-extrabold mr-2 uppercase">Subtotal:</span>
                        <span class="text-base font-black text-crimson">
                          {{ formatCOP(item.quantityPurchased * item.unitCost) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Grand Total Summary Card -->
              <div class="bg-goldenrod text-black border-4 border-black rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-retro-sm">
                <div>
                  <div class="text-xs font-extrabold uppercase text-crimson">Resumen de la Orden</div>
                  <div class="font-bold text-sm">
                    {{ formModel.items.length }} líneas • 
                    {{ totalItemsBaseStock.toFixed(2) }} unidades totales a ingresar al inventario
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs font-black uppercase text-crimson mr-2">Total Compra:</span>
                  <span class="text-3xl font-black text-crimson">{{ formatCOP(computedFormTotal) }}</span>
                </div>
              </div>
            </form>
          </div>

          <!-- Drawer Submit Button -->
          <div class="mt-8 pt-4 border-t-4 border-black">
            <button
              @click="savePurchase"
              :disabled="isSubmitting"
              class="retro-btn-yellow w-full text-lg uppercase tracking-wider py-3 flex items-center justify-center gap-2"
              :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }"
            >
              <span v-if="isSubmitting" class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isSubmitting ? 'Procesando entrada...' : 'Registrar Compra y Actualizar Stock' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Purchase, PurchaseRequest, PurchaseItemRequest, Supplier, UnitOfMeasure, Product } from '../types';
import { purchaseService, type PurchaseFilter } from '../services/purchaseService';
import { supplierService } from '../services/supplierService';
import { unitOfMeasureService } from '../services/unitOfMeasureService';
import { api } from '../services/api';
import { formatCOP } from '../utils/currency';

const purchases = ref<Purchase[]>([]);
const suppliers = ref<Supplier[]>([]);
const unitsOfMeasure = ref<UnitOfMeasure[]>([]);
const products = ref<Product[]>([]);

const isLoading = ref(true);
const isSubmitting = ref(false);

// Filters
const filterSupplierId = ref(0);
const filterFromDate = ref('');
const filterToDate = ref('');

// Details Modal
const selectedPurchase = ref<Purchase | null>(null);

// Slide-Over Form State
const showForm = ref(false);
const formError = ref('');

// Toast notification
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 4000);
};

const getTodayDateString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const initialFormState = (): PurchaseRequest => ({
  supplierId: 0,
  invoiceNumber: '',
  purchaseDate: getTodayDateString(),
  notes: '',
  items: [
    {
      productId: 0,
      purchaseUnitId: 1,
      quantityPurchased: 1,
      conversionFactor: 1.0,
      unitCost: 0
    }
  ]
});

const formModel = ref<PurchaseRequest>(initialFormState());

const fetchPurchases = async () => {
  isLoading.value = true;
  try {
    const filters: PurchaseFilter = {};
    if (filterSupplierId.value > 0) filters.supplierId = filterSupplierId.value;
    if (filterFromDate.value) filters.fromDate = filterFromDate.value;
    if (filterToDate.value) filters.toDate = filterToDate.value;

    const data = await purchaseService.getPurchases(filters);
    purchases.value = data || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al cargar compras';
    showToast(message, 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchAuxiliaryData = async () => {
  try {
    const [sups, uoms, prods] = await Promise.all([
      supplierService.getSuppliers(),
      unitOfMeasureService.getUnitsOfMeasure(),
      api.get<Product[]>('/api/v1/products')
    ]);
    suppliers.value = sups || [];
    unitsOfMeasure.value = uoms || [];
    products.value = prods || [];
  } catch (err: unknown) {
    // Non-blocking error handling
  }
};

onMounted(() => {
  fetchPurchases();
  fetchAuxiliaryData();
});

// Computed Metrics
const totalInvestment = computed(() => {
  return purchases.value.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
});

const uniqueSuppliersCount = computed(() => {
  const ids = new Set(purchases.value.map(p => p.supplierId));
  return ids.size;
});

const computedFormTotal = computed(() => {
  return formModel.value.items.reduce((sum, item) => {
    return sum + ((item.quantityPurchased || 0) * (item.unitCost || 0));
  }, 0);
});

const totalItemsBaseStock = computed(() => {
  return formModel.value.items.reduce((sum, item) => {
    return sum + ((item.quantityPurchased || 0) * (item.conversionFactor || 1));
  }, 0);
});

const applyFilters = () => {
  fetchPurchases();
};

const resetFilters = () => {
  filterSupplierId.value = 0;
  filterFromDate.value = '';
  filterToDate.value = '';
  fetchPurchases();
};

const viewPurchaseDetails = async (id: number) => {
  try {
    const purchase = await purchaseService.getPurchaseById(id);
    selectedPurchase.value = purchase;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al cargar detalle de compra';
    showToast(message, 'error');
  }
};

const openCreateModal = () => {
  formModel.value = initialFormState();
  if (unitsOfMeasure.value.length > 0) {
    formModel.value.items[0].purchaseUnitId = unitsOfMeasure.value[0].id;
  }
  formError.value = '';
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  formError.value = '';
};

const addItemRow = () => {
  const defaultUomId = unitsOfMeasure.value.length > 0 ? unitsOfMeasure.value[0].id : 1;
  formModel.value.items.push({
    productId: 0,
    purchaseUnitId: defaultUomId,
    quantityPurchased: 1,
    conversionFactor: 1.0,
    unitCost: 0
  });
};

const removeItemRow = (index: number) => {
  if (formModel.value.items.length > 1) {
    formModel.value.items.splice(index, 1);
  }
};

const onProductSelected = (item: PurchaseItemRequest) => {
  const prod = products.value.find(p => Number(p.id) === item.productId);
  if (prod && prod.unitOfMeasureId) {
    item.purchaseUnitId = prod.unitOfMeasureId;
  }
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

const savePurchase = async () => {
  const model = formModel.value;

  if (!model.supplierId || model.supplierId <= 0) {
    formError.value = 'Debe seleccionar un proveedor válido.';
    return;
  }

  if (!model.invoiceNumber || !model.invoiceNumber.trim()) {
    formError.value = 'El número de factura o remisión es obligatorio.';
    return;
  }

  if (!model.purchaseDate) {
    formError.value = 'La fecha de compra es obligatoria.';
    return;
  }

  if (!model.items || model.items.length === 0) {
    formError.value = 'Debe agregar al menos una línea de producto a la orden.';
    return;
  }

  for (let i = 0; i < model.items.length; i++) {
    const it = model.items[i];
    if (!it.productId || it.productId <= 0) {
      formError.value = `Línea #${i + 1}: Debe seleccionar un producto.`;
      return;
    }
    if (it.quantityPurchased <= 0) {
      formError.value = `Línea #${i + 1}: La cantidad debe ser mayor a 0.`;
      return;
    }
    if (it.conversionFactor <= 0) {
      formError.value = `Línea #${i + 1}: El factor de conversión debe ser mayor a 0.`;
      return;
    }
    if (it.unitCost < 0) {
      formError.value = `Línea #${i + 1}: El costo unitario no puede ser negativo.`;
      return;
    }
  }

  isSubmitting.value = true;
  formError.value = '';

  try {
    const dateFormatted = model.purchaseDate.includes('T')
      ? model.purchaseDate
      : `${model.purchaseDate}T12:00:00Z`;

    const payload: PurchaseRequest = {
      supplierId: model.supplierId,
      invoiceNumber: model.invoiceNumber.trim(),
      purchaseDate: dateFormatted,
      notes: model.notes ? model.notes.trim() : '',
      items: model.items.map(it => ({
        productId: it.productId,
        purchaseUnitId: it.purchaseUnitId,
        quantityPurchased: it.quantityPurchased,
        conversionFactor: it.conversionFactor,
        unitCost: it.unitCost
      }))
    };

    await purchaseService.createPurchase(payload);
    showToast('Compra registrada exitosamente y stock actualizado.', 'success');
    closeForm();
    await fetchPurchases();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al registrar la compra';
    formError.value = message;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
