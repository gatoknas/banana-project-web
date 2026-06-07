<template>
  <div class="space-y-6">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
      <div>
        <h2 class="text-3xl font-black text-golden-title tracking-wide uppercase">
          Gestión de Usuarios
        </h2>
        <p class="text-cream/80 font-bold">Consulta, agrega o modifica el personal autorizado en Ayurami.</p>
      </div>
      <button
        @click="showForm = true"
        class="retro-btn-yellow flex items-center justify-center gap-2"
      >
        <span class="text-2xl font-black">+</span> Agregar Usuario
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="retro-panel-crimson">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-grow">
          <label for="search-user" class="block text-goldenrod font-extrabold text-sm mb-1">Buscar Usuario</label>
          <input
            id="search-user"
            v-model="searchQuery"
            type="text"
            placeholder="Filtrar por nombre o correo..."
            class="retro-input !bg-cream/90"
          />
        </div>
        <div class="w-full md:w-64">
          <label for="role-filter" class="block text-goldenrod font-extrabold text-sm mb-1">Rol</label>
          <select
            id="role-filter"
            v-model="selectedRole"
            class="retro-input !bg-cream/90"
          >
            <option value="Todos">Todos los Roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Vendedor">Vendedor</option>
            <option value="Cliente">Cliente</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="retro-panel-cream flex flex-col justify-between"
      >
        <div>
          <!-- User header card with avatar -->
          <div class="flex items-center gap-4 mb-4">
            <img
              :src="user.avatar || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + user.name"
              alt="User Avatar"
              class="h-16 w-16 rounded-full border-4 border-black bg-cream p-1 shrink-0"
            />
            <div class="min-w-0">
              <h3 class="text-xl font-black text-crimson uppercase tracking-wide truncate">
                {{ user.name }}
              </h3>
              <p class="text-black/70 font-semibold text-sm truncate">
                {{ user.email }}
              </p>
            </div>
          </div>

          <!-- Badges -->
          <div class="flex gap-2 mb-4">
            <!-- Role badge -->
            <span
              class="border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black uppercase"
              :class="{
                'bg-crimson text-cream': user.role === 'Administrador',
                'bg-goldenrod text-black': user.role === 'Vendedor',
                'bg-sky-blue text-cream': user.role === 'Cliente'
              }"
            >
              {{ user.role }}
            </span>
            <!-- Status badge -->
            <span
              class="border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black uppercase flex items-center gap-1.5"
              :class="user.status === 'Activo' ? 'bg-emerald text-cream' : 'bg-black/30 text-black/80'"
            >
              <span class="w-1.5 h-1.5 rounded-full inline-block" :class="user.status === 'Activo' ? 'bg-cream' : 'bg-black'"></span>
              {{ user.status }}
            </span>
          </div>
        </div>

        <div class="pt-4 border-t-2 border-black/10 flex gap-2">
          <button
            @click="editUser(user)"
            class="retro-btn-emerald py-2 px-3 text-sm font-black border-2 shadow-retro-sm hover:bg-emerald/95 flex-grow"
          >
            Editar
          </button>
          <button
            @click="deleteUser(user.id)"
            class="retro-btn-crimson py-2 px-3 text-sm font-black border-2 shadow-retro-sm hover:bg-red-800 flex-grow"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredUsers.length === 0" class="retro-panel-yellow text-center py-12">
      <p class="text-2xl font-black text-crimson uppercase mb-2">No se encontraron usuarios</p>
      <p class="font-bold text-crimson/80">Intenta cambiando los términos de búsqueda o filtros de rol.</p>
    </div>

    <!-- Slide Over Form (Add/Edit User) -->
    <transition name="slide">
      <div v-if="showForm" class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
        <!-- Close overlay trigger -->
        <div class="flex-grow" @click="closeForm"></div>
        
        <!-- Form Drawer -->
        <div class="w-full max-w-md bg-emerald border-l-6 border-golden-title p-6 flex flex-col justify-between overflow-y-auto retro-scrollbar shadow-retro-lg">
          <div>
            <div class="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
              <h3 class="text-2xl font-black text-golden-title uppercase tracking-wide">
                {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
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
                <label for="u-name" class="block text-golden-title font-extrabold text-sm mb-1">Nombre Completo</label>
                <input
                  id="u-name"
                  v-model="formModel.name"
                  type="text"
                  placeholder="ej. Daniel Medina"
                  class="retro-input"
                  required
                />
              </div>

              <div>
                <label for="u-email" class="block text-golden-title font-extrabold text-sm mb-1">Correo Electrónico</label>
                <input
                  id="u-email"
                  v-model="formModel.email"
                  type="email"
                  placeholder="ej. dmedina@ayurami.com"
                  class="retro-input"
                  required
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="u-role" class="block text-golden-title font-extrabold text-sm mb-1">Rol</label>
                  <select
                    id="u-role"
                    v-model="formModel.role"
                    class="retro-input"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Vendedor">Vendedor</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>
                <div>
                  <label for="u-status" class="block text-golden-title font-extrabold text-sm mb-1">Estado</label>
                  <select
                    id="u-status"
                    v-model="formModel.status"
                    class="retro-input"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div class="mt-8 pt-4 border-t-4 border-black">
            <button
              @click="saveUser"
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
import type { User } from '../types';

// Mock Users list
const users = ref<User[]>([
  {
    id: 'usr_1',
    name: 'Daniel Medina',
    email: 'admin@ayurami.com',
    role: 'Administrador',
    status: 'Activo',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Daniel'
  },
  {
    id: 'usr_2',
    name: 'Camila Torres',
    email: 'ctorres@ayurami.com',
    role: 'Vendedor',
    status: 'Activo',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Camila'
  },
  {
    id: 'usr_3',
    name: 'Alejandro Ruiz',
    email: 'aruiz@ayurami.com',
    role: 'Vendedor',
    status: 'Activo',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alejandro'
  },
  {
    id: 'usr_4',
    name: 'Lucía Fernández',
    email: 'lfernandez@gmail.com',
    role: 'Cliente',
    status: 'Inactivo',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Lucia'
  }
]);

// Controls
const searchQuery = ref('');
const selectedRole = ref('Todos');
const showForm = ref(false);
const isEditing = ref(false);
const formError = ref('');

// Form state
const initialFormState = (): User => ({
  id: '',
  name: '',
  email: '',
  role: 'Vendedor',
  status: 'Activo'
});
const formModel = ref<User>(initialFormState());

// Filtered Computed Lists
const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = selectedRole.value === 'Todos' || u.role === selectedRole.value;
    return matchesSearch && matchesRole;
  });
});

// Operations
const closeForm = () => {
  showForm.value = false;
  isEditing.value = false;
  formError.value = '';
  formModel.value = initialFormState();
};

const editUser = (user: User) => {
  isEditing.value = true;
  formModel.value = { ...user };
  showForm.value = true;
};

const deleteUser = (id: string) => {
  if (id === 'usr_1') {
    alert('No se puede eliminar el administrador principal del sistema.');
    return;
  }
  if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
    users.value = users.value.filter(u => u.id !== id);
  }
};

const saveUser = () => {
  const model = formModel.value;
  // Simple validation
  if (!model.name.trim()) {
    formError.value = 'El nombre es obligatorio.';
    return;
  }
  if (!model.email.trim() || !model.email.includes('@')) {
    formError.value = 'Introduce un correo electrónico válido.';
    return;
  }

  if (isEditing.value) {
    // Update
    const index = users.value.findIndex(u => u.id === model.id);
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        name: model.name,
        email: model.email,
        role: model.role,
        status: model.status,
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + encodeURIComponent(model.name)
      };
    }
  } else {
    // Create
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: model.name,
      email: model.email,
      role: model.role,
      status: model.status,
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + encodeURIComponent(model.name)
    };
    users.value.push(newUser);
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
</style>
