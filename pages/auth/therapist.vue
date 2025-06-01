<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Therapist Login</h1>
        <p class="text-gray-600">Sign in with your email and password</p>
      </div>

      <div class="card">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input-field"
              placeholder="therapist@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full btn-primary"
          >
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>

          <div v-if="error" class="text-red-600 text-sm text-center">
            {{ error }}
          </div>
        </form>
      </div>

      <div class="text-center mt-6">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/therapist/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    
    if (response.success) {
      await navigateTo('/therapist/dashboard')
    }
  } catch (err) {
    error.value = err.data?.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>