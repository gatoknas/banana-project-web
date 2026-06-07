<template>
  <div class="space-y-6">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
      <div>
        <h2 class="text-3xl font-black text-golden-title tracking-wide uppercase">
          Gestión de Productos
        </h2>
        <p class="text-cream/80 font-bold">Consulta, agrega o modifica el inventario de Ayurami.</p>
      </div>
      <button
        @click="showForm = true"
        class="retro-btn-yellow flex items-center justify-center gap-2"
      >
        <span class="text-2xl font-black">+</span> Agregar Producto
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="retro-panel-crimson">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-grow">
          <label for="search" class="block text-goldenrod font-extrabold text-sm mb-1">Buscar Producto</label>
          <input
            id="search"
            v-model="searchQuery"
            type="text"
            placeholder="Filtrar por nombre o descripción..."
            class="retro-input !bg-cream/90"
          />
        </div>
        <div class="w-full md:w-64">
          <label for="category" class="block text-goldenrod font-extrabold text-sm mb-1">Categoría</label>
          <select
            id="category"
            v-model="selectedCategory"
            class="retro-input !bg-cream/90"
          >
            <option value="Todos">Todas las Categorías</option>
            <option value="Cuidado Personal">Cuidado Personal</option>
            <option value="Alimentos">Alimentos</option>
            <option value="Aceites Esenciales">Aceites Esenciales</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="retro-panel-cream flex flex-col justify-between"
      >
        <div>
          <!-- Badge category -->
          <div class="flex justify-between items-start gap-2 mb-3">
            <span class="bg-crimson text-cream border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black uppercase">
              {{ product.category }}
            </span>
            <span 
              class="border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black uppercase"
              :class="product.stock <= 5 ? 'bg-crimson text-cream animate-pulse' : 'bg-emerald text-cream'"
            >
              Stock: {{ product.stock }} {{ product.stock <= 5 ? '¡Bajo!' : '' }}
            </span>
          </div>
          
          <h3 class="text-2xl font-black text-crimson mb-2 uppercase tracking-wide">
            {{ product.name }}
          </h3>
          <p class="text-black font-semibold text-sm line-clamp-3 mb-4">
            {{ product.description }}
          </p>
        </div>

        <div class="mt-4 pt-4 border-t-2 border-black/10">
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs text-crimson/70 font-black uppercase">Precio</span>
            <span class="text-3xl font-black text-crimson">${{ product.price.toFixed(2) }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              @click="editProduct(product)"
              class="retro-btn-emerald py-2 px-3 text-sm font-black border-2 shadow-retro-sm hover:bg-emerald/95"
            >
              Editar
            </button>
            <button
              @click="deleteProduct(product.id)"
              class="retro-btn-crimson py-2 px-3 text-sm font-black border-2 shadow-retro-sm hover:bg-red-800"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredProducts.length === 0" class="retro-panel-yellow text-center py-12">
      <p class="text-2xl font-black text-crimson uppercase mb-2">No se encontraron productos</p>
      <p class="font-bold text-crimson/80">Intenta cambiando los términos de búsqueda o filtros.</p>
    </div>

    <!-- Slide Over Form (Add/Edit Product) -->
    <transition name="slide">
      <div v-if="showForm" class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
        <!-- Close overlay trigger -->
        <div class="flex-grow" @click="closeForm"></div>
        
        <!-- Form Drawer -->
        <div class="w-full max-w-md bg-emerald border-l-6 border-golden-title p-6 flex flex-col justify-between overflow-y-auto retro-scrollbar shadow-retro-lg">
          <div>
            <div class="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
              <h3 class="text-2xl font-black text-golden-title uppercase tracking-wide">
                {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
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

            <form class="space-y-4">
              <div>
                <label for="p-name" class="block text-golden-title font-extrabold text-sm mb-1">Nombre</label>
                <input
                  id="p-name"
                  v-model="formModel.name"
                  type="text"
                  placeholder="ej. Miel de Abeja Eucalipto"
                  class="retro-input"
                  required
                />
              </div>

              <div>
                <label for="p-category" class="block text-golden-title font-extrabold text-sm mb-1">Categoría</label>
                <select
                  id="p-category"
                  v-model="formModel.category"
                  class="retro-input"
                >
                  <option value="Cuidado Personal">Cuidado Personal</option>
                  <option value="Alimentos">Alimentos</option>
                  <option value="Aceites Esenciales">Aceites Esenciales</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="p-price" class="block text-golden-title font-extrabold text-sm mb-1">Precio ($)</label>
                  <input
                    id="p-price"
                    v-model.number="formModel.price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    class="retro-input"
                    required
                  />
                </div>
                <div>
                  <label for="p-stock" class="block text-golden-title font-extrabold text-sm mb-1">Cantidad (Stock)</label>
                  <input
                    id="p-stock"
                    v-model.number="formModel.stock"
                    type="number"
                    min="0"
                    class="retro-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label for="p-description" class="block text-golden-title font-extrabold text-sm mb-1">Descripción</label>
                <textarea
                  id="p-description"
                  v-model="formModel.description"
                  rows="4"
                  placeholder="Describe los beneficios e ingredientes del producto..."
                  class="retro-input font-nunito resize-none"
                  required
                ></textarea>
              </div>
            </form>
          </div>

          <div class="mt-8 pt-4 border-t-4 border-black">
            <button
              @click="saveProduct"
              class="retro-btn-yellow w-full text-lg uppercase tracking-wider py-3"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Product } from '../types';

// Mock Products list based on real Ayurami vibe
const products = ref<Product[]>([
  {
    id: 'prod_1',
    name: 'Miel de Abeja de Floración Orgánica',
    price: 15.50,
    stock: 24,
    category: 'Alimentos',
    description: 'Miel 100% natural, recolectada de campos libres de pesticidas, con notas florales intensas y endulzado saludable.'
  },
  {
    id: 'prod_2',
    name: 'Shampoo Sólido de Romero y Ortiga',
    price: 9.99,
    stock: 4,
    category: 'Cuidado Personal',
    description: 'Estimula el crecimiento folicular, regula la grasa del cuero cabelludo y deja un aroma refrescante a romero.'
  },
  {
    id: 'prod_3',
    name: 'Crema Hidratante Facial Aloe Vera & Karité',
    price: 18.00,
    stock: 12,
    category: 'Cuidado Personal',
    description: 'Perfecta para calmar pieles sensibles, hidratar en profundidad sin dejar sensación grasa y regenerar la dermis.'
  },
  {
    id: 'prod_4',
    name: 'Aceite Esencial Puro de Lavanda',
    price: 12.50,
    stock: 3,
    category: 'Aceites Esenciales',
    description: 'Ideal para aromaterapia, promueve la relajación, el sueño reparador y calma picaduras e irritaciones cutáneas.'
  },
  {
    id: 'prod_5',
    name: 'Polen de Flores Silvestres Seco',
    price: 8.50,
    stock: 15,
    category: 'Alimentos',
    description: 'Excelente energizante natural rico en proteínas, aminoácidos libres y complejo vitamínico B. Perfecto para desayunos.'
  }
]);

// Controls
const searchQuery = ref('');
const selectedCategory = ref('Todos');
const showForm = ref(false);
const isEditing = ref(false);
const formError = ref('');

// Form state
const initialFormState = (): Product => ({
  id: '',
  name: '',
  category: 'Cuidado Personal',
  price: 0.0,
  stock: 0,
  description: ''
});
const formModel = ref<Product>(initialFormState());

// Filtered Computed Lists
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === 'Todos' || p.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

// Operations
const closeForm = () => {
  showForm.value = false;
  isEditing.value = false;
  formError.value = '';
  formModel.value = initialFormState();
};

const editProduct = (product: Product) => {
  isEditing.value = true;
  formModel.value = { ...product };
  showForm.value = true;
};

const deleteProduct = (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    products.value = products.value.filter(p => p.id !== id);
  }
};

const saveProduct = () => {
  // Simple validation
  const model = formModel.value;
  if (!model.name.trim()) {
    formError.value = 'El nombre del producto es obligatorio.';
    return;
  }
  if (model.price <= 0) {
    formError.value = 'El precio debe ser un número mayor a cero.';
    return;
  }
  if (model.stock < 0) {
    formError.value = 'La cantidad de inventario no puede ser negativa.';
    return;
  }
  if (!model.description.trim()) {
    formError.value = 'La descripción es obligatoria.';
    return;
  }

  if (isEditing.value) {
    // Update
    const index = products.value.findIndex(p => p.id === model.id);
    if (index !== -1) {
      products.value[index] = {
        ...products.value[index],
        name: model.name,
        category: model.category,
        price: model.price,
        stock: model.stock,
        description: model.description
      };
    }
  } else {
    // Create
    const newProduct: Product = {
      id: 'prod_' + (Date.now()),
      name: model.name,
      category: model.category,
      price: model.price,
      stock: model.stock,
      description: model.description
    };
    products.value.push(newProduct);
  }

  closeForm();
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
