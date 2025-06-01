<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
        <p class="text-gray-600">Enter your email to receive a login code</p>
      </div>

      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="!otpSent">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input-field"
              placeholder="admin@example.com"
            />
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full btn-primary mt-4"
            >
              {{ loading ? 'Sending...' : 'Send Login Code' }}
            </button>
          </div>

          <div v-else>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit code
            </label>
            <input
              id="code"
              v-model="code"
              type="text"
              maxlength="6"
              required
              class="input-field text-center text-lg tracking-wider"
              placeholder="123456"
            />
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full btn-primary mt-4"
            >
              {{ loading ? 'Verifying...' : 'Verify Code' }}
            </button>
            <button 
              type="button"
              @click="resetForm"
              class="w-full btn-secondary mt-2"
            >
              Use Different Email
            </button>
          </div>

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
const code = ref('')
const otpSent = ref(false)
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    if (!otpSent.value) {
      await $fetch('/api/auth/admin/send-otp', {
        method: 'POST',
        body: { identifier: email.value, type: 'email' }
      })
      otpSent.value = true
    } else {
      const response = await $fetch('/api/auth/admin/verify-otp', {
        method: 'POST',
        body: { identifier: email.value, code: code.value }
      })
      
      console.log('OTP verification response:', response)
      
      if (response.success) {
        console.log('OTP verified successfully, navigating to dashboard...')
        
        // Refresh the auth token cookie to ensure it's available to middleware
        const authToken = useCookie('auth-token')
        await refreshCookie('auth-token')
        
        // Small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        await navigateTo('/admin/dashboard')
      } else {
        error.value = 'Verification failed'
      }
    }
  } catch (err) {
    console.error('Admin login error:', err)
    error.value = err.data?.message || err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  otpSent.value = false
  code.value = ''
  error.value = ''
}
</script>