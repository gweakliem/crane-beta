<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Therapist Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">Welcome, {{ user?.name }}</span>
            <button @click="logout" class="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Total Clients</h3>
            <p class="text-3xl font-bold text-blue-600">{{ stats.totalClients }}</p>
          </div>
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Pending Reviews</h3>
            <p class="text-3xl font-bold text-orange-600">{{ stats.pendingReviews }}</p>
          </div>
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Completed This Week</h3>
            <p class="text-3xl font-bold text-green-600">{{ stats.completedThisWeek }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Clients Management -->
          <div class="card">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Clients</h2>
              <button @click="showAddClient = true" class="btn-primary">
                Add Client
              </button>
            </div>

            <div class="space-y-4">
              <div v-for="client in clients" :key="client.id" 
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 class="font-medium text-gray-900">{{ client.name }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ client.email || client.phone || 'No contact info' }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button @click="viewClient(client)" class="text-blue-600 hover:text-blue-800 text-sm">
                    View
                  </button>
                  <button @click="assignWorksheet(client)" class="text-green-600 hover:text-green-800 text-sm">
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Worksheet Reviews -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Pending Reviews</h2>
            
            <div class="space-y-4">
              <div v-for="worksheet in pendingWorksheets" :key="worksheet.id" 
                   class="p-4 bg-gray-50 rounded-lg">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium text-gray-900">{{ worksheet.templateTitle }}</h3>
                    <p class="text-sm text-gray-600">Client: {{ worksheet.clientName }}</p>
                    <p class="text-xs text-gray-500">
                      Completed: {{ formatDate(worksheet.completedAt) }}
                    </p>
                  </div>
                  <button @click="reviewWorksheet(worksheet)" class="btn-primary text-sm">
                    Review
                  </button>
                </div>
              </div>

              <div v-if="pendingWorksheets.length === 0" class="text-center text-gray-500 py-8">
                No pending reviews
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Client Modal -->
    <div v-if="showAddClient" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Client</h3>
          <form @submit.prevent="addClient" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input v-model="newClient.name" type="text" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
              <input v-model="newClient.email" type="email" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
              <input v-model="newClient.phone" type="tel" class="input-field" />
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddClient = false" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="loading" class="btn-primary">
                {{ loading ? 'Adding...' : 'Add Client' }}
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

const user = ref(null)
const showAddClient = ref(false)
const loading = ref(false)
const stats = ref({
  totalClients: 0,
  pendingReviews: 0,
  completedThisWeek: 0
})
const clients = ref([])
const pendingWorksheets = ref([])
const newClient = ref({
  name: '',
  email: '',
  phone: ''
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/')
}

async function addClient() {
  loading.value = true
  try {
    await $fetch('/api/therapist/clients', {
      method: 'POST',
      body: newClient.value
    })
    showAddClient.value = false
    newClient.value = { name: '', email: '', phone: '' }
    await loadData()
  } catch (error) {
    console.error('Failed to add client:', error)
  } finally {
    loading.value = false
  }
}

function viewClient(client) {
  navigateTo(`/therapist/clients/${client.id}`)
}

function assignWorksheet(client) {
  navigateTo(`/therapist/worksheets/assign?clientId=${client.id}`)
}

function reviewWorksheet(worksheet) {
  navigateTo(`/therapist/worksheets/${worksheet.id}/review`)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

async function loadData() {
  try {
    const [clientsData, worksheetsData, statsData] = await Promise.all([
      $fetch('/api/therapist/clients'),
      $fetch('/api/therapist/worksheets/pending'),
      $fetch('/api/therapist/stats')
    ])
    clients.value = clientsData
    pendingWorksheets.value = worksheetsData
    stats.value = statsData
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>