<template>
  <div class="space-y-6">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
      <div>
        <h2 class="text-3xl font-black text-golden-title tracking-wide uppercase">
          Gestión de Proveedores
        </h2>
        <p class="text-cream/80 font-bold">Administra el directorio de proveedores de insumos y productos para Ayurami.</p>
      </div>
      <button
        @click="openCreateModal"
        class="retro-btn-yellow flex items-center justify-center gap-2"
      >
        <span class="text-2xl font-black">+</span> Agregar Proveedor
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

    <!-- Filters and Search -->
    <div class="retro-panel-crimson">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-grow w-full">
          <label for="search-supplier" class="block text-goldenrod font-extrabold text-sm mb-1">
            Buscar Proveedor
          </label>
          <div class="relative">
            <input
              id="search-supplier"
              v-model="searchQuery"
              @input="onSearchInput"
              type="text"
              placeholder="Filtrar por empresa, NIT/tax ID o contacto..."
              class="retro-input !bg-cream/90 pr-10"
            />
            <span
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-crimson font-black text-lg select-none"
            >
              ✕
            </span>
          </div>
        </div>
        <div class="shrink-0 w-full md:w-auto">
          <button
            @click="fetchSuppliers"
            class="retro-btn-yellow w-full md:w-auto py-2 px-4 text-sm font-black border-2 shadow-retro-sm"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>

    <!-- Suppliers Grid -->
    <div v-if="!isLoading && filteredSuppliers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="supplier in filteredSuppliers"
        :key="supplier.id"
        class="retro-panel-cream flex flex-col justify-between"
      >
        <div>
          <!-- Badge and Tax ID -->
          <div class="flex justify-between items-start gap-2 mb-3">
            <span
              v-if="supplier.taxId"
              class="bg-crimson text-cream border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black uppercase"
            >
              NIT: {{ supplier.taxId }}
            </span>
            <span
              v-else
              class="bg-black/20 text-black/70 border-2 border-black/30 rounded-lg px-2.5 py-0.5 text-xs font-black uppercase"
            >
              Sin NIT
            </span>
            <span class="border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black uppercase bg-emerald text-cream">
              ID #{{ supplier.id }}
            </span>
          </div>

          <!-- Company Name -->
          <h3 class="text-2xl font-black text-crimson mb-2 uppercase tracking-wide break-words">
            {{ supplier.companyName }}
          </h3>

          <!-- Details List -->
          <div class="space-y-2 text-sm text-black font-semibold mt-3">
            <div class="flex items-center gap-2">
              <span class="text-crimson font-black text-xs uppercase w-20 shrink-0">Contacto:</span>
              <span class="truncate">{{ supplier.contactName || 'No especificado' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-crimson font-black text-xs uppercase w-20 shrink-0">Teléfono:</span>
              <span class="truncate">{{ supplier.phone || 'No registrado' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-crimson font-black text-xs uppercase w-20 shrink-0">Correo:</span>
              <span class="truncate">{{ supplier.email || 'No registrado' }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-5 pt-4 border-t-2 border-black/10 grid grid-cols-2 gap-2">
          <button
            @click="editSupplier(supplier)"
            class="retro-btn-emerald py-2 px-3 text-sm font-black border-2 shadow-retro-sm hover:bg-emerald/95 text-center"
          >
            Editar
          </button>
          <button
            @click="promptDeleteSupplier(supplier)"
            class="retro-btn-crimson py-2 px-3 text-sm font-black border-2 shadow-retro-sm hover:bg-red-800 text-center"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="retro-panel-yellow text-center py-12 flex flex-col items-center justify-center gap-4">
      <div class="relative w-16 h-16">
        <div class="w-16 h-16 rounded-full border-8 border-crimson/20 border-t-8 border-t-crimson animate-spin"></div>
        <div class="absolute inset-0 m-auto w-4 h-4 bg-golden-title rounded-full border-2 border-black"></div>
      </div>
      <p class="text-2xl font-black text-crimson uppercase tracking-wider animate-pulse">Cargando proveedores...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredSuppliers.length === 0" class="retro-panel-yellow text-center py-12">
      <p class="text-2xl font-black text-crimson uppercase mb-2">No se encontraron proveedores</p>
      <p class="font-bold text-crimson/80 mb-4">
        {{ searchQuery ? 'No hay resultados que coincidan con la búsqueda.' : 'Aún no se han registrado proveedores en el sistema.' }}
      </p>
      <button
        v-if="!searchQuery"
        @click="openCreateModal"
        class="retro-btn-crimson py-2 px-4 text-sm font-black uppercase shadow-retro-sm"
      >
        Registrar Primer Proveedor
      </button>
    </div>

    <!-- Slide-Over Drawer Form (Add / Edit Supplier) -->
    <transition name="slide">
      <div v-if="showForm" class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
        <div class="flex-grow" @click="closeForm"></div>
        
        <div class="w-full max-w-md bg-emerald border-l-6 border-golden-title p-6 flex flex-col justify-between overflow-y-auto retro-scrollbar shadow-retro-lg">
          <div>
            <!-- Form Header -->
            <div class="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
              <h3 class="text-2xl font-black text-golden-title uppercase tracking-wide">
                {{ isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
              </h3>
              <button 
                @click="closeForm"
                class="retro-btn-crimson py-1 px-3 border-2 text-xs font-black uppercase shadow-retro-sm"
              >
                Cerrar
              </button>
            </div>

            <!-- Validation Error Alert -->
            <div v-if="formError" class="bg-crimson text-cream border-4 border-black rounded-xl p-3 mb-5 font-bold text-sm shadow-retro-sm">
              ⚠️ {{ formError }}
            </div>

            <form @submit.prevent="saveSupplier" class="space-y-4">
              <div>
                <label for="s-company-name" class="block text-golden-title font-extrabold text-sm mb-1">
                  Empresa / Razón Social <span class="text-crimson">*</span>
                </label>
                <input
                  id="s-company-name"
                  v-model="formModel.companyName"
                  type="text"
                  placeholder="ej. Distribuidora Frutera S.A."
                  class="retro-input"
                  required
                />
              </div>

              <div>
                <label for="s-phone" class="block text-golden-title font-extrabold text-sm mb-1">
                  Teléfono <span class="text-crimson">*</span>
                </label>
                <input
                  id="s-phone"
                  v-model="formModel.phone"
                  type="tel"
                  placeholder="ej. +57 300 123 4567"
                  class="retro-input"
                  required
                />
              </div>

              <div>
                <label for="s-tax-id" class="block text-golden-title font-extrabold text-sm mb-1">
                  NIT / Tax ID <span class="text-xs text-cream/70 font-normal">(Opcional)</span>
                </label>
                <input
                  id="s-tax-id"
                  v-model="formModel.taxId"
                  type="text"
                  placeholder="ej. 900123456-7"
                  class="retro-input"
                />
              </div>

              <div>
                <label for="s-contact-name" class="block text-golden-title font-extrabold text-sm mb-1">
                  Persona de Contacto <span class="text-xs text-cream/70 font-normal">(Opcional)</span>
                </label>
                <input
                  id="s-contact-name"
                  v-model="formModel.contactName"
                  type="text"
                  placeholder="ej. Carlos Mendoza"
                  class="retro-input"
                />
              </div>

              <div>
                <label for="s-email" class="block text-golden-title font-extrabold text-sm mb-1">
                  Correo Electrónico <span class="text-xs text-cream/70 font-normal">(Opcional)</span>
                </label>
                <input
                  id="s-email"
                  v-model="formModel.email"
                  type="email"
                  placeholder="ej. contacto@proveedor.com"
                  class="retro-input"
                />
              </div>
            </form>
          </div>

          <div class="mt-8 pt-4 border-t-4 border-black">
            <button
              @click="saveSupplier"
              :disabled="isSubmitting"
              class="retro-btn-yellow w-full text-lg uppercase tracking-wider py-3 flex items-center justify-center gap-2"
              :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }"
            >
              <span v-if="isSubmitting" class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isEditing ? 'Guardar Cambios' : 'Crear Proveedor' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal Dialog -->
    <transition name="fade">
      <div v-if="supplierToDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <div class="retro-panel-cream max-w-md w-full p-6 shadow-retro-lg border-4 border-black">
          <div class="flex items-center gap-3 text-crimson mb-4">
            <span class="text-3xl">⚠️</span>
            <h3 class="text-xl font-black uppercase tracking-wide">Eliminar Proveedor</h3>
          </div>
          <p class="text-black font-semibold text-sm mb-3">
            ¿Confirmas que deseas eliminar a 
            <span class="font-black text-crimson">"{{ supplierToDelete.companyName }}"</span> 
            {{ supplierToDelete.taxId ? `(NIT: ${supplierToDelete.taxId})` : '' }}?
          </p>
          <p class="text-xs text-black/70 mb-6 bg-yellow-100 p-2 border border-black/20 rounded">
            Nota: Si este proveedor cuenta con compras u órdenes registradas en el sistema, la eliminación será rechazada para mantener la integridad contable.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="supplierToDelete = null"
              class="retro-btn-yellow py-2 px-4 text-xs font-black uppercase"
            >
              Cancelar
            </button>
            <button
              @click="confirmDelete"
              :disabled="isSubmitting"
              class="retro-btn-crimson py-2 px-4 text-xs font-black uppercase flex items-center gap-2"
            >
              <span v-if="isSubmitting" class="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin"></span>
              <span>Sí, Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Supplier, SupplierRequest } from '../types';
import { supplierService } from '../services/supplierService';

const suppliers = ref<Supplier[]>([]);
const isLoading = ref(true);
const isSubmitting = ref(false);

// Filter & Search
const searchQuery = ref('');

// Slide-Over Modal State
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const formError = ref('');

// Delete Dialog State
const supplierToDelete = ref<Supplier | null>(null);

// Toast Banner State
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

const initialFormState = (): SupplierRequest => ({
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  taxId: ''
});

const formModel = ref<SupplierRequest>(initialFormState());

const fetchSuppliers = async () => {
  isLoading.value = true;
  try {
    const data = await supplierService.getSuppliers();
    suppliers.value = data || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al cargar proveedores';
    showToast(message, 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchSuppliers();
});

const filteredSuppliers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return suppliers.value;

  return suppliers.value.filter(s =>
    (s.companyName && s.companyName.toLowerCase().includes(query)) ||
    (s.taxId && s.taxId.toLowerCase().includes(query)) ||
    (s.contactName && s.contactName.toLowerCase().includes(query)) ||
    (s.email && s.email.toLowerCase().includes(query))
  );
});

const onSearchInput = () => {
  // Real-time client-side filter over loaded suppliers
};

const clearSearch = () => {
  searchQuery.value = '';
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formModel.value = initialFormState();
  formError.value = '';
  showForm.value = true;
};

const editSupplier = (supplier: Supplier) => {
  isEditing.value = true;
  editingId.value = supplier.id;
  formModel.value = {
    companyName: supplier.companyName,
    contactName: supplier.contactName || '',
    phone: supplier.phone || '',
    email: supplier.email || '',
    taxId: supplier.taxId || ''
  };
  formError.value = '';
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  formError.value = '';
};

const saveSupplier = async () => {
  const model = formModel.value;

  if (!model.companyName.trim()) {
    formError.value = 'La empresa / razón social es obligatoria.';
    return;
  }
  if (!model.phone.trim()) {
    formError.value = 'El número de teléfono es obligatorio.';
    return;
  }

  isSubmitting.value = true;
  formError.value = '';

  try {
    const payload: SupplierRequest = {
      companyName: model.companyName.trim(),
      phone: model.phone.trim(),
      contactName: model.contactName?.trim() || undefined,
      email: model.email?.trim() || undefined,
      taxId: model.taxId && model.taxId.trim() ? model.taxId.trim() : null
    };

    if (isEditing.value && editingId.value !== null) {
      await supplierService.updateSupplier(editingId.value, payload);
      showToast('Proveedor actualizado exitosamente.', 'success');
    } else {
      await supplierService.createSupplier(payload);
      showToast('Proveedor registrado exitosamente.', 'success');
    }

    await fetchSuppliers();
    closeForm();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al guardar el proveedor';
    formError.value = message;
  } finally {
    isSubmitting.value = false;
  }
};

const promptDeleteSupplier = (supplier: Supplier) => {
  supplierToDelete.value = supplier;
};

const confirmDelete = async () => {
  if (!supplierToDelete.value) return;

  isSubmitting.value = true;
  try {
    await supplierService.deleteSupplier(supplierToDelete.value.id);
    showToast(`Proveedor "${supplierToDelete.value.companyName}" eliminado.`, 'success');
    supplierToDelete.value = null;
    await fetchSuppliers();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar el proveedor';
    showToast(message, 'error');
    supplierToDelete.value = null;
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
