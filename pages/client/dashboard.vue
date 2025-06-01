<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">My Worksheets</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">Hello, {{ client?.name }}</span>
            <button @click="logout" class="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Assigned Worksheets -->
        <div class="card mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Assigned Worksheets</h2>
          
          <div class="space-y-4">
            <div v-for="worksheet in assignedWorksheets" :key="worksheet.id" 
                 class="p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900">{{ worksheet.templateTitle }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ worksheet.templateDescription }}</p>
                  <p class="text-xs text-gray-500 mt-2">
                    Assigned: {{ formatDate(worksheet.assignedAt) }}
                  </p>
                </div>
                <button 
                  @click="startWorksheet(worksheet)" 
                  class="btn-primary"
                  :disabled="worksheet.status === 'completed'"
                >
                  {{ worksheet.status === 'completed' ? 'Completed' : 
                     worksheet.status === 'in_progress' ? 'Continue' : 'Start' }}
                </button>
              </div>
            </div>

            <div v-if="assignedWorksheets.length === 0" class="text-center text-gray-500 py-8">
              No worksheets assigned yet
            </div>
          </div>
        </div>

        <!-- Completed Worksheets -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Completed Worksheets</h2>
          
          <div class="space-y-4">
            <div v-for="worksheet in completedWorksheets" :key="worksheet.id" 
                 class="p-4 bg-green-50 rounded-lg">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900">{{ worksheet.templateTitle }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ worksheet.templateDescription }}</p>
                  <div class="text-xs text-gray-500 mt-2">
                    <p>Completed: {{ formatDate(worksheet.completedAt) }}</p>
                    <p v-if="worksheet.reviewedAt">
                      Reviewed: {{ formatDate(worksheet.reviewedAt) }}
                    </p>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button @click="viewWorksheet(worksheet)" class="btn-secondary text-sm">
                    View
                  </button>
                  <span v-if="worksheet.status === 'reviewed'" 
                        class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Reviewed
                  </span>
                </div>
              </div>
            </div>

            <div v-if="completedWorksheets.length === 0" class="text-center text-gray-500 py-8">
              No completed worksheets yet
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const client = ref(null)
const assignedWorksheets = ref([])
const completedWorksheets = ref([])

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/')
}

function startWorksheet(worksheet) {
  navigateTo(`/client/worksheets/${worksheet.id}`)
}

function viewWorksheet(worksheet) {
  navigateTo(`/client/worksheets/${worksheet.id}/view`)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

async function loadData() {
  try {
    const [assigned, completed] = await Promise.all([
      $fetch('/api/client/worksheets/assigned'),
      $fetch('/api/client/worksheets/completed')
    ])
    assignedWorksheets.value = assigned
    completedWorksheets.value = completed
  } catch (error) {
    console.error('Failed to load worksheets:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>