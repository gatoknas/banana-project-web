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
            placeholder="Filtrar por nombre o usuario..."
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
          </select>
        </div>
      </div>
    </div>

    <!-- Users Grid -->
    <div v-if="!isLoading && filteredUsers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="retro-panel-cream flex flex-col justify-between"
      >
        <div>
          <!-- User header card with avatar -->
          <div class="flex items-center gap-4 mb-4">
            <img
              :src="user.avatar || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + user.username"
              alt="User Avatar"
              class="h-16 w-16 rounded-full border-4 border-black bg-cream p-1 shrink-0"
            />
            <div class="min-w-0">
              <h3 class="text-xl font-black text-crimson uppercase tracking-wide truncate">
                {{ user.name }}
              </h3>
              <p class="text-black/70 font-semibold text-sm truncate">
                @{{ user.username }}
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
                'bg-goldenrod text-black': user.role === 'Vendedor'
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

    <!-- Loading State -->
    <div v-if="isLoading" class="retro-panel-yellow text-center py-12 flex flex-col items-center justify-center gap-4">
      <div class="relative w-16 h-16">
        <div class="w-16 h-16 rounded-full border-8 border-crimson/20 border-t-8 border-t-crimson animate-spin"></div>
        <div class="absolute inset-0 m-auto w-4 h-4 bg-golden-title rounded-full border-2 border-black"></div>
      </div>
      <p class="text-2xl font-black text-crimson uppercase tracking-wider animate-pulse">Cargando...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredUsers.length === 0" class="retro-panel-yellow text-center py-12">
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

            <form class="space-y-4" @submit.prevent>
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
                <label for="u-username" class="block text-golden-title font-extrabold text-sm mb-1">Nombre de Usuario</label>
                <input
                  id="u-username"
                  v-model="formModel.username"
                  type="text"
                  placeholder="ej. dmedina"
                  class="retro-input"
                  required
                />
              </div>

              <div>
                <label for="u-password" class="block text-golden-title font-extrabold text-sm mb-1">
                  Contraseña {{ isEditing ? '(dejar en blanco para no cambiar)' : '' }}
                </label>
                <input
                  id="u-password"
                  v-model="formModel.password"
                  type="password"
                  placeholder="••••••••"
                  class="retro-input"
                  :required="!isEditing"
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
import { ref, computed, onMounted } from 'vue';
import type { User } from '../types';
import { api } from '../services/api';

const users = ref<User[]>([]);
const isLoading = ref(true);

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
  username: '',
  role: 'Vendedor',
  status: 'Activo',
  password: ''
});
const formModel = ref<User>(initialFormState());

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const rawUsers = await api.get<any[]>('/api/v1/users');
    users.value = rawUsers.map(u => ({
      id: String(u.id),
      name: u.fullName,
      email: u.username + '@ayurami.com',
      username: u.username,
      role: u.role === 'ayurami-admin' ? 'Administrador' : 'Vendedor',
      status: u.isActive ? 'Activo' : 'Inactivo',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + u.username
    }));
  } catch (err: any) {
    console.error('Error fetching users:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});

// Filtered Computed Lists
const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchQuery.value.toLowerCase());
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
  formModel.value = { ...user, password: '' };
  showForm.value = true;
};

const deleteUser = async (id: string) => {
  // Check if trying to delete default admin
  const userToDelete = users.value.find(u => u.id === id);
  if (userToDelete && userToDelete.username === 'admin') {
    alert('No se puede eliminar el administrador principal del sistema.');
    return;
  }

  if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
    try {
      await api.delete(`/api/v1/users/${id}`);
      await fetchUsers();
    } catch (err: any) {
      alert('Error al eliminar usuario: ' + err.message);
    }
  }
};

const saveUser = async () => {
  const model = formModel.value;
  if (!model.name.trim()) {
    formError.value = 'El nombre es obligatorio.';
    return;
  }
  if (!model.username || !model.username.trim()) {
    formError.value = 'El nombre de usuario es obligatorio.';
    return;
  }
  if (!isEditing.value && !model.password) {
    formError.value = 'La contraseña es obligatoria para nuevos usuarios.';
    return;
  }

  try {
    const payload = {
      fullName: model.name,
      username: model.username,
      role: model.role === 'Administrador' ? 'ayurami-admin' : 'ayurami-salesperson',
      isActive: model.status === 'Activo',
      password: model.password || ''
    };

    if (isEditing.value) {
      await api.put(`/api/v1/users/${model.id}`, payload);
    } else {
      await api.post('/api/v1/users', payload);
    }
    await fetchUsers();
    closeForm();
  } catch (err: any) {
    formError.value = err.message || 'Error al guardar el usuario.';
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
</style>
