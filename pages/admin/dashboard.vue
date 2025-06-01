<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">Welcome, Admin</span>
            <button @click="logout" class="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Total Therapists</h3>
            <p class="text-3xl font-bold text-blue-600">{{ stats.totalTherapists }}</p>
          </div>
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Active Clients</h3>
            <p class="text-3xl font-bold text-green-600">{{ stats.activeClients }}</p>
          </div>
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Pending Worksheets</h3>
            <p class="text-3xl font-bold text-orange-600">{{ stats.pendingWorksheets }}</p>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Therapist Management</h2>
            <button @click="showAddTherapist = true" class="btn-primary">
              Add Therapist
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clients
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="therapist in therapists" :key="therapist.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ therapist.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ therapist.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ therapist.clientCount || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="therapist.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ therapist.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button @click="editTherapist(therapist)" class="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </button>
                    <button @click="toggleTherapistStatus(therapist)" 
                            :class="therapist.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'">
                      {{ therapist.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Therapist Modal -->
    <div v-if="showAddTherapist" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Therapist</h3>
          <form @submit.prevent="addTherapist" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input v-model="newTherapist.name" type="text" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input v-model="newTherapist.email" type="email" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input v-model="newTherapist.password" type="password" required class="input-field" />
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddTherapist = false" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="loading" class="btn-primary">
                {{ loading ? 'Adding...' : 'Add Therapist' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Therapist Modal -->
    <div v-if="showEditTherapist" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Therapist</h3>
          <form @submit.prevent="updateTherapist" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input v-model="editingTherapist.name" type="text" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input v-model="editingTherapist.email" type="email" required class="input-field" />
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showEditTherapist = false" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="loading" class="btn-primary">
                {{ loading ? 'Updating...' : 'Update Therapist' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const showAddTherapist = ref(false)
const showEditTherapist = ref(false)
const loading = ref(false)
const stats = ref({
  totalTherapists: 0,
  activeClients: 0,
  pendingWorksheets: 0
})
const therapists = ref([])
const newTherapist = ref({
  name: '',
  email: '',
  password: ''
})
const editingTherapist = ref({
  id: '',
  name: '',
  email: ''
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/')
}

async function addTherapist() {
  loading.value = true
  try {
    await $fetch('/api/admin/therapists', {
      method: 'POST',
      body: newTherapist.value
    })
    showAddTherapist.value = false
    newTherapist.value = { name: '', email: '', password: '' }
    await loadData()
  } catch (error) {
    console.error('Failed to add therapist:', error)
  } finally {
    loading.value = false
  }
}

async function editTherapist(therapist) {
  editingTherapist.value = { ...therapist }
  showEditTherapist.value = true
}

async function updateTherapist() {
  loading.value = true
  try {
    await $fetch(`/api/admin/therapists/${editingTherapist.value.id}`, {
      method: 'PATCH',
      body: {
        name: editingTherapist.value.name,
        email: editingTherapist.value.email
      }
    })
    showEditTherapist.value = false
    editingTherapist.value = { id: '', name: '', email: '' }
    await loadData()
  } catch (error) {
    console.error('Failed to update therapist:', error)
  } finally {
    loading.value = false
  }
}

async function toggleTherapistStatus(therapist) {
  try {
    await $fetch(`/api/admin/therapists/${therapist.id}`, {
      method: 'PATCH',
      body: { isActive: !therapist.isActive }
    })
    await loadData()
  } catch (error) {
    console.error('Failed to update therapist status:', error)
  }
}

async function loadData() {
  try {
    const [therapistsData, statsData] = await Promise.all([
      $fetch('/api/admin/therapists'),
      $fetch('/api/admin/stats')
    ])
    therapists.value = therapistsData
    stats.value = statsData
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>